"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef, useState, Suspense, useCallback } from "react";
import * as THREE from "three";

// Palette (bullseye/01). Cyan/blue = 3D depth lane. Green = identity. Blood-red = atmosphere only.
const GREEN = new THREE.Color("#4ade80");
const CYAN = new THREE.Color("#00e5ff");
const BLUE = new THREE.Color("#1e3a8a");
const BLOOD = new THREE.Color("#5c0a0a");

export interface HeroProject {
  slug: string;
  name: string;
  tagline: string;
  metric?: string;
  stack?: string[];
}

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------------------------
// 1. Shared particle field — cyan/blue core, sparse green motes, blood-red edge.
//    The SAME positions feed the dissolve burst (unified-canvas rule, bullseye/02).
// ---------------------------------------------------------------------------
function useField(count = 3500) {
  return useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const r = 42 * Math.cbrt(Math.random());
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(p) * Math.cos(t);
      const y = r * Math.sin(p) * Math.sin(t);
      const z = r * Math.cos(p);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      const edge = r / 42; // 0 center -> 1 edge
      const roll = Math.random();
      if (roll > 0.94) c.copy(GREEN); // sparse green motes
      else if (edge > 0.78) c.copy(BLUE).lerp(BLOOD, (edge - 0.78) / 0.22 * 0.7);
      else c.copy(CYAN).lerp(BLUE, edge);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors, count };
  }, [count]);
}

function ParticleField({
  positions,
  colors,
}: {
  positions: Float32Array;
  colors: Float32Array;
}) {
  const ref = useRef<THREE.Points>(null!);
  const still = useMemo(() => reduced(), []);
  useFrame((_, dt) => {
    if (ref.current && !still) ref.current.rotation.y += dt * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        vertexColors
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ---------------------------------------------------------------------------
// 2. Ambient cosmos — one slow distant planet, off to the side, never occluding.
// ---------------------------------------------------------------------------
function AmbientCosmos() {
  const planet = useRef<THREE.Mesh>(null!);
  const still = useMemo(() => reduced(), []);
  useFrame((_, dt) => {
    if (planet.current && !still) planet.current.rotation.y += dt * 0.02;
  });
  return (
    <mesh ref={planet} position={[-24, 9, -34]}>
      <sphereGeometry args={[3, 24, 24]} />
      <meshStandardMaterial
        color="#1e3a8a"
        emissive="#0a1430"
        emissiveIntensity={0.4}
        roughness={1}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// 3. Project card — frosted translucent front, tilts toward cursor, flips on hover.
// ---------------------------------------------------------------------------
function ProjectCard({
  project,
  position,
  dim,
  onSelect,
}: {
  project: HeroProject;
  position: [number, number, number];
  dim: boolean;
  onSelect: (p: HeroProject, pos: THREE.Vector3) => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const { pointer } = useThree();
  const still = useMemo(() => reduced(), []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    const targetY = still ? 0 : pointer.x * 0.25 + (hovered ? Math.PI : 0);
    const targetX = still ? 0 : -pointer.y * 0.18;
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetY, 0.1);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetX, 0.1);
    const s = hovered ? 1.06 : 1;
    g.scale.x = THREE.MathUtils.lerp(g.scale.x, s, 0.1);
    g.scale.y = THREE.MathUtils.lerp(g.scale.y, s, 0.1);
  });

  const glow = hovered ? GREEN : CYAN;

  return (
    <group
      ref={group}
      position={position}
      visible={!dim}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(project, new THREE.Vector3(...position));
      }}
    >
      {/* frosted front face */}
      <mesh>
        <planeGeometry args={[2.6, 3.4]} />
        <meshPhysicalMaterial
          color="#0e1a1a"
          transparent
          opacity={0.32}
          roughness={0.6}
          transmission={0.6}
          emissive={glow}
          emissiveIntensity={hovered ? 0.5 : 0.22}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* edge glow frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[2.74, 3.54]} />
        <meshBasicMaterial color={glow} transparent opacity={hovered ? 0.35 : 0.16} />
      </mesh>
      {/* HTML label overlay (front + flipped back) */}
      <Html
        center
        transform
        distanceFactor={6}
        position={[0, 0, 0.05]}
        style={{ pointerEvents: "none", width: 230 }}
      >
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            textAlign: "center",
            color: "#e5e7eb",
            userSelect: "none",
          }}
        >
          {hovered ? (
            <>
              <div style={{ color: "#00e5ff", fontSize: 13, marginBottom: 8 }}>
                {project.metric ?? project.tagline}
              </div>
              <div style={{ fontSize: 10, color: "#9ca3af", lineHeight: 1.5 }}>
                {(project.stack ?? []).slice(0, 5).join(" · ")}
              </div>
            </>
          ) : (
            <>
              <div style={{ color: "#4ade80", fontSize: 15, fontWeight: 600 }}>
                {project.name}
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                {project.tagline}
              </div>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. Dissolve burst — transient Points sampled from the SAME field positions.
// ---------------------------------------------------------------------------
function Burst({
  origin,
  source,
  onDone,
}: {
  origin: THREE.Vector3;
  source: Float32Array;
  onDone: () => void;
}) {
  const ref = useRef<THREE.Points>(null!);
  const start = useRef<number | null>(null);
  const N = 600;

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(N * 3);
    const velocities = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // seed from the background field so the card scatters into the same stars
      const s = (Math.floor(Math.random() * (source.length / 3)) * 3) % source.length;
      const dir = new THREE.Vector3(
        source[s] || Math.random() - 0.5,
        source[s + 1] || Math.random() - 0.5,
        source[s + 2] || Math.random() - 0.5,
      ).normalize();
      positions[i * 3] = origin.x + (Math.random() - 0.5) * 1.2;
      positions[i * 3 + 1] = origin.y + (Math.random() - 0.5) * 1.6;
      positions[i * 3 + 2] = origin.z;
      velocities[i * 3] = dir.x * (4 + Math.random() * 6);
      velocities[i * 3 + 1] = dir.y * (4 + Math.random() * 6);
      velocities[i * 3 + 2] = dir.z * (4 + Math.random() * 6);
    }
    return { positions, velocities };
  }, [origin, source]);

  useFrame((state) => {
    if (start.current === null) start.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - start.current;
    const geo = ref.current?.geometry;
    if (!geo) return;
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < N * 3; i++) arr[i] += velocities[i] * 0.016;
    geo.attributes.position.needsUpdate = true;
    const mat = ref.current.material as THREE.PointsMaterial;
    mat.opacity = Math.max(0, 1 - t / 0.8);
    if (t >= 0.8) onDone();
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.12} color="#4ade80" transparent opacity={1} sizeAttenuation />
    </points>
  );
}

