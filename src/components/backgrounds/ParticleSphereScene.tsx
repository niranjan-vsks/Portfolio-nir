"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Particle Sphere (purple) — Contact background (PRD 5.3). Built from the master
 * prompt + reference image: a sphere shell of particles, magenta-violet at the
 * crown fading to blue at the base, gently breathing with noise, slow rotation,
 * subtle pointer parallax.
 */
const vertexShader = `
  uniform float uTime; uniform float uAmp; uniform float uReduced;
  attribute float aSeed;
  varying float vY;
  void main() {
    vec3 p = position;
    float n = sin(uTime * 0.6 + aSeed * 6.2831 + p.y * 2.0)
            + cos(uTime * 0.4 + p.x * 1.5 + aSeed * 3.0);
    p += normalize(position) * n * uAmp * (1.0 - uReduced);
    vY = normalize(position).y;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (2.6 + aSeed * 1.6) * (12.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`;

const fragmentShader = `
  uniform vec3 uTop; uniform vec3 uBottom;
  varying float vY;
  void main() {
    vec2 xy = gl_PointCoord - 0.5;
    float l = length(xy);
    if (l > 0.5) discard;
    float a = smoothstep(0.5, 0.0, l);
    vec3 col = mix(uBottom, uTop, smoothstep(-1.0, 1.0, vY));
    gl_FragColor = vec4(col, a * 0.9);
  }`;

export function ParticleSphereScene({ count = 9000 }: { count?: number }) {
  const reduced = useReducedMotion();
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const R = 4.2;
    for (let i = 0; i < count; i++) {
      // fibonacci sphere for even shell distribution
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      positions[i * 3] = Math.cos(phi) * r * R;
      positions[i * 3 + 1] = y * R;
      positions[i * 3 + 2] = Math.sin(phi) * r * R;
      seeds[i] = Math.random();
    }
    return { positions, seeds };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.28 },
      uReduced: { value: 0 },
      uTop: { value: new THREE.Color("#d946ef") },
      uBottom: { value: new THREE.Color("#2563eb") },
    }),
    [],
  );

  useFrame((state, dt) => {
    const u = matRef.current?.uniforms;
    if (u) {
      u.uTime.value = state.clock.elapsedTime;
      u.uReduced.value = reduced ? 1 : 0;
    }
    if (groupRef.current && !reduced) {
      groupRef.current.rotation.y += dt * 0.05;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        state.pointer.y * 0.2,
        0.04,
      );
    }
  });

  return (
    <group ref={groupRef}>
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
