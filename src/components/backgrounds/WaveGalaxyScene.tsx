"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Wave Galaxy (blue) — spiral galaxy of drifting particles (PRD 5.3: About +
 * Chatbot backgrounds). Built from the master prompt + reference image: blue
 * spiral arms of stars on black, slow rotation, soft additive glow.
 */
export function WaveGalaxyScene({ count = 7000 }: { count?: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const inner = new THREE.Color("#9bdcff");
    const outer = new THREE.Color("#1e3a8a");
    const arms = 3;
    const radiusMax = 9;
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const radius = Math.pow(Math.random(), 0.7) * radiusMax;
      const branch = (i % arms) / arms;
      const spin = radius * 0.55;
      const scatter = Math.pow(Math.random(), 2) * (Math.random() < 0.5 ? 1 : -1);
      const angle = branch * Math.PI * 2 + spin;
      const spread = (0.18 + radius * 0.05) * scatter;
      positions[i * 3] = Math.cos(angle) * radius + spread * 3;
      positions[i * 3 + 1] = scatter * (0.5 + radius * 0.04) * 1.2;
      positions[i * 3 + 2] = Math.sin(angle) * radius + spread * 3;
      c.copy(inner).lerp(outer, radius / radiusMax);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.y += dt * 0.04;
  });

  return (
    <group rotation={[0.5, 0, 0]}>
      <points ref={ref} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.045}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
