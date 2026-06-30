"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Brain intro for Mind Map (PRD 6.2). A blue particle brain pulses; after 5s
 * (or on click) the particles scatter/fade and we hand off to the force graph.
 * Built as a procedural brain-shaped point cloud (copper-sulphate blue) — the
 * essence (particle brain dissolving into stars) preserved; the scatter+fade
 * hand-off is the PRE-AUTHORIZED fallback per PRD 6.2 (not a true GPU morph).
 */

function brainPositions(count: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const v = new THREE.Vector3();
  const noise = (x: number, y: number, z: number) =>
    Math.sin(x * 3.1 + y * 1.7) * Math.cos(z * 2.3 - y * 1.1) +
    0.5 * Math.sin(x * 6.2 - z * 4.1);

  for (let i = 0; i < count; i++) {
    const cerebellum = Math.random() < 0.16;
    // random direction (gaussian-ish on a sphere)
    v.set(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
    ).normalize();

    let x: number, y: number, z: number;
    if (cerebellum) {
      // small lobe at back-bottom
      const r = 0.55 + 0.12 * noise(v.x * 4, v.y * 4, v.z * 4);
      x = v.x * r * 0.7;
      y = v.y * r * 0.6 - 0.85;
      z = v.z * r * 0.7 - 1.0;
    } else {
      // two cerebral hemispheres: ellipsoid (longer front-back), folded surface
      const hemi = i % 2 === 0 ? 1 : -1;
      const fold = 1 + 0.13 * noise(v.x * 5, v.y * 5, v.z * 5);
      x = v.x * 1.0 * fold + hemi * 0.16;
      y = v.y * 0.92 * fold + 0.15;
      z = v.z * 1.28 * fold;
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    seeds[i] = Math.random();
  }
  return { positions, seeds };
}

const vertexShader = `
  uniform float uTime; uniform float uScatter; uniform float uReduced;
  attribute float aSeed; varying float vY; varying float vSeed;
  void main(){
    vec3 p = position;
    vec3 dir = normalize(position + vec3(0.0001));
    // gentle breathing pulse (skipped when reduced)
    p += dir * sin(uTime * 1.5 + aSeed * 6.28) * 0.02 * (1.0 - uReduced);
    // scatter outward + upward drift on expand
    p += dir * uScatter * (2.5 + aSeed * 5.0);
    p.y += uScatter * uScatter * 4.0 * aSeed;
    vY = position.y; vSeed = aSeed;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.6 + aSeed * 1.8) * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

const fragmentShader = `
  uniform float uScatter; uniform vec3 uTop; uniform vec3 uBot;
  varying float vY; varying float vSeed;
  void main(){
    vec2 xy = gl_PointCoord - 0.5;
    float l = length(xy);
    if (l > 0.5) discard;
    float a = smoothstep(0.5, 0.0, l);
    vec3 col = mix(uBot, uTop, smoothstep(-1.0, 1.3, vY) * (0.6 + 0.4 * vSeed));
    gl_FragColor = vec4(col, a * (1.0 - uScatter) * 0.95);
  }`;

function BrainPoints({
  scattering,
  reduced,
  onScattered,
}: {
  scattering: boolean;
  reduced: boolean;
  onScattered: () => void;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const done = useRef(false);
  const { positions, seeds } = useMemo(() => brainPositions(14000), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScatter: { value: 0 },
      uReduced: { value: 0 },
      uTop: { value: new THREE.Color("#7cc7ff") },
      uBot: { value: new THREE.Color("#1e3a8a") },
    }),
    [],
  );

  useFrame((state, dt) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.uTime.value = state.clock.elapsedTime;
    u.uReduced.value = reduced ? 1 : 0;
    if (groupRef.current && !reduced) groupRef.current.rotation.y += dt * 0.12;
    if (scattering) {
      u.uScatter.value = Math.min(1, u.uScatter.value + dt * 1.3);
      if (u.uScatter.value >= 0.999 && !done.current) {
        done.current = true;
        onScattered();
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[0.1, 0, 0]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

export default function BrainIntro({ onComplete }: { onComplete: () => void }) {
  const reduced = useReducedMotion();
  const [scattering, setScattering] = useState(false);

  // Auto-expand after 5s (PRD 6.2). Reduced motion / mobile hand off quickly.
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
    const auto = setTimeout(() => setScattering(true), 5000);
    return () => clearTimeout(auto);
  }, [reduced, onComplete]);

  return (
    <div
      className="absolute inset-0 cursor-pointer"
      onClick={() => !reduced && setScattering(true)}
      role="button"
      aria-label="Enter the mind map"
    >
      <Canvas camera={{ position: [0, 0, 5.2], fov: 50 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <Suspense fallback={null}>
          <BrainPoints
            scattering={scattering}
            reduced={reduced}
            onScattered={onComplete}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
