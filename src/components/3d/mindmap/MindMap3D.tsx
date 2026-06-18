// app/components/mindmap/MindMap3D.tsx
//
// v2 — adds employer nodes, system_design destination, full click-routing
// for every node type. SSR-safe via 'use client' + dynamic import in parent.

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d'
import * as THREE from 'three'
import { useRouter } from 'next/navigation'
import mindmapData from '@data/mindmap-data.json'

type NodeType = 'root' | 'employer' | 'domain' | 'project' | 'system_design' | 'skill'

interface MindMapNode {
  id: string
  label: string
  group: string
  type: NodeType
  val: number
  color: string
  description?: string
  href?: string
  status?: 'live' | 'piloted' | 'in_development' | 'history'
  tenure?: string
  framing?: string
  x?: number
  y?: number
  z?: number
}

interface MindMapLink {
  source: string | MindMapNode
  target: string | MindMapNode
}

interface Props {
  initiallyPaused?: boolean
  mobileBreakpoint?: number
}

function buildChildMap(links: MindMapLink[]): Map<string, string[]> {
  const map = new Map<string, string[]>()
  for (const l of links) {
    const s = typeof l.source === 'string' ? l.source : l.source.id
    const t = typeof l.target === 'string' ? l.target : l.target.id
    if (!map.has(s)) map.set(s, [])
    map.get(s)!.push(t)
  }
  return map
}

function collectSkillDescendants(
  rootId: string,
  childMap: Map<string, string[]>,
  nodesById: Map<string, MindMapNode>
): Set<string> {
  const result = new Set<string>()
  const children = childMap.get(rootId) ?? []
  for (const c of children) {
    const n = nodesById.get(c)
    if (n?.type === 'skill') result.add(c)
  }
  return result
}

