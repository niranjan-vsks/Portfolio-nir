"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Realistic 3D globe, built from scratch (PRD 6.3, lock #2). No external texture:
 * continents/oceans/ice + day-night terminator with city lights are generated in
 * a shader; a fresnel shell gives the atmosphere. Drag to rotate, slow auto-spin,
 * starfield in black space. Home centerpiece, the only WebGL on Home.
 */

const NOISE_GLSL = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0,0.5,1.0,2.0);
    vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + 2.0*C.xxx; vec3 x3 = x0 - 1.0 + 3.0*C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0,i1.z,i2.z,1.0)) + i.y + vec4(0.0,i1.y,i2.y,1.0)) + i.x + vec4(0.0,i1.x,i2.x,1.0));
    float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_*ns.x + ns.yyyy; vec4 y = y_*ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)), 0.0); m = m*m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }
  float fbm(vec3 p){
    float f = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ f += a * snoise(p); p *= 2.03; a *= 0.5; }
    return f;
  }`;

function EarthMesh({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uLightDir: { value: new THREE.Vector3(1, 0.3, 0.6).normalize() },
      uOcean: { value: new THREE.Color("#0c2f63") },
      uOceanDeep: { value: new THREE.Color("#06183a") },
      uLandLow: { value: new THREE.Color("#26563a") },
      uLandHigh: { value: new THREE.Color("#8a7b4f") },
      uIce: { value: new THREE.Color("#dfeaf2") },
      uCity: { value: new THREE.Color("#ffd27f") },
    }),
    [],
  );

  useFrame((state, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    if (ref.current && !reduced) ref.current.rotation.y += dt * 0.045;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2, 128, 128]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vPos; varying vec3 vNormal;
          void main(){
            vPos = position;
            vNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`}
        fragmentShader={`
          ${NOISE_GLSL}
          uniform float uTime; uniform vec3 uLightDir;
          uniform vec3 uOcean; uniform vec3 uOceanDeep; uniform vec3 uLandLow; uniform vec3 uLandHigh; uniform vec3 uIce; uniform vec3 uCity;
          varying vec3 vPos; varying vec3 vNormal;
          void main(){
            vec3 sp = normalize(vPos);
            float continent = fbm(sp * 1.8);
            float coast = smoothstep(0.02, 0.18, continent);          // 0 ocean .. 1 land
            float elev = smoothstep(0.18, 0.6, continent);
            float lat = abs(sp.y);
            float ice = smoothstep(0.78, 0.92, lat - fbm(sp*4.0)*0.06); // polar caps

            vec3 ocean = mix(uOceanDeep, uOcean, smoothstep(-0.4, 0.05, continent));
            vec3 land = mix(uLandLow, uLandHigh, elev + fbm(sp*6.0)*0.25);
            vec3 surface = mix(ocean, land, coast);
            surface = mix(surface, uIce, ice);

            float ndl = dot(normalize(vNormal), normalize(uLightDir));
            float day = smoothstep(-0.15, 0.35, ndl);                  // soft terminator
            vec3 lit = surface * (0.15 + 0.95 * day);

            // night-side city lights on land only
            float lights = step(0.6, coast) * step(0.55, fbm(sp*22.0)*0.5+0.5) * (1.0 - day);
            lit += uCity * lights * 0.9;

            // gentle specular sheen on ocean day side
            float spec = pow(max(day,0.0), 8.0) * (1.0 - coast) * 0.25;
            lit += vec3(0.6,0.8,1.0) * spec;

            gl_FragColor = vec4(lit, 1.0);
          }`}
      />
    </mesh>
  );
}

function Atmosphere() {
  return (
    <mesh scale={1.12}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        transparent
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={useMemo(
          () => ({ uColor: { value: new THREE.Color("#3aa0ff") } }),
          [],
        )}
        vertexShader={`
          varying vec3 vNormal; varying vec3 vView;
          void main(){
            vNormal = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vView = normalize(cameraPosition - wp.xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`}
        fragmentShader={`
          uniform vec3 uColor; varying vec3 vNormal; varying vec3 vView;
          void main(){
            float fres = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
            gl_FragColor = vec4(uColor, fres * 0.9);
          }`}
      />
    </mesh>
  );
}

export default function GlobeCanvas() {
  const reduced = useReducedMotion();
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.18} />
        <directionalLight position={[5, 2, 3]} intensity={1.1} />
        <Stars radius={80} depth={40} count={3500} factor={3} fade speed={reduced ? 0 : 0.6} />
        <group rotation={[0.35, 0, 0.15]}>
          <EarthMesh reduced={reduced} />
          <Atmosphere />
        </group>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!reduced}
          autoRotateSpeed={0.35}
          rotateSpeed={0.5}
          enableDamping
          dampingFactor={0.08}
        />
      </Suspense>
    </Canvas>
  );
}
