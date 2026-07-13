"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Brain intro (PRD 6.2 / 10.1) — faithful R3F port of template brain.html.
 * Samples 110k points off the real rotten-brain.glb surface (area-weighted, with
 * normals) and renders them with the ported glossy-neuron shaders (edge glow,
 * center darken, synapse firing, breathing, flow loops, cursor halo) + UnrealBloom.
 * Entrance flies in + assembles (easeOutQuart). On dissolve it scatters + fades
 * (zoom hand-off to the graph). This is the real effect, not a procedural blob.
 */

useGLTF.preload("/models/brain.glb");

const CONFIG = {
  brainCool: "#0a3f70",
  brainWarm: "#70bcff",
  edgeColor: "#1f6ae0",
  centerColor: "#000000",
  centerRadius: 0.37,
  centerFalloff: 4,
  synapseColor: "#eaf3ff",
  ambientColor: "#2b5a9c",
  particleSize: 0.067,
  ambientSize: 0.067,
  ambientCount: 3800,
  ambientSpeed: 0.03,
  ambientRange: 15.5,
  surfaceCount: 110000,
  synapseRate: 0.1,
  flowSpeed: 2.3,
  flowAmount: 0.025,
  glowStrength: 2,
  depthDarkness: 1,
  deepColor: "#010b1e",
  baseRotationY: -1.5708,
  brainZ: 1.25,
  cursorTilt: 0.22,
};

const hexToVec3 = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};

const BRAIN_VERTEX = `
  attribute float aSeed; attribute float aOcclusion; attribute vec3 aNormal;
  uniform float iTime; uniform float iResolutionY; uniform float uSize; uniform float uSynapseRate;
  uniform float uCenterRadius; uniform float uFlowSpeed; uniform float uFlowAmount;
  uniform float uExplode; uniform float uExplodeDist;
  uniform vec2 uMouse; uniform float uCursor; uniform float uAspect; uniform float uCursorRadius;
  varying float vSeed; varying float vSynapse; varying float vHemi; varying float vFrontness;
  varying float vCenterness; varying float vOcclusion; varying float vCursor; varying vec3 vWorldPos;
  void main() {
    vSeed = aSeed; vOcclusion = aOcclusion;
    vec3 p = position; vWorldPos = p; vHemi = step(0.0, p.x);
    vec3 rad = normalize(p + vec3(1e-5));
    float breathe = sin(iTime * 1.6 + aSeed * 6.0) * 0.012;
    p += rad * breathe;
    vec3 nrm = normalize(aNormal + vec3(1e-5));
    vec3 ref = abs(nrm.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tA = normalize(cross(nrm, ref));
    vec3 tB = cross(nrm, tA);
    float ph = iTime * uFlowSpeed + aSeed * 6.2831;
    vec3 loopDir = tA * cos(ph) + tB * sin(ph);
    p += loopDir * uFlowAmount;
    vec3 exDir = normalize(rad + vec3(sin(aSeed * 41.0), cos(aSeed * 57.0), sin(aSeed * 73.0)) * 0.45);
    p += exDir * uExplode * uExplodeDist;
    float period = mix(3.0, 9.0, aSeed);
    float ft = mod(iTime + aSeed * period, period);
    float fire = pow(clamp(1.0 - ft / 0.4, 0.0, 1.0), 2.5);
    if (aSeed > uSynapseRate) fire = 0.0;
    vSynapse = fire;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec4 centerMv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    float rel = centerMv.z - mv.z;
    vFrontness = clamp(rel * 0.6 + 0.5, 0.0, 1.0);
    gl_Position = projectionMatrix * mv;
    vec4 centerClip = projectionMatrix * centerMv;
    vec2 centerNDC = centerClip.xy / max(0.0001, centerClip.w);
    vec2 pNDC = gl_Position.xy / max(0.0001, gl_Position.w);
    vCenterness = 1.0 - clamp(length(pNDC - centerNDC) / max(0.05, uCenterRadius), 0.0, 1.0);
    vec2 dMouse = pNDC - uMouse; dMouse.x *= uAspect;
    vCursor = (1.0 - smoothstep(0.0, uCursorRadius, length(dMouse))) * uCursor;
    float baseSize = uSize * (iResolutionY / 720.0) * (200.0 / -mv.z);
    gl_PointSize = baseSize * (1.0 + fire * 2.5 + vCursor * 1.3);
  }
`;

