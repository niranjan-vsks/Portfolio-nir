"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { useGLTF, Stars, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Landing globe + orbit . The terminal
 * cards live INSIDE the globe's 3D scene as occludable Html so the opaque
 * earth hides cards passing behind it. The earth itself is the FAITHFUL
 * planet renderer: day/night/city-lights/ocean-glint shader from
 * three drifting cloud shells, and a soft billboard
 * halo (which replaces the old fresnel shell — the rejected "blue ring").
 */
useGLTF.preload("/models/planet.glb");
useGLTF.preload("/models/planet-lights.glb");

export interface OrbitItem {
  label: string;
  caption: string;
  path: string;
  href?: string;
  onClick?: () => void;
}

/* ---------- planet CONFIG ( defaults) ---------- */
const CFG = {
  rimColor: "#c1faff",
  rimPower: 2.4,
  nightLights: 10,
  terrainDepth: 0.33,
  terrainShade: 1.3,
  oceanGlint: 0.45,
  oceanDeep: 0.12,
  oceanFlow: 3,
  oceanFlowSpeed: 0.8,
  oceanFlowScale: 2.1,
  glowColor: "#3a6cff",
  glowIntensity: 0.9, // template halo is a bloom feed at 3.35; without the composer this is the equivalent on-screen strength
  spin: 0.03,
  tilt: 0.37,
  cloud1Height: 1.005,
  cloud1Opacity: 0.6,
  cloud1Spin: 0.06,
  cloud2Height: 1.03,
  cloud2Opacity: 0.5,
  cloud2Spin: 0.14,
  cloud3Height: 1.075,
  cloud3Opacity: 0.5,
  cloud3Spin: 0.1,
};

const RADIUS = 1.12; // world radius of the earth in our scene

/** Seconds a card holds the front before the carousel advances. */
const DWELL_S = 4.2;
/** Seconds after the cursor leaves before the carousel steps again. */
const RESUME_S = 0.5;

/* Simplex noise */
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

function hexToVec3(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function firstMesh(obj: THREE.Object3D): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  obj.traverse((o) => {
    if (!found && (o as THREE.Mesh).isMesh) found = o as THREE.Mesh;
  });
  return found;
}

