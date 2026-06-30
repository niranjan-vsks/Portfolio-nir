"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Flow Wave (green) — faithful R3F port of template_repos/.../flow-wave
 * (the `FlowWave` simplex-noise point sheet). Used as the page background for
 * Project pages + Dashboard (PRD 5.3). Essence preserved: additive green points
 * over a noise sheet of rolling hills that stream toward the camera, with a
 * cursor "void" repel. Adapted from scroll-driven to a calm ambient background.
 */

const SNOISE = `
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
    vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }`;

const vertexShader = `
  uniform float uTime; uniform float uStream; uniform float uSize; uniform float uWaveHeight;
  uniform float uFlow; uniform float uScale; uniform vec3 uColLow; uniform vec3 uColHigh;
  uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
  varying float vFade; varying vec3 vColor;
  ${SNOISE}
  void main() {
    vec3 wp = vec3(position.x * 13.0, 0.0, position.z * 25.0);
    wp.x += position.y * 6.0;
    float zc = wp.z + uStream;
    float wn = snoise(vec3(wp.x * 0.08, zc * 0.08, uTime * 0.15 * uFlow)) * 2.0;
    wn += snoise(vec3(wp.x * 0.16, zc * 0.16, uTime * 0.3 * uFlow)) * 0.8;
    wp.y += wn * uWaveHeight;
    vec3 finalPos = wp * uScale;
    vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
    vec3 toP = modelPosition.xyz - uCursor;
    float cd = length(toP);
    float fall = smoothstep(uRepelRadius, 0.0, cd);
    modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
    vec4 mvPosition = viewMatrix * modelPosition;
    float colMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
    vColor = mix(uColLow, uColHigh, clamp(colMix, 0.0, 1.0));
    vFade = 1.0;
    gl_PointSize = uSize * (10.0 / -mvPosition.z);
    gl_PointSize = max(gl_PointSize, 1.5);
    gl_Position = projectionMatrix * mvPosition;
  }`;

const fragmentShader = `
  uniform float uOpacity; uniform float uBrightness; uniform float uAppear;
  varying float vFade; varying vec3 vColor;
  void main() {
    vec2 xy = gl_PointCoord - 0.5;
    float ll = length(xy);
    if (ll > 0.5) discard;
    float a = smoothstep(0.5, 0.1, ll);
    gl_FragColor = vec4(vColor * uBrightness, vFade * a * uOpacity * uAppear);
  }`;

export function FlowWaveScene() {
  const reduced = useReducedMotion();
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const groupRef = useRef<THREE.Group>(null!);
  const { camera } = useThree();
  const stream = useRef(0);
  const appearStart = useRef<number | null>(null);
  const cursorWorld = useRef(new THREE.Vector3());
  const activity = useRef(0);

  const geometry = useMemo(
    () => new THREE.SphereGeometry(4.2, 160, 480),
    [],
  );

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uStream: { value: 0 },
      uAppear: { value: 0 },
      uColLow: { value: new THREE.Color("#02160c") },
      uColHigh: { value: new THREE.Color("#34e89a") },
      uOpacity: { value: 0.28 },
      uSize: { value: 5.5 },
      uBrightness: { value: 0.5 },
      uWaveHeight: { value: 3 },
      uFlow: { value: 1 },
      uScale: { value: 0.275 },
      uCursor: { value: new THREE.Vector3() },
      uRepelRadius: { value: 7 },
      uRepelStrength: { value: 0.9 },
      uActivity: { value: 0 },
    }),
    [],
  );

  useFrame((state, dt) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    const t = state.clock.elapsedTime;
    u.uTime.value = t;

    if (!reduced) {
      stream.current += Math.min(0.05, dt) * 8;
      u.uStream.value = stream.current;
    }

    // pointer "void": project the NDC pointer onto the z=0 plane
    const p = state.pointer;
    const ndc = new THREE.Vector3(p.x, p.y, 0.5).unproject(camera);
    const dir = ndc.sub(camera.position).normalize();
    const tt = -camera.position.z / dir.z;
    const target =
      Number.isFinite(tt) && tt > 0
        ? camera.position.clone().addScaledVector(dir, tt)
        : new THREE.Vector3();
    cursorWorld.current.lerp(target, 0.12);
    const moving = Math.abs(p.x) + Math.abs(p.y) > 0.001;
    activity.current += ((moving && !reduced ? 1 : 0) - activity.current) * 0.06;
    u.uCursor.value.copy(cursorWorld.current);
    u.uActivity.value = activity.current;

    if (appearStart.current === null) appearStart.current = t;
    u.uAppear.value = Math.min(1, Math.max(0, (t - appearStart.current - 0.2) / 1.4));

    if (groupRef.current) groupRef.current.rotation.x = -0.15;
  });

  return (
    <group ref={groupRef} position={[0, -1.4, 0]}>
      <points frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
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