const BRAIN_FRAGMENT = `
  uniform vec3 uCool; uniform vec3 uWarm; uniform vec3 uEdgeColor; uniform vec3 uCenterColor;
  uniform float uCenterFalloff; uniform vec3 uSynapse; uniform float iAlpha; uniform float uGlow;
  uniform float uDepthDarkness; uniform vec3 uDeepColor; uniform float uExplode; uniform vec3 uCursorColor;
  varying float vSeed; varying float vSynapse; varying float vHemi; varying float vFrontness;
  varying float vCenterness; varying float vOcclusion; varying float vCursor; varying vec3 vWorldPos;
  void main() {
    vec2 pc = gl_PointCoord - 0.5;
    float r = length(pc);
    if (r > 0.5) discard;
    float core = pow(smoothstep(0.5, 0.0, r), 2.2);
    float t = pow(vCenterness, max(0.05, uCenterFalloff));
    vec3 base = mix(uEdgeColor, uCenterColor, t);
    vec3 yTint = mix(uCool, uWarm, smoothstep(-0.6, 1.0, vWorldPos.y) * 0.6 + vSeed * 0.25);
    yTint = mix(yTint, yTint * vec3(0.95, 1.0, 1.05), vHemi * 0.4);
    base *= mix(vec3(1.0), yTint, 0.35);
    vec3 col = base + uSynapse * vSynapse * 2.0;
    float depthMul = mix(1.0 - uDepthDarkness, 1.0, vFrontness);
    col *= depthMul;
    float alphaOut = core * iAlpha * mix(1.0 - uDepthDarkness * 0.7, 1.0, vFrontness);
    col += uCursorColor * vCursor * 0.8;
    alphaOut += vCursor * core * 0.32;
    alphaOut *= 1.0 - smoothstep(0.0, 1.0, uExplode) * 0.8;
    gl_FragColor = vec4(col * uGlow, alphaOut);
  }
`;

const AMBIENT_VERTEX = `
  attribute vec3 aDir; attribute float aSeed;
  uniform float iTime; uniform float iResolutionY; uniform float uSize; uniform float uSpeed; uniform float uRange;
  varying float vSeed; varying float vPhase;
  void main() {
    vSeed = aSeed;
    float speed = 0.35 + aSeed * 0.9;
    float phase = fract(iTime * uSpeed * speed + aSeed);
    vPhase = phase;
    vec3 dir = normalize(aDir + vec3(1e-5));
    vec3 p = position + dir * phase * uRange;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * mix(1.0, 0.6, phase) * (iResolutionY / 720.0) * (200.0 / -mv.z);
  }
`;
const AMBIENT_FRAGMENT = `
  uniform vec3 uColor; uniform float iAlpha;
  varying float vSeed; varying float vPhase;
  void main() {
    vec2 pc = gl_PointCoord - 0.5; float r = length(pc);
    if (r > 0.5) discard;
    float k = smoothstep(0.5, 0.0, r);
    float life = smoothstep(0.0, 0.1, vPhase) * smoothstep(1.0, 0.7, vPhase);
    float twinkle = 0.5 + 0.5 * sin(vSeed * 40.0 + vPhase * 30.0);
    gl_FragColor = vec4(uColor * k * life * (0.4 + 0.6 * twinkle), k * life * iAlpha * 0.6);
  }
`;

