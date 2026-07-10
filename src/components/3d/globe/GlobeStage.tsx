"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stars, Center, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Landing globe + orbit (PRD 9.1, feedback 2026-07-08/09). The terminal cards
 * live INSIDE the globe's 3D scene as occludable Html, so the OPAQUE earth hides
 * cards passing behind it — a real orbit in space, not cards trapped in a bubble.
 * Earth = real Ascend planet.glb (opaque), mid-sized; dense high-res starfield;
 * globe spins on its own axis while the card ring revolves around it.
 */
useGLTF.preload("/models/planet.glb");

export interface OrbitItem {
  label: string;
  caption: string;
  path: string;
  href?: string;
  onClick?: () => void;
}

function CardFace({ item, active, typed }: { item: OrbitItem; active: boolean; typed: string }) {
  return (
    <div
      className={`w-[220px] overflow-hidden rounded-xl border bg-neutral-900/95 shadow-2xl transition-all duration-300 ${
        active ? "border-green/50 shadow-[0_0_36px_-8px_rgba(74,222,128,0.55)]" : "border-neutral-800"
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-800/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-1.5 truncate font-mono text-[10.5px] text-neutral-400">~/{item.path}</span>
      </div>
      <div className="p-4 font-mono text-[12px] leading-relaxed">
        <div><span className="text-emerald-400">$ cat</span> <span className="text-cyan-300">section.yml</span></div>
        <div><span className="text-sky-400">name:</span> <span className="font-semibold text-white">{item.label}</span></div>
        <div className="my-1.5 text-neutral-600">---</div>
        <div className="min-h-[2.5rem] text-neutral-300">
          {active ? typed : item.caption}
          {active && typed.length < item.caption.length && (
            <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-neutral-300" />
          )}
        </div>
      </div>
    </div>
  );
}

function Planet({ reduced }: { reduced: boolean }) {
  const { scene } = useGLTF("/models/planet.glb");
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((n) => {
      const m = n as THREE.Mesh;
      if (m.isMesh && m.material) {
        const mat = m.material as THREE.MeshStandardMaterial;
        mat.transparent = false; // OPAQUE earth (feedback)
        mat.depthWrite = true;
        mat.opacity = 1;
      }
    });
    return c;
  }, [scene]);
  const ref = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.y += dt * 0.05;
  });
  return (
    <group ref={ref}>
      {/* GLB node scale is 9.76 (base radius 1); Center recenters but does NOT
          rescale, so this primitive scale sets the true world radius ~1.12 —
          a mid-sized planet the camera (z 6.2) sits well outside of. */}
      <Center>
        <primitive object={cloned} scale={0.115} />
      </Center>
    </group>
  );
}

function Atmosphere() {
  const uniforms = useMemo(() => ({ uGlow: { value: new THREE.Color("#3a6cff") }, uRim: { value: new THREE.Color("#c1faff") } }), []);
  return (
    <mesh scale={1.16}>
      <sphereGeometry args={[1.0, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(mat3(modelMatrix)*normal); vec4 wp=modelMatrix*vec4(position,1.0); vV=normalize(cameraPosition-wp.xyz); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`uniform vec3 uGlow; uniform vec3 uRim; varying vec3 vN; varying vec3 vV; void main(){ float f=pow(1.0-abs(dot(vN,vV)),3.0); gl_FragColor=vec4(mix(uGlow,uRim,f), f*0.75); }`}
      />
    </mesh>
  );
}

function Orbit({ items, radius = 3.1 }: { items: OrbitItem[]; radius?: number }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const group = useRef<THREE.Group>(null!);
  const globeRef = useRef<THREE.Mesh>(null!);
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [typed, setTyped] = useState("");
  const angle = useRef(0);
  const target = useRef(0);

  // auto-advance
  useEffect(() => {
    if (reduced || paused) return;
    const id = setInterval(() => setActive((a) => a + 1), 4200);
    return () => clearInterval(id);
  }, [reduced, paused]);

  // typewriter for the active caption
  useEffect(() => {
    const cap = items[((active % n) + n) % n].caption;
    if (reduced) { setTyped(cap); return; }
    setTyped("");
    let i = 0;
    const id = setInterval(() => { i++; setTyped(cap.slice(0, i)); if (i >= cap.length) clearInterval(id); }, 28);
    return () => clearInterval(id);
  }, [active, items, n, reduced]);

  useFrame(() => {
    target.current = -active * ((Math.PI * 2) / n);
    angle.current += (target.current - angle.current) * 0.08;
    if (group.current) group.current.rotation.y = angle.current;
  });

  const open = () => {
    const it = items[((active % n) + n) % n];
    if (it.onClick) it.onClick();
    else if (it.href) router.push(it.href);
  };

  return (
    <group>
      {/* occluder matching the globe: paints nothing (colorWrite off) but stays
          raycastable so drei's Html occlude hides cards passing behind it */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[1.12, 32, 32]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <group
        ref={group}
        onPointerOver={() => setPaused(true)}
        onPointerOut={() => setPaused(false)}
      >
        {items.map((item, i) => {
          const a = (i / n) * Math.PI * 2;
          const isActive = ((i - active) % n + n) % n === 0;
          return (
            <Html
              key={item.label}
              position={[Math.sin(a) * radius, 0, Math.cos(a) * radius]}
              center
              distanceFactor={4.1}
              occlude={[globeRef]}
              zIndexRange={[20, 0]}
              style={{ pointerEvents: "auto", transition: "opacity 0.3s" }}
            >
              <button
                onClick={() => (isActive ? open() : setActive(i))}
                aria-label={item.label}
                className="block"
                style={{ opacity: isActive ? 1 : 0.55, transform: `scale(${isActive ? 1 : 0.9})`, transition: "opacity .3s, transform .3s" }}
              >
                <CardFace item={item} active={isActive} typed={typed} />
              </button>
            </Html>
          );
        })}
      </group>

      {/* controls */}
      <Html position={[-radius - 0.6, 0, 0]} center>
        <button onClick={() => setActive((a) => a - 1)} aria-label="Previous" className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1.5 text-text-dim backdrop-blur hover:text-green">‹</button>
      </Html>
      <Html position={[radius + 0.6, 0, 0]} center>
        <button onClick={() => setActive((a) => a + 1)} aria-label="Next" className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1.5 text-text-dim backdrop-blur hover:text-green">›</button>
      </Html>
    </group>
  );
}

export default function GlobeStage({ items }: { items: OrbitItem[] }) {
  const reduced = useReducedMotion();
  return (
    <Canvas camera={{ position: [0, 0.3, 6.2], fov: 42 }} dpr={[1, 1.8]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        <ambientLight intensity={1.7} />
        <directionalLight position={[3, 6, 4]} intensity={1.1} />
        {/* dense, layered high-res starfield */}
        <Stars radius={120} depth={60} count={7000} factor={3.5} saturation={0} fade speed={reduced ? 0 : 0.4} />
        <Stars radius={80} depth={40} count={1600} factor={7} saturation={0} fade speed={reduced ? 0 : 0.25} />
        <group rotation={[0.16, 0, 0.06]}>
          <Planet reduced={reduced} />
          <Atmosphere />
          <Orbit items={items} />
        </group>
      </Suspense>
    </Canvas>
  );
}
