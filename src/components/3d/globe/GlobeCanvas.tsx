"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stars, Center } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Globe  — ported from the a custom using its REAL
 * planet.glb asset (earth geometry + textures), lit to match the source
 * (ambient 1.8 + sun 0.8 @ 0,10,2), a blue fresnel atmosphere halo
 * (glow #3a6cff, rim #c1faff), and a star field (#cfe0ff). Fixed at centre,
 * auto-rotating on its own axis. No blue ring, no hover/scroll camera, not
 * fullscreen. This is the real planet look, not a procedural stand-in.
 */
useGLTF.preload("/models/planet.glb");

function Planet({ reduced }: { reduced: boolean }) {
  const { scene } = useGLTF("/models/planet.glb");
  const group = useRef<THREE.Group>(null!);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useFrame((_, dt) => {
    if (group.current && !reduced) group.current.rotation.y += dt * 0.06;
  });

  return (
    <group ref={group}>
      <Center>
        <primitive object={cloned} scale={2.05} />
      </Center>
    </group>
  );
}

function Atmosphere() {
  const uniforms = useMemo(
    () => ({
      uGlow: { value: new THREE.Color("#3a6cff") },
      uRim: { value: new THREE.Color("#c1faff") },
    }),
    [],
  );
  return (
    <mesh scale={2.02}>
      <sphereGeometry args={[1.35, 64, 64]} />
      <shaderMaterial
        uniforms={uniforms}
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          varying vec3 vN; varying vec3 vView;
          void main(){
            vN = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position,1.0);
            vView = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
          }`}
        fragmentShader={`
          uniform vec3 uGlow; uniform vec3 uRim; varying vec3 vN; varying vec3 vView;
          void main(){
            float f = pow(1.0 - abs(dot(vN, vView)), 2.6);
            vec3 col = mix(uGlow, uRim, f);
            gl_FragColor = vec4(col, f * 0.9);
          }`}
      />
    </mesh>
  );
}

export default function GlobeCanvas() {
  const reduced = useReducedMotion();
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 42 }}
      dpr={[1, 1.6]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[0, 10, 2]} intensity={0.9} />
        <Stars radius={90} depth={50} count={2600} factor={3.2} saturation={0} fade speed={reduced ? 0 : 0.5} />
        <group rotation={[0.2, 0, 0.08]}>
          <Planet reduced={reduced} />
          <Atmosphere />
        </group>
      </Suspense>
    </Canvas>
  );
}