/** planet fragment-shader injection. */
function applyPlanetShader(
  material: THREE.MeshStandardMaterial,
  nightTex: THREE.Texture | null,
  planetTime: { value: number },
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.time = planetTime;
    shader.uniforms.noiseScale = { value: 30.0 };
    shader.uniforms.speedX = { value: 1.5 };
    shader.uniforms.speedY = { value: 2.0 };
    shader.uniforms.speedZ = { value: 2.5 };
    shader.uniforms.rimColor = { value: hexToVec3(CFG.rimColor) };
    shader.uniforms.rimPower = { value: CFG.rimPower };
    shader.uniforms.nightBlendTexture = { value: nightTex };
    shader.uniforms.nightLights = { value: CFG.nightLights };
    shader.uniforms.terrainDepth = { value: CFG.terrainDepth };
    shader.uniforms.terrainShade = { value: CFG.terrainShade };
    shader.uniforms.oceanGlint = { value: CFG.oceanGlint };
    shader.uniforms.oceanDeep = { value: CFG.oceanDeep };
    shader.uniforms.oceanFlow = { value: CFG.oceanFlow };
    shader.uniforms.oceanFlowSpeed = { value: CFG.oceanFlowSpeed };
    shader.uniforms.oceanFlowScale = { value: CFG.oceanFlowScale };
    material.userData.shader = shader;
    shader.vertexShader = `varying vec2 vCustomUv;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("void main() {", "void main() {\n  vCustomUv = uv;");
    shader.fragmentShader =
      `
      uniform float time; uniform float noiseScale; uniform float speedX; uniform float speedY; uniform float speedZ;
      uniform vec3 rimColor; uniform float rimPower; uniform sampler2D nightBlendTexture; uniform float nightLights;
      uniform float terrainDepth; uniform float terrainShade;
      uniform float oceanGlint; uniform float oceanDeep; uniform float oceanFlow;
      uniform float oceanFlowSpeed; uniform float oceanFlowScale;
      varying vec2 vCustomUv;
      ${SNOISE}
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
      vec3 normalizedNormal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      float rim = 1.0 - max(dot(viewDir, normalizedNormal), 0.0);
      rim = pow(rim, rimPower); rim = pow(rim, 1.5); rim *= 0.7;
      vec3 currentColor = gl_FragColor.rgb;
      float blueDom = currentColor.b - max(currentColor.r, currentColor.g);
      float waterMask = clamp(smoothstep(-0.005, 0.03, blueDom), 0.0, 1.0);
      float shimmer = snoise(vec3(vCustomUv.x * noiseScale + time * speedX, vCustomUv.y * noiseScale - time * speedY, time * speedZ));
      gl_FragColor.rgb += waterMask * shimmer * 0.025;
      float fT = time * oceanFlowSpeed * 4.0;
      float fS = 4.0 * oceanFlowScale;
      float warp = snoise(vec3(vCustomUv.x * fS - fT * 0.5, vCustomUv.y * fS + fT * 0.4, fT * 0.5));
      float flow = snoise(vec3(vCustomUv.x * fS * 2.0 + fT * 0.6 + warp, vCustomUv.y * fS * 2.0 - fT * 0.5, fT * 0.7));
      flow = warp * 0.6 + flow * 0.4;
      gl_FragColor.rgb += waterMask * flow * 0.12 * oceanFlow;
      gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.01, 0.06, 0.16), waterMask * oceanDeep);
      vec3 finalColor = mix(gl_FragColor.rgb, rimColor, rim);
      gl_FragColor = vec4(finalColor, 1.0);
      vec3 surfPos = -vViewPosition;
      float terrH = dot(texture2D(map, vCustomUv).rgb, vec3(0.299, 0.587, 0.114));
      vec3 sigX = dFdx(surfPos), sigY = dFdy(surfPos);
      vec3 vR1 = cross(sigY, normalizedNormal), vR2 = cross(normalizedNormal, sigX);
      float fDet = dot(sigX, vR1);
      vec3 vGrad = sign(fDet) * (dFdx(terrH) * vR1 + dFdy(terrH) * vR2);
      vec3 bumpedNormal = normalize(abs(fDet) * normalizedNormal - terrainDepth * vGrad);
      vec3 shadeNormal = mix(bumpedNormal, normalizedNormal, waterMask);
      vec3 cityLights = texture2D(nightBlendTexture, vCustomUv).rgb * gl_FragColor.rgb * nightLights;
      vec3 viewSunDir = normalize(vec3(-0.9, 0.18, 0.4));
      float ndl = dot(normalizedNormal, viewSunDir);
      float dayAmt = smoothstep(-0.05, 0.35, ndl);
      float relief = dot(shadeNormal, viewSunDir) - ndl;
      gl_FragColor.rgb *= clamp(1.0 + relief * terrainShade * dayAmt, 0.55, 1.6);
      float nightFactor  = smoothstep(0.18, -0.30, ndl);
      float lightsFactor = smoothstep(0.30, -0.35, ndl);
      gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.08, nightFactor);
      gl_FragColor.rgb += cityLights * lightsFactor;
      vec3 halfDir = normalize(viewSunDir + viewDir);
      float ripple = snoise(vec3(vCustomUv * 240.0, time * 4.0));
      float ndh = max(dot(normalizedNormal, halfDir) + ripple * 0.02, 0.0);
      float glint = pow(ndh, 140.0);
      gl_FragColor.rgb += glint * waterMask * dayAmt * oceanGlint * vec3(1.0, 0.97, 0.88);
    `,
    );
  };
  material.needsUpdate = true;
}

/** cloud-shell shader (three drifting layers). */
function makeCloudMaterial(
  tex: THREE.Texture,
  opacity: number,
  phase: number,
  cloudTime: { value: number },
) {
  const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, depthWrite: false });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = cloudTime;
    shader.uniforms.noiseScale = { value: 20.0 };
    shader.uniforms.uSpeedX = { value: 1.0 };
    shader.uniforms.uSpeedY = { value: 2.0 };
    shader.uniforms.uSpeedZ = { value: 2.0 };
    shader.uniforms.uOpacity = { value: opacity };
    shader.uniforms.uPhase = { value: phase };
    mat.userData.shader = shader;
    shader.vertexShader = `varying vec2 vCloudUv;\n` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace("void main() {", "void main() {\n  vCloudUv = uv;");
    shader.fragmentShader =
      `
      uniform float uTime; uniform float noiseScale; uniform float uSpeedX; uniform float uSpeedY; uniform float uSpeedZ; uniform float uOpacity; uniform float uPhase;
      varying vec2 vCloudUv;
      ${SNOISE}
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `#include <dithering_fragment>
      gl_FragColor.rgb = vec3(1.0);
      float cloudNoise = snoise(vec3(vCloudUv.x * noiseScale + uTime * uSpeedX + uPhase, vCloudUv.y * noiseScale - uTime * uSpeedY + uPhase, uTime * uSpeedZ + uPhase));
      float cloudNdv = max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0);
      float cloudEdge = pow(1.0 - cloudNdv, 3.0);
      float cloudMod = mix(cloudNoise, 1.0, cloudEdge);
      float cloudNdl = dot(normalize(vNormal), normalize(vec3(-0.9, 0.18, 0.4)));
      float cloudDay = 1.0 - smoothstep(0.30, -0.30, cloudNdl) * 0.9;
      gl_FragColor.a *= cloudMod * uOpacity * cloudDay;
    `,
    );
  };
  mat.needsUpdate = true;
  return mat;
}