export default function MindMap3D({
  initiallyPaused = false,
  mobileBreakpoint = 768,
}: Props) {
  const router = useRouter()
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [paused, setPaused] = useState(initiallyPaused)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set())
  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) setPaused(true)
    const handler = (e: MediaQueryListEvent) => setPaused(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setDimensions({ width, height })
        setIsBelowBreakpoint(width < mobileBreakpoint)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [mobileBreakpoint])

  useEffect(() => {
    const fg = fgRef.current
    if (!fg) return
    if (paused) fg.pauseAnimation()
    else fg.resumeAnimation()
  }, [paused])

  const { nodesById, childMap, rawNodes, rawLinks } = useMemo(() => {
    const rawNodes = (mindmapData as any).nodes as MindMapNode[]
    const rawLinks = (mindmapData as any).links as MindMapLink[]
    const nodesById = new Map(rawNodes.map((n) => [n.id, n]))
    const childMap = buildChildMap(rawLinks)
    return { nodesById, childMap, rawNodes, rawLinks }
  }, [])

  const { graphData } = useMemo(() => {
    const hidden = new Set<string>()
    for (const domainId of collapsedDomains) {
      const skills = collectSkillDescendants(domainId, childMap, nodesById)
      skills.forEach((s) => {
        // Only hide a skill if ALL its domain parents are collapsed
        const skillNode = nodesById.get(s)
        if (!skillNode) return
        const parents = rawLinks
          .filter((l) => {
            const tgt = typeof l.target === 'string' ? l.target : (l.target as MindMapNode).id
            return tgt === s
          })
          .map((l) => (typeof l.source === 'string' ? l.source : (l.source as MindMapNode).id))
        const domainParents = parents.filter((p) => nodesById.get(p)?.type === 'domain')
        if (domainParents.every((dp) => collapsedDomains.has(dp))) hidden.add(s)
      })
    }
    const visibleNodes = rawNodes.filter((n) => !hidden.has(n.id))
    const visibleLinks = rawLinks.filter((l) => {
      const s = typeof l.source === 'string' ? l.source : (l.source as MindMapNode).id
      const t = typeof l.target === 'string' ? l.target : (l.target as MindMapNode).id
      return !hidden.has(s) && !hidden.has(t)
    })
    return { graphData: { nodes: visibleNodes, links: visibleLinks } }
  }, [collapsedDomains, rawNodes, rawLinks, childMap, nodesById])

  const onNodeClick = useCallback(
    (node: MindMapNode) => {
      if (node.type === 'root') return // no-op at center

      if (node.type === 'domain') {
        setCollapsedDomains((prev) => {
          const next = new Set(prev)
          if (next.has(node.id)) next.delete(node.id)
          else next.add(node.id)
          return next
        })
        return
      }

      // Every other node type routes via href
      if (node.href) {
        router.push(node.href)
        return
      }

      // Fallback: center camera (shouldn't trigger with all nodes having href)
      const fg = fgRef.current
      if (fg && node.x !== undefined) {
        const distance = 200
        const distRatio = 1 + distance / Math.hypot(node.x, node.y!, node.z!)
        fg.cameraPosition(
          { x: node.x * distRatio, y: node.y! * distRatio, z: node.z! * distRatio },
          node as any,
          1500
        )
      }
    },
    [router]
  )

  const nodeThreeObject = useCallback((node: MindMapNode) => {
    const group = new THREE.Group()
    const radius = node.val ? Math.max(2, node.val / 3) : 3
    const material = new THREE.MeshLambertMaterial({
      color: new THREE.Color(node.color || '#FFFFFF'),
      transparent: true,
      opacity: 0.92,
      emissive: new THREE.Color(node.color || '#FFFFFF'),
      emissiveIntensity: node.type === 'root' ? 0.6 : node.type === 'system_design' ? 0.45 : 0.25,
    })
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 16), material)
    group.add(sphere)

    // Label sprite
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const fontSize =
      node.type === 'root' ? 28 :
      node.type === 'employer' ? 18 :
      node.type === 'domain' ? 18 :
      node.type === 'system_design' ? 18 :
      node.type === 'project' ? 16 : 14
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`
    const lines = node.label.split('\n')
    const maxLineWidth = Math.max(...lines.map((l) => ctx.measureText(l).width))
    canvas.width = maxLineWidth + 16
    canvas.height = fontSize * lines.length * 1.4 + 8
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`
    ctx.fillStyle = '#FFFFFF'
    ctx.textBaseline = 'top'
    lines.forEach((line, i) => ctx.fillText(line, 8, 4 + i * fontSize * 1.4))
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true })
    const sprite = new THREE.Sprite(spriteMaterial)
    const aspect = canvas.width / canvas.height
    const spriteHeight =
      node.type === 'root' ? 8 :
      node.type === 'employer' || node.type === 'domain' || node.type === 'system_design' ? 5 :
      node.type === 'project' ? 4.5 : 3.5
    sprite.scale.set(spriteHeight * aspect, spriteHeight, 1)
    sprite.position.set(0, radius + spriteHeight / 2 + 1, 0)
    group.add(sprite)

    return group
  }, [])

  if (isBelowBreakpoint) {
    return (
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px] flex items-center justify-center p-8 text-center"
        style={{ background: '#0A0A0A', color: '#9CA3AF', fontFamily: 'JetBrains Mono, monospace' }}
      >
        <div>
          <p className="text-sm mb-3" style={{ color: '#4ADE80' }}>
            &gt; MAP_MODE.unavailable_on_mobile
          </p>
          <p className="text-xs">
            The 3D mind map is best experienced on desktop. Browse projects below, or open this page on a wider screen.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ background: '#0A0A0A', minHeight: 600 }}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setPaused((p) => !p)}
          className="px-3 py-1.5 text-xs font-mono border rounded transition"
          style={{
            background: 'rgba(10,10,10,0.7)',
            borderColor: paused ? '#FF006E' : '#4ADE80',
            color: paused ? '#FF006E' : '#4ADE80',
          }}
        >
          {paused ? '▶ resume_physics' : '⏸ pause_physics'}
        </button>
        {collapsedDomains.size > 0 && (
          <button
            onClick={() => setCollapsedDomains(new Set())}
            className="px-3 py-1.5 text-xs font-mono border rounded"
            style={{
              background: 'rgba(10,10,10,0.7)',
              borderColor: '#00E5FF',
              color: '#00E5FF',
            }}
          >
            ↺ expand_all
          </button>
        )}
      </div>

      {hoverNodeId && (
        <div
          className="absolute bottom-4 left-4 z-10 max-w-md p-3 font-mono text-xs border rounded"
          style={{
            background: 'rgba(10,10,10,0.92)',
            borderColor: 'rgba(74,222,128,0.4)',
            color: '#E5E7EB',
          }}
        >
          {(() => {
            const node = nodesById.get(hoverNodeId)
            if (!node) return null
            const clickHint =
              node.type === 'project' ? '> click_to_enter_project' :
              node.type === 'domain' ? `> click_to_${collapsedDomains.has(node.id) ? 'expand' : 'collapse'}` :
              node.type === 'employer' ? '> click_to_view_experience' :
              node.type === 'system_design' ? '> click_to_view_reference_architectures' :
              node.type === 'skill' ? '> click_to_filter_by_skill' :
              ''
            return (
              <>
                <div style={{ color: node.color }} className="font-bold mb-1">
                  {node.label.replace('\n', ' · ')}
                </div>
                {node.tenure && (
                  <div className="text-[10px] mb-1" style={{ color: '#A78BFA' }}>
                    {node.tenure}
                  </div>
                )}
                {node.description && (
                  <div className="text-[11px] leading-relaxed" style={{ color: '#9CA3AF' }}>
                    {node.description}
                  </div>
                )}
                {clickHint && (
                  <div className="mt-1.5 text-[10px]" style={{ color: '#4ADE80' }}>
                    {clickHint}
                  </div>
                )}
              </>
            )
          })()}
        </div>
      )}

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData as any}
        width={dimensions.width}
        height={dimensions.height || 600}
        backgroundColor="#0A0A0A"
        showNavInfo={false}
        nodeThreeObject={nodeThreeObject as any}
        nodeLabel={() => ''}
        linkColor={() => 'rgba(74,222,128,0.25)'}
        linkWidth={(l: any) => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id
          const tId = typeof l.target === 'string' ? l.target : l.target.id
          return sId === hoverNodeId || tId === hoverNodeId ? 1.8 : 0.4
        }}
        linkOpacity={0.55}
        onNodeClick={onNodeClick as any}
        onNodeHover={(n: any) => setHoverNodeId(n?.id ?? null)}
        cooldownTicks={paused ? 0 : 200}
        warmupTicks={20}
        d3VelocityDecay={0.4}
      />
    </div>
  )
}