// ---------------------------------------------------------------------------
// 5. The one canvas.
// ---------------------------------------------------------------------------
export default function HeroScene({
  projects,
  onRoute,
}: {
  projects: HeroProject[];
  onRoute: (slug: string) => void;
}) {
  const { positions, colors } = useField();
  const [burst, setBurst] = useState<{ slug: string; pos: THREE.Vector3 } | null>(
    null,
  );
  const arc: [number, number, number][] = [
    [-6, 0, 0],
    [-2, 0.6, 1.2],
    [2, 0.6, 1.2],
    [6, 0, 0],
  ];

  const handleSelect = useCallback(
    (p: HeroProject, pos: THREE.Vector3) => {
      if (reduced()) {
        onRoute(p.slug);
        return;
      }
      setBurst({ slug: p.slug, pos });
    },
    [onRoute],
  );

  return (
    <Canvas
      style={{ background: "#0a0a0a" }}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 12], fov: 60 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#00e5ff" />
      <Suspense fallback={null}>
        <AmbientCosmos />
        <ParticleField positions={positions} colors={colors} />
        {projects.slice(0, 4).map((p, i) => (
          <ProjectCard
            key={p.slug}
            project={p}
            position={arc[i]}
            dim={burst?.slug === p.slug}
            onSelect={handleSelect}
          />
        ))}
        {burst && (
          <Burst
            origin={burst.pos}
            source={positions}
            onDone={() => onRoute(burst.slug)}
          />
        )}
      </Suspense>
      <EffectComposer>
        <Bloom intensity={0.55} luminanceThreshold={0.25} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