function AscendPlanet({ reduced }: { reduced: boolean }) {
  const { scene: planetScene } = useGLTF("/models/planet.glb");
  const { scene: lightsScene } = useGLTF("/models/planet-lights.glb");
  const cloudTex = useLoader(THREE.TextureLoader, "/models/planet-clouds.png");
  const spinRef = useRef<THREE.Group>(null!);

  const { planet, clouds, planetTime, cloudTime } = useMemo(() => {
    // shader uniform holders; frame-advanced via timesRef (see effect below)
    const planetTime = { value: 0 };
    const cloudTime = { value: 0 };
    const tex = cloudTex.clone();
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 5);
    const lmesh = firstMesh(lightsScene);
    const lmat = lmesh?.material as THREE.MeshStandardMaterial | undefined;
    const nightTex = lmat?.map ?? null;
    const mesh = firstMesh(planetScene)!;
    mesh.geometry.computeBoundingSphere();
    const r = mesh.geometry.boundingSphere?.radius ?? 1;
    const s = RADIUS / r;
    const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
    mat.metalness = 0.0;
    mat.roughness = 1.0;
    mat.envMapIntensity = 0.0;
    applyPlanetShader(mat, nightTex, planetTime);
    const planet = new THREE.Mesh(mesh.geometry, mat);
    planet.scale.setScalar(s);

    const layers = [
      { h: CFG.cloud1Height, o: CFG.cloud1Opacity, ry: 0.0, phase: 0.0 },
      { h: CFG.cloud2Height, o: CFG.cloud2Opacity, ry: 2.2, phase: 13.0 },
      { h: CFG.cloud3Height, o: CFG.cloud3Opacity, ry: 4.3, phase: 27.0 },
    ];
    const clouds = layers.map((l) => {
      const g = new THREE.SphereGeometry(RADIUS * l.h, 64, 64);
      const m = makeCloudMaterial(tex, l.o, l.phase, cloudTime);
      const c = new THREE.Mesh(g, m);
      c.rotation.y = l.ry;
      c.renderOrder = 2;
      return c;
    });
    return { planet, clouds, planetTime, cloudTime };
  }, [planetScene, lightsScene, cloudTex]);

  const timesRef = useRef<{ p: { value: number }; c: { value: number } } | null>(null);
  useEffect(() => {
    timesRef.current = { p: planetTime, c: cloudTime };
  }, [planetTime, cloudTime]);

  const cloudRefs = useRef<(THREE.Group | null)[]>([]);
  useFrame((_, dt) => {
    if (reduced) return;
    const t = timesRef.current;
    if (t) {
      t.p.value += dt * 0.05;
      t.c.value += dt * 0.02;
    }
    if (spinRef.current) spinRef.current.rotation.y += dt * CFG.spin;
    const spins = [CFG.cloud1Spin, CFG.cloud2Spin, CFG.cloud3Spin];
    cloudRefs.current.forEach((g, i) => {
      if (g) g.rotation.y += dt * spins[i];
    });
  });

  return (
    <group rotation={[0, 0, CFG.tilt * 0.35]}>
      <group ref={spinRef}>
        <primitive object={planet} />
      </group>
      {clouds.map((c, i) => (
        <group key={i} ref={(el) => { cloudRefs.current[i] = el; }}>
          <primitive object={c} />
        </group>
      ))}
    </group>
  );
}

