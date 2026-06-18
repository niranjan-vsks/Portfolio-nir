"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// India marker (lat ~17.4 Hyderabad, lng ~78.5) -> sphere coords.
function latLngToVec3(lat: number, lng: number, r: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function GlobeMesh() {
  const group = useRef<THREE.Group>(null);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const marker = useMemo(() => latLngToVec3(17.4, 78.5, 1.52), []);

  useFrame((_, delta) => {
    if (group.current && !reduced) group.current.rotation.y += delta * 0.12;
  });

  return (
    <group ref={group}>
      {/* core sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          color="#0a1428"
          emissive="#0a2540"
          emissiveIntensity={0.4}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      {/* lat/long wireframe in the cyan depth lane */}
      <mesh>
        <sphereGeometry args={[1.51, 24, 24]} />
        <meshBasicMaterial color="#00e5ff" wireframe transparent opacity={0.18} />
      </mesh>
      {/* atmosphere */}
      <mesh>
        <sphereGeometry args={[1.62, 48, 48]} />
        <meshBasicMaterial
          color="#1e3a8a"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
      {/* India marker (identity green) */}
      <mesh position={marker}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#4ade80" />
      </mesh>
    </group>
  );
}

export default function GlobeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 3, 5]} intensity={1.2} color="#00e5ff" />
      <GlobeMesh />
    </Canvas>
  );
}
