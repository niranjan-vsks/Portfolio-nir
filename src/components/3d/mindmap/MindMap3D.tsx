// app/components/mindmap/MindMap3D.tsx
//
// v2 — adds employer nodes, system_design destination, full click-routing
// for every node type. SSR-safe via 'use client' + dynamic import in parent.

'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph3D, { ForceGraphMethods } from 'react-force-graph-3d'
import * as THREE from 'three'
import { useRouter, useSearchParams } from 'next/navigation'
import mindmapData from '@data/mindmap-data.json'

// one shared radial-glow texture behind every node (premium halo, not a flat dot)
let GLOW_TEXTURE: THREE.Texture | null = null
function glowTexture() {
  if (GLOW_TEXTURE) return GLOW_TEXTURE
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, 'rgba(255,255,255,0.9)')
  grad.addColorStop(0.25, 'rgba(255,255,255,0.35)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 128, 128)
  GLOW_TEXTURE = new THREE.CanvasTexture(c)
  return GLOW_TEXTURE
}

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
  const searchParams = useSearchParams()
  const deepLinkId = searchParams.get('node')
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [paused, setPaused] = useState(initiallyPaused)
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null)
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null)
  const [collapsedDomains, setCollapsedDomains] = useState<Set<string>>(new Set())
  const [isBelowBreakpoint, setIsBelowBreakpoint] = useState(false)

  // the node whose neighbourhood is lit: hover wins, else the pinned/deep-linked one
  const activeId = hoverNodeId ?? pinnedNodeId
  const activeIdRef = useRef<string | null>(null)

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

  const { nodesById, childMap, rawNodes, rawLinks, adjacency } = useMemo(() => {
    const rawNodes = (mindmapData as any).nodes as MindMapNode[]
    const rawLinks = (mindmapData as any).links as MindMapLink[]
    const nodesById = new Map(rawNodes.map((n) => [n.id, n]))
    const childMap = buildChildMap(rawLinks)
    const adjacency = new Map<string, Set<string>>()
    for (const l of rawLinks) {
      const s = typeof l.source === 'string' ? l.source : l.source.id
      const t = typeof l.target === 'string' ? l.target : l.target.id
      if (!adjacency.has(s)) adjacency.set(s, new Set())
      if (!adjacency.has(t)) adjacency.set(t, new Set())
      adjacency.get(s)!.add(t)
      adjacency.get(t)!.add(s)
    }
    return { nodesById, childMap, rawNodes, rawLinks, adjacency }
  }, [])

  const isLit = useCallback(
    (id: string) => {
      const a = activeIdRef.current
      if (!a) return true // nothing focused: everything at full strength
      return id === a || (adjacency.get(a)?.has(id) ?? false)
    },
    [adjacency]
  )

  // re-render node objects when the focus changes so glow/dim states update
  useEffect(() => {
    activeIdRef.current = activeId
    fgRef.current?.refresh()
  }, [activeId])

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

  // fly the camera to a node and light its neighbourhood (deep-link + tag chips)
  const focusNode = useCallback(
    (id: string) => {
      const fg = fgRef.current
      const node = (graphData.nodes as MindMapNode[]).find((n) => n.id === id)
      if (!fg || !node || node.x === undefined) return
      setPinnedNodeId(id)
      const dist = 90
      const hyp = Math.hypot(node.x, node.y ?? 0, node.z ?? 0) || 1
      const r = 1 + dist / hyp
      fg.cameraPosition(
        { x: (node.x ?? 0) * r, y: (node.y ?? 0) * r, z: (node.z ?? 0) * r },
        node as any,
        1400
      )
    },
    [graphData]
  )

  // consume ?node=<id> once the force layout has produced coordinates
  const deepLinkDoneRef = useRef(false)
  const handleEngineStop = useCallback(() => {
    if (deepLinkDoneRef.current) return
    deepLinkDoneRef.current = true
    if (deepLinkId && nodesById.has(deepLinkId)) {
      focusNode(deepLinkId)
    } else {
      // brain hand-off was landing too zoomed out: fit the graph tight
      fgRef.current?.zoomToFit(900, 40)
    }
  }, [deepLinkId, focusNode, nodesById])

  // Click contract (Right_Now fixes, 2026-07-11 — ABSOLUTELY no 404s):
  //  - node with a dedicated page (href to a verified route) -> route, no
  //    second thoughts (data layer only carries verified hrefs now);
  //    EXCEPT domains, whose job is to gather subnodes -> zoom+focus.
  //  - node without a page (all skills, domains) -> fly the camera in and
  //    pin its neighbourhood highlight; user can still orbit/pan to the rest.
  const onNodeClick = useCallback(
    (node: MindMapNode) => {
      if (node.type === 'root') return // no-op at center
      if (node.type !== 'domain' && node.href) {
        router.push(node.href)
        return
      }
      focusNode(node.id)
    },
    [router, focusNode]
  )

  // prefetch a hovered node's route so the focused click lands instantly
  useEffect(() => {
    if (!hoverNodeId) return
    const href = nodesById.get(hoverNodeId)?.href
    if (href) router.prefetch(href)
  }, [hoverNodeId, nodesById, router])

  const nodeThreeObject = useCallback((node: MindMapNode) => {
    const group = new THREE.Group()
    const lit = isLit(node.id)
    const focused = activeIdRef.current === node.id
    const radius = (node.val ? Math.max(2, node.val / 3) : 3) * (focused ? 1.35 : 1)
    const color = new THREE.Color(node.color || '#FFFFFF')

    const material = new THREE.MeshLambertMaterial({
      color,
      transparent: true,
      opacity: lit ? 0.96 : 0.22,
      emissive: color,
      emissiveIntensity:
        (node.type === 'root' ? 0.6 : node.type === 'system_design' ? 0.5 : 0.32) *
        (focused ? 1.8 : lit ? 1 : 0.3),
    })
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(radius, 20, 20), material)
    group.add(sphere)

    // soft radial glow halo so nodes read as lights, not flat dots
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTexture(),
        color,
        transparent: true,
        opacity: lit ? (focused ? 0.85 : 0.5) : 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
    const glowScale = radius * (focused ? 6 : 4.5)
    glow.scale.set(glowScale, glowScale, 1)
    group.add(glow)

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
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: lit ? 1 : 0.28 })
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
  }, [isLit])

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
      style={{ background: 'transparent', minHeight: 600 }}
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

      {activeId && (() => {
        const node = nodesById.get(activeId)
        if (!node) return null
        const clickHint =
          node.type === 'project' ? 'click → open project' :
          node.type === 'domain' ? 'click → zoom into this branch' :
          node.type === 'employer' ? 'click → view experience' :
          node.type === 'system_design' ? 'click → reference architectures' :
          node.type === 'skill' ? 'click → focus this neighbourhood' :
          ''
        return (
          <div
            key={activeId}
            className="pointer-events-none absolute left-6 top-1/2 z-10 w-[340px] max-w-[38vw] -translate-y-1/2 animate-[fadeIn_0.25s_ease] rounded-2xl border p-5 backdrop-blur-md"
            style={{
              background: 'rgba(6,10,20,0.82)',
              borderColor: 'rgba(74,222,128,0.35)',
              boxShadow: '0 20px 60px -20px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wide" style={{ color: '#6b7280' }}>
              {node.type.replace('_', ' ')}
            </div>
            <div className="mb-2 text-[19px] font-semibold leading-tight text-white">
              {node.label.replace('\n', ' · ')}
            </div>
            {node.tenure && (
              <div className="mb-2 font-mono text-[12px]" style={{ color: '#A78BFA' }}>{node.tenure}</div>
            )}
            {node.description && (
              <p className="text-[14px] leading-relaxed text-neutral-300">{node.description}</p>
            )}
            {clickHint && (
              <div className="mt-3 font-mono text-[12px]" style={{ color: '#4ADE80' }}>{clickHint}</div>
            )}
          </div>
        )
      })()}

      <ForceGraph3D
        ref={fgRef}
        graphData={graphData as any}
        width={dimensions.width}
        height={dimensions.height || 600}
        backgroundColor="rgba(0,0,0,0)"
        showNavInfo={false}
        nodeThreeObject={nodeThreeObject as any}
        nodeLabel={() => ''}
        linkColor={(l: any) => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id
          const tId = typeof l.target === 'string' ? l.target : l.target.id
          const on = activeId && (sId === activeId || tId === activeId)
          if (on) return 'rgba(74,222,128,0.9)'
          return activeId ? 'rgba(74,222,128,0.08)' : 'rgba(74,222,128,0.28)'
        }}
        linkWidth={(l: any) => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id
          const tId = typeof l.target === 'string' ? l.target : l.target.id
          return activeId && (sId === activeId || tId === activeId) ? 2.2 : 0.4
        }}
        linkDirectionalParticles={(l: any) => {
          const sId = typeof l.source === 'string' ? l.source : l.source.id
          const tId = typeof l.target === 'string' ? l.target : l.target.id
          return activeId && (sId === activeId || tId === activeId) ? 3 : 0
        }}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#4ADE80'}
        linkOpacity={0.7}
        onNodeClick={onNodeClick as any}
        onNodeHover={(n: any) => setHoverNodeId(n?.id ?? null)}
        onEngineStop={handleEngineStop}
        cooldownTicks={paused ? 0 : 200}
        warmupTicks={20}
        d3VelocityDecay={0.4}
      />
    </div>
  )
}
