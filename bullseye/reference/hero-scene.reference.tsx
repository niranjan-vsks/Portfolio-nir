// bullseye/reference/hero-scene.reference.tsx
//
// REFERENCE SKELETON for the unified Cinematic hero (bullseye/03 + 02 unified-canvas rule).
// This is a STARTING POINT, not finished code. It exists so you do not invent the
// shared-particle architecture from scratch and get it wrong on the first pass.
// Port the Vanta field + interactive-card mechanic into THIS single canvas.
// One <Canvas>. One particle buffer. Cards + burst + ambient elements all live inside it.

'use client'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'
import { EffectComposer, Bloom } from '@react-three/postprocessing'

// ---- Palette (from bullseye/01) ----
const BG = '#0A0A0A'
const GREEN = '#4ADE80'
const CYAN = '#00E5FF'

type Project = { slug: string; name: string; tagline: string; image: string }

// ============================================================
// 1. SHARED PARTICLE FIELD (Vanta port) — ALSO the burst source
// ============================================================
// Port remix-vanta-digital-atelier's particle generation here. The SAME
// positions array is reused by the burst, so a card dissolves into these stars.
function useParticleField(count = 4000) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // distribute in a soft sphere/volume (replace with Vanta's distribution)
      const r = 40 * Math.cbrt(Math.random())
      const t = Math.random() * Math.PI * 2
      const p = Math.acos(2 * Math.random() - 1)
      positions[i * 3] = r * Math.sin(p) * Math.cos(t)
      positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t)
      positions[i * 3 + 2] = r * Math.cos(p)
    }
    return positions
  }, [count])
}

function ParticleField({ positions }: { positions: Float32Array }) {
  const ref = useRef<THREE.Points>(null!)
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.01 })
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/* recolor to cyan/blue family; add faint blood-red atmospheric falloff in the shader */}
      <pointsMaterial size={0.08} color={CYAN} transparent opacity={0.8} sizeAttenuation />
    </points>
  )
}

// ============================================================
// 2. PROJECT CARD (port interactive-3d-card mechanic) — tilt + frosted image
// ============================================================
// Port tilt + flip + glow from remix-interactive-3d-card-with into THIS mesh.
// Kill the rainbow HSL cycle -> constrain glow to green<->cyan.
// Front face: frosted/translucent; inner plane holds project.image, sharpened on hover.
function ProjectCard({
  project, position, onSelect,
}: { project: Project; position: [number, number, number]; onSelect: (p: Project) => void }) {
  const group = useRef<THREE.Group>(null!)
  const [hovered, setHovered] = useState(false)
  const { pointer } = useThree()
  const tex = useMemo(() => new THREE.TextureLoader().load(project.image), [project.image])

  useFrame(() => {
    if (!group.current) return
    // mouse-tilt toward cursor (NO orbit)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.3, 0.1)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.2, 0.1)
  })

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => onSelect(project)}
    >
      {/* inner image plane (revealed/sharpened on hover) */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[2.4, 3.2]} />
        <meshBasicMaterial map={tex} transparent opacity={hovered ? 1 : 0.35} />
      </mesh>
      {/* frosted translucent front */}
      <mesh>
        <planeGeometry args={[2.6, 3.4]} />
        <meshPhysicalMaterial
          transparent opacity={0.25} roughness={0.6} transmission={0.6}
          color={'#0e1a1a'}
          emissive={new THREE.Color(hovered ? GREEN : CYAN)}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>
      {/* TODO: project name + tagline text (drei <Text>), flip-to-back for metric + stack */}
    </group>
  )
}

// ============================================================
// 3. CARD-DISSOLVE BURST — reuses the field's particles
// ============================================================
// On select: scatter particles sampled from the SAME field around the card position,
// animate outward (~800ms), then route. Implement as a transient Points that reads
// from `positions`. Left as a hook point here.
function useDissolveBurst(positions: Float32Array) {
  // return a trigger(cardPosition, onDone) that spawns + animates burst particles
  // drawn from `positions`, so it visually dissolves into the background field.
  return (_pos: THREE.Vector3, onDone: () => void) => { setTimeout(onDone, 800) }
}

// ============================================================
// 4. AMBIENT ASTRONOMICAL ELEMENTS — sparse, slow, low-poly, behind cards
// ============================================================
function AmbientCosmos() {
  const planet = useRef<THREE.Mesh>(null!)
  useFrame((_, dt) => { if (planet.current) planet.current.rotation.y += dt * 0.02 })
  return (
    <>
      {/* distant slow planet, off to one side, never occluding cards */}
      <mesh ref={planet} position={[-22, 8, -30]}>
        <sphereGeometry args={[3, 24, 24]} />
        <meshStandardMaterial color={'#1E3A8A'} emissive={'#0a1430'} emissiveIntensity={0.4} roughness={1} />
      </mesh>
      {/* TODO: occasional low-poly asteroid / satellite drifting across the far field every 30-60s */}
    </>
  )
}

// ============================================================
// 5. THE ONE CANVAS
// ============================================================
export default function HeroScene({ projects, onRoute }: { projects: Project[]; onRoute: (slug: string) => void }) {
  const positions = useParticleField()
  const burst = useDissolveBurst(positions)
  const arc: [number, number, number][] = [[-6, 0, 0], [-2, 0.5, 1], [2, 0.5, 1], [6, 0, 0]]

  const handleSelect = (p: Project) => {
    // trigger burst at the card, then route
    burst(new THREE.Vector3(...(arc[projects.indexOf(p)] ?? [0, 0, 0])), () => onRoute(p.slug))
  }

  return (
    <Canvas
      style={{ background: BG }}
      dpr={[1, 2]}                       // cap pixelRatio (perf rule)
      camera={{ position: [0, 0, 12], fov: 60 }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <Suspense fallback={null}>
        <AmbientCosmos />
        <ParticleField positions={positions} />
        {projects.slice(0, 4).map((p, i) => (
          <ProjectCard key={p.slug} project={p} position={arc[i]} onSelect={handleSelect} />
        ))}
      </Suspense>
      <EffectComposer>
        <Bloom intensity={0.6} luminanceThreshold={0.2} mipmapBlur />
      </EffectComposer>
    </Canvas>
  )
}

// INTEGRATION NOTES
// - Lazy-load this via next/dynamic ssr:false; show a terminal-styled loader.
// - Disable below 768px (render the fallback from bullseye/03).
// - Freeze all useFrame motion under prefers-reduced-motion.
// - Replace the placeholder particle distribution + card materials with the actual
//   ported Vanta + interactive-card code from template_repos.
// - The burst MUST sample from `positions` (the same field), not a new system.