function sampleBrain(root: THREE.Object3D, count: number) {
  const tris: number[] = [];
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  root.updateMatrixWorld(true);
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const idx = mesh.geometry.index;
    const mat = mesh.matrixWorld;
    const push = (i0: number, i1: number, i2: number) => {
      a.fromBufferAttribute(pos, i0).applyMatrix4(mat);
      b.fromBufferAttribute(pos, i1).applyMatrix4(mat);
      c.fromBufferAttribute(pos, i2).applyMatrix4(mat);
      tris.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    };
    if (idx) for (let i = 0; i < idx.count; i += 3) push(idx.array[i], idx.array[i + 1], idx.array[i + 2]);
    else for (let i = 0; i < pos.count; i += 3) push(i, i + 1, i + 2);
  });
  const tri = Float32Array.from(tris);
  const nTris = tri.length / 9;
  const areas = new Float32Array(nTris);
  let total = 0;
  const u = new THREE.Vector3(), v = new THREE.Vector3(), w = new THREE.Vector3();
  for (let i = 0; i < nTris; i++) {
    const o = i * 9;
    u.set(tri[o], tri[o + 1], tri[o + 2]);
    v.set(tri[o + 3], tri[o + 4], tri[o + 5]).sub(u);
    w.set(tri[o + 6], tri[o + 7], tri[o + 8]).sub(u);
    areas[i] = v.cross(w).length() * 0.5;
    total += areas[i];
  }
  const cdf = new Float32Array(nTris);
  let acc = 0;
  for (let i = 0; i < nTris; i++) { acc += areas[i] / total; cdf[i] = acc; }
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  for (let s = 0; s < count; s++) {
    const rr = Math.random();
    let lo = 0, hi = nTris - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cdf[mid] < rr) lo = mid + 1; else hi = mid; }
    const o = lo * 9;
    let su = Math.random(), sv = Math.random();
    if (su + sv > 1) { su = 1 - su; sv = 1 - sv; }
    const sw = 1 - su - sv;
    positions[s * 3] = sw * tri[o] + su * tri[o + 3] + sv * tri[o + 6];
    positions[s * 3 + 1] = sw * tri[o + 1] + su * tri[o + 4] + sv * tri[o + 7];
    positions[s * 3 + 2] = sw * tri[o + 2] + su * tri[o + 5] + sv * tri[o + 8];
    const e1x = tri[o + 3] - tri[o], e1y = tri[o + 4] - tri[o + 1], e1z = tri[o + 5] - tri[o + 2];
    const e2x = tri[o + 6] - tri[o], e2y = tri[o + 7] - tri[o + 1], e2z = tri[o + 8] - tri[o + 2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
    const nl = Math.hypot(nx, ny, nz) || 1;
    normals[s * 3] = nx / nl; normals[s * 3 + 1] = ny / nl; normals[s * 3 + 2] = nz / nl;
  }
  // center + scale to radius 1.45
  let cx = 0, cy = 0, cz = 0;
  for (let i = 0; i < count; i++) { cx += positions[i * 3]; cy += positions[i * 3 + 1]; cz += positions[i * 3 + 2]; }
  cx /= count; cy /= count; cz /= count;
  let maxR = 0;
  for (let i = 0; i < count; i++) {
    const dx = positions[i * 3] - cx, dy = positions[i * 3 + 1] - cy, dz = positions[i * 3 + 2] - cz;
    maxR = Math.max(maxR, Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  const k = 1.45 / Math.max(1e-6, maxR);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (positions[i * 3] - cx) * k;
    positions[i * 3 + 1] = (positions[i * 3 + 1] - cy) * k;
    positions[i * 3 + 2] = (positions[i * 3 + 2] - cz) * k;
  }
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) seeds[i] = Math.random();
  return { positions, normals, seeds };
}