/** Ascend's soft radial atmosphere halo: an additive billboard plane, NOT a
    fresnel shell (the shell read as a hard "blue ring" and was rejected). */
function AtmosphereHalo() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uGlow: { value: hexToVec3(CFG.glowColor) },
          uIntensity: { value: CFG.glowIntensity },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uGlow; uniform float uIntensity; varying vec2 vUv;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), 2.2);
          gl_FragColor = vec4(uGlow * a * uIntensity, a * 0.85);
        }`,
      }),
    [],
  );
  return (
    <mesh scale={RADIUS * 2.3} material={mat} renderOrder={-1}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

/**
 * Slow parallax drift for the starfield. The stars are one point cloud each,
 * so turning a parent group is a single matrix update per frame rather than
 * per-star work: the sky reads as a live 3D volume at effectively no cost.
 */
function StarDrift({ reduced, children }: { reduced: boolean; children: ReactNode }) {
  const g = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (reduced || !g.current) return;
    g.current.rotation.y += dt * 0.01;
    g.current.rotation.x += dt * 0.0025;
  });
  return <group ref={g}>{children}</group>;
}

/**
 * Shooting stars: a few thin additive streaks that cross the far field on
 * random intervals. Deliberately sparse and parked well behind the globe, so
 * they are atmosphere rather than a centrepiece (3d-performance rules). Cost
 * is `count` small planes sharing one geometry, plus one uniform write each
 * per frame, so this is far cheaper than a full-screen looping video and it
 * keeps the parallax the flat video would have destroyed.
 */
function ShootingStars({ reduced, count = 3 }: { reduced: boolean; count?: number }) {
  const { meteors, geo } = useMemo(() => {
    const geo = new THREE.PlaneGeometry(1, 1);
    const meteors = Array.from({ length: count }, () => {
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: hexToVec3("#bfe9ff") }, // cool white, inside the 3D depth lane
          uOpacity: { value: 0 },
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform vec3 uColor; uniform float uOpacity; varying vec2 vUv;
          void main(){
            float head = pow(vUv.x, 2.0);                    // bright head, fading tail
            float across = 1.0 - abs(vUv.y - 0.5) * 2.0;     // soft along the thickness
            float a = head * across * uOpacity;
            gl_FragColor = vec4(uColor * a, a);
          }`,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.renderOrder = -2;
      return { mesh, mat, dir: new THREE.Vector2(), speed: 0, life: 0, span: 1, delay: 0 };
    });
    return { meteors, geo };
  }, [count]);

  type Meteor = (typeof meteors)[number];
  const respawn = (m: Meteor, first = false) => {
    const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5; // broadly down-and-right
    m.dir.set(Math.cos(angle), Math.sin(angle));
    m.speed = 8 + Math.random() * 5;
    m.span = 1.1 + Math.random() * 0.6;
    m.life = 0;
    // stagger the first appearance so they never all streak together
    m.delay = first ? Math.random() * 6 : 2.5 + Math.random() * 7;
    m.mesh.rotation.z = angle;
    m.mesh.scale.set(4 + Math.random() * 3, 0.16 + Math.random() * 0.08, 1);
    // Spawn inside the frustum at this depth. At z=-26 the camera sees roughly
    // x +/-26 and y +/-12.6, so starting higher than that wasted the streak's
    // bright mid-life off-screen. Start upper-left, travel down and right.
    m.mesh.position.set(-26 + Math.random() * 10, 6 + Math.random() * 6, -26);
    m.mat.uniforms.uOpacity.value = 0;
  };

  useEffect(() => {
    meteors.forEach((m) => respawn(m, true));
    return () => {
      geo.dispose();
      meteors.forEach((m) => m.mat.dispose());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meteors, geo]);

  useFrame((_, dt) => {
    if (reduced) return;
    for (const m of meteors) {
      if (m.delay > 0) {
        m.delay -= dt;
        continue;
      }
      m.life += dt;
      const t = m.life / m.span;
      if (t >= 1) {
        respawn(m);
        continue;
      }
      m.mesh.position.x += m.dir.x * m.speed * dt;
      m.mesh.position.y += m.dir.y * m.speed * dt;
      m.mat.uniforms.uOpacity.value = Math.sin(Math.PI * t); // fade in, fade out
    }
  });

  return (
    <group>
      {meteors.map((m, i) => (
        <primitive key={i} object={m.mesh} />
      ))}
    </group>
  );
}

