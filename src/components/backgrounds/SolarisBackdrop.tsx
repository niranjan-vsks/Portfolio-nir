"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

/**
 * Solaris contact background (PRD R9 / DG-3), faithful port of
 * template_repos/textura_templates/solaris/solaris.html: breathing particle
 * sun (dense SphereGeometry as Points, Simplex deformation, fresnel hollow
 * core, cursor solar-flare), fBm corner aurora, UnrealBloom, intro dolly.
 * Surgical deltas only: the demo UI panel + localStorage were dropped, and
 * motion freezes under prefers-reduced-motion.
 */

const CONFIG = {
  colorWarm: "#ff4c33",
  colorCool: "#3366ff",
  bloomStrength: 1.64,
  bloomRadius: 1.14,
  bloomThreshold: 0.04,
  noiseSpeed: 1.41,
  introSeconds: 2.4,
  cameraDistance: 10.8,
  cursorRadius: 2.0,
  cursorFlare: 1.4,
  cursorHeat: 1.0,
};

const BG_VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position, 1.0); }`;

const BG_FRAG = `
uniform float uTime; uniform float uScroll; uniform vec2 uResolution;
uniform vec3 color1; uniform vec3 color2; varying vec2 vUv;
float hash(float n) { return fract(sin(n) * 1e4); }
float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
float noise(vec2 x) {
    vec2 i = floor(x); vec2 f = fract(x);
    float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
#define OCTAVES 4
float fbm(vec2 x) {
    float v = 0.0; float a = 0.5; vec2 shift = vec2(100);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < OCTAVES; ++i) { v += a * noise(x); x = rot * x * 2.0 + shift; a *= 0.5; }
    return v;
}
void main() {
    vec2 st = vUv; st.x *= uResolution.x / uResolution.y;
    float t = uTime * 6.0 + uScroll * 150.0;
    vec2 st1 = st * 1.2; vec2 st2 = st * 1.6;
    float f1 = fbm(st1 + vec2(t * 0.15, t * 0.1));
    float mask1 = pow(fbm(st1 + f1 * 2.5 - vec2(t * 0.25, 0.0)), 2.0) * 3.5;
    float f2 = fbm(st2 - vec2(t * 0.1, t * 0.2));
    float mask2 = pow(fbm(st2 + f2 * 2.0 + vec2(0.0, t * 0.2)), 2.5) * 4.0;
    vec3 finalColor = color2 * mask1 + color1 * mask2;
    vec2 aspectUv = vUv - 0.5; aspectUv.x *= uResolution.x / uResolution.y;
    float centerDist = length(aspectUv);
    float angle = atan(aspectUv.y, aspectUv.x) + uScroll * 15.0;
    float maskOffset = sin(angle * 3.0 + t * 0.4) * 0.05 + sin(angle * 5.0 - t * 0.6) * 0.03;
    float dynamicDist = centerDist + maskOffset;
    float cornerFade = smoothstep(0.7, 1.15, dynamicDist);
    cornerFade = pow(cornerFade, 1.6);
    finalColor *= cornerFade * 0.9;
    vec3 baseBg = vec3(0.012, 0.012, 0.02);
    gl_FragColor = vec4(baseBg + finalColor, 1.0);
}`;

const P_VERT = `
uniform float uTime; uniform float uScroll; uniform float uIntro;
uniform vec3 uColorTop; uniform vec3 uColorBottom;
uniform vec3 uCursor; uniform float uCursorStrength;
uniform float uCursorRadius; uniform float uCursorFlare; uniform float uCursorHeat;
varying float vEdgeFade; varying float vHeat; varying vec3 vColor;
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
}
void main() {
    vec3 normalVec = normalize(position);
    float noiseVal = snoise(position * 0.5 + uTime * 0.8);
    noiseVal += 0.5 * snoise(position * 1.5 - uTime * 1.2);
    vec3 spherePos = position + normalVec * (noiseVal * 0.5);
    float cursorDist = distance(spherePos, uCursor);
    float flareFall = 1.0 - smoothstep(0.0, uCursorRadius, cursorDist);
    flareFall = pow(flareFall, 1.5);
    float flicker = 0.65 + 0.35 * snoise(position * 3.0 + uTime * 5.0);
    float flare = flareFall * uCursorStrength * flicker;
    spherePos += normalVec * (flare * uCursorFlare);
    vHeat = clamp(flare * uCursorHeat, 0.0, 1.0);
    vec3 finalPos = spherePos;
    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
    vec3 viewDir = normalize(-mvPosition.xyz);
    vec3 worldNormal = normalize(normalMatrix * normalVec);
    float rim = 1.0 - abs(dot(viewDir, worldNormal));
    float edgeFadeSphere = smoothstep(0.4, 0.9, rim);
    float opacityMultiplier = 0.8;
    float sizeMultiplier = 1.5;
    float introSphere = mix(1.0, edgeFadeSphere, uIntro);
    vEdgeFade = introSphere * opacityMultiplier;
    vEdgeFade *= smoothstep(0.0, 0.2, uIntro);
    vEdgeFade += vHeat * 0.7 * smoothstep(0.0, 0.2, uIntro);
    float baseColorMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
    vColor = mix(uColorBottom, uColorTop, clamp(baseColorMix, 0.0, 1.0));
    gl_PointSize = sizeMultiplier * (10.0 / -mvPosition.z) * (1.0 + vHeat * 1.6);
    gl_PointSize = max(gl_PointSize, 1.5);
    gl_Position = projectionMatrix * mvPosition;
}`;

const P_FRAG = `
varying float vEdgeFade; varying float vHeat; varying vec3 vColor;
void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if(ll > 0.5) discard;
    float pointAlpha = smoothstep(0.5, 0.1, ll);
    vec3 col = mix(vColor, vec3(1.0, 0.96, 0.84), vHeat);
    gl_FragColor = vec4(col, vEdgeFade * pointAlpha * 0.9);
}`;

function hexToVec3(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export default function SolarisBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.autoClear = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = CONFIG.cameraDistance;

    const bgScene = new THREE.Scene();
    const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
    const bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        color1: { value: new THREE.Color(CONFIG.colorWarm) },
        color2: { value: new THREE.Color(CONFIG.colorCool) },
      },
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthWrite: false,
    });
    bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial));

    const geometry = new THREE.SphereGeometry(4.2, 200, 600);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uScroll: { value: 0.0 },
        uIntro: { value: 0.0 },
        uColorTop: { value: hexToVec3(CONFIG.colorWarm) },
        uColorBottom: { value: hexToVec3(CONFIG.colorCool) },
        uCursor: { value: new THREE.Vector3(0, 0, 4.2) },
        uCursorStrength: { value: 0 },
        uCursorRadius: { value: CONFIG.cursorRadius },
        uCursorFlare: { value: CONFIG.cursorFlare },
        uCursorHeat: { value: CONFIG.cursorHeat },
      },
      vertexShader: P_VERT,
      fragmentShader: P_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(geometry, material);
    particles.frustumCulled = false;
    scene.add(particles);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(bgScene, bgCamera));
    const renderFg = new RenderPass(scene, camera);
    renderFg.clear = false;
    renderFg.clearDepth = true;
    composer.addPass(renderFg);
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.bloomStrength,
        CONFIG.bloomRadius,
        CONFIG.bloomThreshold,
      ),
    );

    const pickSphere = new THREE.Mesh(new THREE.SphereGeometry(4.2, 48, 48));
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerInside = false;
    const cursorTarget = new THREE.Vector3(0, 0, 4.2);
    const onPointerMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerInside = true;
    };
    const onPointerLeave = () => { pointerInside = false; };
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerMove);
    window.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bgMaterial.uniforms.uResolution.value.set(w, h);
    };
    window.addEventListener("resize", resize);

    let time = 0;
    let introStart = 0;
    let raf = 0;
    let disposed = false;
    function render(now: number) {
      if (disposed) return;
      raf = requestAnimationFrame(render);
      if (!reduced) time += 0.005 * CONFIG.noiseSpeed;
      if (introStart === 0) introStart = now;
      const introRaw = Math.min((now - introStart) / (CONFIG.introSeconds * 1000), 1);
      const introEased = reduced ? 1 : 1 - Math.pow(1 - introRaw, 3);
      material.uniforms.uIntro.value = introEased;
      material.uniforms.uTime.value = time;
      bgMaterial.uniforms.uTime.value = time;
      const introZoom = (1 - introEased) * -3.0;
      camera.position.set(0, 0, CONFIG.cameraDistance + introZoom);
      camera.lookAt(0, 0, CONFIG.cameraDistance - 100.0);
      let overSphere = false;
      if (pointerInside && !reduced) {
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObject(pickSphere, false)[0];
        if (hit) { cursorTarget.copy(hit.point); overSphere = true; }
      }
      const sU = material.uniforms.uCursorStrength;
      sU.value += ((overSphere ? 1 : 0) - sU.value) * 0.09;
      material.uniforms.uCursor.value.lerp(cursorTarget, 0.18);
      composer.render();
    }
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", resize);
      geometry.dispose();
      material.dispose();
      bgMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