function BrainPoints({ dissolving, reduced, onDissolved }: { dissolving: boolean; reduced: boolean; onDissolved: () => void }) {
  const { scene } = useGLTF("/models/brain.glb");
  const { size } = useThree();
  const group = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const appearStart = useRef<number | null>(null);
  const dissolveAmt = useRef(0);
  const doneRef = useRef(false);
  const HIDDEN_Z = -9;

  const { positions, normals, seeds, occ } = useMemo(() => {
    const s = sampleBrain(scene, CONFIG.surfaceCount);
    return { ...s, occ: new Float32Array(CONFIG.surfaceCount) };
  }, [scene]);

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 }, iAlpha: { value: 0 }, iResolutionY: { value: 720 },
      uCool: { value: hexToVec3(CONFIG.brainCool) }, uWarm: { value: hexToVec3(CONFIG.brainWarm) },
      uEdgeColor: { value: hexToVec3(CONFIG.edgeColor) }, uCenterColor: { value: hexToVec3(CONFIG.centerColor) },
      uCenterRadius: { value: CONFIG.centerRadius }, uCenterFalloff: { value: CONFIG.centerFalloff },
      uSynapse: { value: hexToVec3(CONFIG.synapseColor) }, uSize: { value: CONFIG.particleSize },
      uSynapseRate: { value: CONFIG.synapseRate }, uFlowSpeed: { value: CONFIG.flowSpeed }, uFlowAmount: { value: CONFIG.flowAmount },
      uGlow: { value: CONFIG.glowStrength }, uDepthDarkness: { value: CONFIG.depthDarkness },
      uDeepColor: { value: hexToVec3(CONFIG.deepColor) }, uExplode: { value: 1 }, uExplodeDist: { value: 5 },
      uMouse: { value: new THREE.Vector2(-10, -10) }, uCursor: { value: 0 }, uAspect: { value: 1 },
      uCursorRadius: { value: 0.1 }, uCursorColor: { value: hexToVec3("#000000") },
    }),
    [],
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const u = matRef.current?.uniforms;
    if (!u) return;
    if (appearStart.current === null) appearStart.current = t;
    const p = Math.min(1, (t - appearStart.current) / 1.0);
    const eased = 1 - Math.pow(1 - p, 4);

    // dissolve ramp (scatter + fade) on hand-off
    if (dissolving) dissolveAmt.current = Math.min(1, dissolveAmt.current + dt * 0.9);
    if (dissolveAmt.current >= 1 && !doneRef.current) { doneRef.current = true; onDissolved(); }

    if (group.current) {
      group.current.position.z = HIDDEN_Z + (CONFIG.brainZ - HIDDEN_Z) * eased;
      const px = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
      const py = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
      group.current.rotation.y = CONFIG.baseRotationY + (reduced ? 0 : px * CONFIG.cursorTilt * 0.6 + t * 0.04);
      group.current.rotation.x = reduced ? 0 : -py * CONFIG.cursorTilt * 0.4;
    }
    u.iTime.value = t;
    u.iAlpha.value = eased * (1 - dissolveAmt.current);
    u.uExplode.value = (1 - eased) + dissolveAmt.current * 1.2;
    u.uAspect.value = size.width / Math.max(1, size.height);
    u.iResolutionY.value = size.height * Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1));
    u.uMouse.value.lerp(state.pointer, 0.18);
    u.uCursor.value += ((reduced ? 0 : 1) - u.uCursor.value) * 0.1;
  });

  return (
    <group ref={group} rotation={[0, CONFIG.baseRotationY, 0]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aNormal" args={[normals, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          <bufferAttribute attach="attributes-aOcclusion" args={[occ, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={BRAIN_VERTEX}
          fragmentShader={BRAIN_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

function AmbientCloud() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const { size } = useThree();
  const { positions, dirs, seeds } = useMemo(() => {
    const n = CONFIG.ambientCount;
    const positions = new Float32Array(n * 3), dirs = new Float32Array(n * 3), seeds = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const theta = Math.random() * Math.PI * 2, phi = Math.acos(2 * Math.random() - 1), r = 1.5 + Math.random() * 0.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const dt = Math.random() * Math.PI * 2, dp = Math.acos(2 * Math.random() - 1);
      dirs[i * 3] = Math.sin(dp) * Math.cos(dt); dirs[i * 3 + 1] = Math.sin(dp) * Math.sin(dt); dirs[i * 3 + 2] = Math.cos(dp);
      seeds[i] = Math.random();
    }
    return { positions, dirs, seeds };
  }, []);
  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 }, iAlpha: { value: 0 }, iResolutionY: { value: 720 },
      uColor: { value: hexToVec3(CONFIG.ambientColor) }, uSize: { value: CONFIG.ambientSize },
      uSpeed: { value: CONFIG.ambientSpeed }, uRange: { value: CONFIG.ambientRange },
    }),
    [],
  );
  useFrame((state) => {
    const u = matRef.current?.uniforms;
    if (!u) return;
    u.iTime.value = state.clock.elapsedTime;
    u.iAlpha.value = Math.min(1, state.clock.elapsedTime / 1.2);
    u.iResolutionY.value = size.height * Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1));
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aDir" args={[dirs, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={AMBIENT_VERTEX}
        fragmentShader={AMBIENT_FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function BrainScene({
  onComplete,
  autoAdvanceMs = 4000,
}: {
  onComplete: () => void;
  autoAdvanceMs?: number;
}) {
  const reduced = useReducedMotion();
  const [dissolving, setDissolving] = useState(false);

  // auto-dissolve after autoAdvanceMs (4s first visit, ~1s on repeat landing
  // navigations per FINAL_SHOWDOWN); click also triggers. Reduced motion
  // hands off fast.
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setDissolving(true), autoAdvanceMs);
    return () => clearTimeout(t);
  }, [reduced, onComplete, autoAdvanceMs]);

  return (
    <div
      className="absolute inset-0 cursor-pointer"
      role="button"
      aria-label="Enter the mind map"
      onClick={() => !reduced && setDissolving(true)}
    >
      <Canvas
        camera={{ position: [0, 0.15, 5.2], fov: 45 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false }}
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#01040e");
          scene.fog = new THREE.Fog("#01040e", 0, 18);
        }}
      >
        <Suspense fallback={null}>
          <AmbientCloud />
          <BrainPoints dissolving={dissolving} reduced={reduced} onDissolved={onComplete} />
          <EffectComposer>
            <Bloom intensity={0.7} luminanceThreshold={0.2} radius={0.6} mipmapBlur />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