function CardFace({ item, active, typed }: { item: OrbitItem; active: boolean; typed: string }) {
  return (
    <div
      className={`w-[220px] select-none overflow-hidden rounded-xl border bg-neutral-900/95 shadow-2xl transition-all duration-300 ${
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

function Orbit({
  items,
  radius = 3.25,
  onNavigate,
}: {
  items: OrbitItem[];
  radius?: number;
  onNavigate?: (item: OrbitItem) => void;
}) {
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

  // prefetch every card route once so the focused-card click is instant
  useEffect(() => {
    for (const it of items) if (it.href) router.prefetch(it.href);
  }, [items, router]);

  // Auto-advance is frame-accumulated rather than a setInterval, because an
  // interval is destroyed on pause and a fresh one starts on resume: the
  // carousel then sat still for up to a full dwell after the cursor left,
  // which read as "the revolving stopped and never came back".
  const dwell = useRef(0);
  const wasPaused = useRef(false);

  // Any change of card (auto, click, arrow, scroll, drag) earns a full dwell.
  useEffect(() => {
    dwell.current = 0;
  }, [active]);

  // On resume, don't make the visitor wait out a fresh dwell: the next step
  // lands shortly after the cursor leaves, so the motion visibly picks back up.
  useEffect(() => {
    if (paused) {
      wasPaused.current = true;
      return;
    }
    if (wasPaused.current) {
      wasPaused.current = false;
      dwell.current = Math.max(dwell.current, DWELL_S - RESUME_S);
    }
  }, [paused]);

  // sideways scroll / swipe to revolve the carousel (in addition to the arrows).
  // Horizontal-intent only (deltaX-dominant or shift+wheel) so it never hijacks
  // vertical scroll, and throttled so one gesture steps once.
  useEffect(() => {
    if (reduced) return;
    let lock = 0;
    const step = (dir: number) => {
      const now = Date.now();
      if (now - lock < 260) return;
      lock = now;
      setActive((a) => a + dir);
    };
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (dx > 6) step(1);
      else if (dx < -6) step(-1);
    };
    let x0: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      x0 = e.touches[0]?.clientX ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (x0 == null) return;
      const dx = (e.touches[0]?.clientX ?? x0) - x0;
      if (Math.abs(dx) > 42) {
        step(dx < 0 ? 1 : -1);
        x0 = e.touches[0]?.clientX ?? null;
      }
    };
    const onTouchEnd = () => {
      x0 = null;
    };

    // Mouse drag sideways. A click barely moves, so DRAG_PX keeps a card click
    // from also stepping the carousel. Pointerdown doubles as the "click away
    // clears a stuck text selection" fix: selecting terminal-card text and
    // then clicking the scene left the highlight stranded.
    let dragX: number | null = null;
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // leave right-click alone so copy still works
      const sel = window.getSelection?.();
      if (sel && !sel.isCollapsed) sel.removeAllRanges();
      if (e.pointerType === "mouse") dragX = e.clientX;
    };
    const DRAG_PX = 70;
    const onPointerMove = (e: PointerEvent) => {
      if (dragX == null) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > DRAG_PX) {
        step(dx < 0 ? 1 : -1);
        dragX = e.clientX;
      }
    };
    const onPointerUp = () => {
      dragX = null;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [reduced]);

  // typewriter for the active caption
  useEffect(() => {
    const cap = items[((active % n) + n) % n].caption;
    if (reduced) { setTyped(cap); return; }
    setTyped("");
    let i = 0;
    const id = setInterval(() => { i++; setTyped(cap.slice(0, i)); if (i >= cap.length) clearInterval(id); }, 28);
    return () => clearInterval(id);
  }, [active, items, n, reduced]);

  useFrame((_, dt) => {
    target.current = -active * ((Math.PI * 2) / n);
    angle.current += (target.current - angle.current) * 0.08;
    if (group.current) group.current.rotation.y = angle.current;

    if (reduced || paused) return;
    dwell.current += dt;
    if (dwell.current >= DWELL_S) {
      // Reset here, not in the [active] effect alone: useFrame runs on rAF, so
      // another frame can land before the re-render commits and would advance
      // a second time, skipping a card.
      dwell.current = 0;
      setActive((a) => a + 1);
    }
  });

  const open = (it: OrbitItem) => {
    if (it.onClick) it.onClick();
    else if (it.href) router.push(it.href);
  };

  // Click contract : out-of-focus card -> revolve it to the
  // front (never navigate); in-focus card -> navigate immediately.
  const onCard = (i: number, isActive: boolean) => {
    if (!isActive) {
      setActive((a) => a + (((i - a) % n) + n) % n); // shortest forward revolution
      return;
    }
    const it = items[i];
    if (it.onClick) it.onClick();
    else if (onNavigate) onNavigate(it); // parent shows the loader flash, then routes
    else open(it);
  };

  return (
    <group>
      {/* occluder matching the globe: paints nothing (colorWrite off) but stays
          raycastable so drei's Html occlude hides cards passing behind it */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[RADIUS, 32, 32]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {/* Pause is owned by the focused card's DOM handlers below. The group
          carried R3F onPointerOver/Out too, but those need a raycastable mesh
          and the cards are Html overlays, so they only added a second way for
          the paused flag to get stuck. */}
      <group ref={group}>
        {items.map((item, i) => {
          const a = (i / n) * Math.PI * 2;
          const isActive = ((i - active) % n + n) % n === 0;
          return (
            <Html
              key={item.label}
              position={[Math.sin(a) * radius, 0, Math.cos(a) * radius]}
              center
              distanceFactor={4.6}
              occlude={[globeRef]}
              zIndexRange={[20, 0]}
              style={{ pointerEvents: "auto", transition: "opacity 0.3s" }}
            >
              <button
                onClick={() => onCard(i, isActive)}
                onPointerEnter={() => { if (isActive) setPaused(true); }}
                onPointerLeave={() => setPaused(false)}
                aria-label={isActive ? `Open ${item.label}` : `Focus ${item.label}`}
                className="block"
                style={{
                  opacity: isActive ? 1 : 0.55,
                  transform: `scale(${isActive ? 1 : 0.88})`,
                  transition: "opacity .3s, transform .3s",
                }}
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

export default function GlobeStage({
  items,
  onNavigate,
}: {
  items: OrbitItem[];
  onNavigate?: (item: OrbitItem) => void;
}) {
  const reduced = useReducedMotion();
  return (
    <Canvas camera={{ position: [0, 0.3, 6.8], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
      <Suspense fallback={null}>
        {/* a custom lighting */}
        <ambientLight intensity={1.8} />
        <directionalLight position={[0, 10, 2]} intensity={0.8} />
        {/* dense, layered high-res starfield, drifting so the sky is not a
            static backdrop; meteors cross it now and then */}
        <StarDrift reduced={reduced}>
          <Stars radius={120} depth={60} count={7000} factor={3.5} saturation={0} fade speed={reduced ? 0 : 0.4} />
          <Stars radius={80} depth={40} count={1600} factor={7} saturation={0} fade speed={reduced ? 0 : 0.25} />
        </StarDrift>
        <ShootingStars reduced={reduced} />
        {/* halo sits outside the tilted group so its camera billboard stays valid */}
        <AtmosphereHalo />
        <group rotation={[0.16, 0, 0.06]}>
          <AscendPlanet reduced={reduced} />
          <Orbit items={items} onNavigate={onNavigate} />
        </group>
      </Suspense>
    </Canvas>
  );
}
