"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Plume backdrop for the Mind Map graph phase (Right_Now fixes 2026-07-11).
 * Faithful port of template_repos/textura_templates/plume/plume_master_prompt.md:
 * verbatim smoke-column + starfield shaders (the glow is faked per-speck in the
 * fragment shader, so no composer rig is needed for the look). Renovation-
 * surgical deltas, per the fixes doc: the column sits at the LEFT of the frame,
 * scaled down so it never overshadows the graph; transparent canvas so the
 * page's own space gradient stays; auto-orbit dropped (the plume must hold its
 * left-side post), churn/twinkle motion kept.
 */

const CONFIG = {
  smokeCount: 60000, // template: 130k full-screen; halved for a side effect sharing GPU with the graph
  height: 15.5,
  topR: 0.05,
  widthGrow: 1.7,
  groundSpread: 3.1,
  groundH: 0.49,
  riseSpeed: 0.045,
  billow: 1.45,
  billowScale: 2,
  churn: 2,
  pointSize: 1.45,
  brightness: 4,
  glitter: 0.4,
  twinkleSpeed: 2.4,
  smokeColor: "#cfd9ea",
  coreColor: "#fff6e8",
  groundColor: "#3a4658",
  coreStrength: 16,
  coreSize: 0.79,
  coreSharp: 2.4,
  bloomAmount: 3.9,
  bloomWidth: 2.6,
  haloFalloff: 0.2,
  starCount: 1600,
  starSize: 1.2,
  starBright: 0.9,
  starColor: "#aebed8",
  camDist: 20.5,
  camHeight: 5.8,
  lookHeight: 10.4,
  parallax: 0.6,
  opacity: 0.85,
};

function hexToVec3(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const SMOKE_VERT = `
attribute float aH, aAng, aRad, aSeed;
uniform float iTime, uAlpha, uHeight, uTopR, uWidthGrow, uGroundSpread, uGroundH;
uniform float uRise, uBillow, uBillowScale, uChurn, uSize, uBright, uGlitter, uTwinkle;
uniform vec2 uRes; uniform vec3 uSmoke, uCore, uGround;
varying vec3 vCol; varying float vB;

vec3 warp(vec3 p, float t){
  vec3 q = p;
  q.x += 0.7 * sin(t * 0.5 + 1.7 * p.y + 0.9 * p.z);
  q.y += 0.7 * cos(t * 0.4 + 1.3 * p.z + 0.9 * p.x);
  q.z += 0.7 * sin(t * 0.6 + 1.9 * p.x + 0.9 * p.y);
  q.x += 0.35 * sin(t * 0.3 + 2.6 * q.y);
  q.z += 0.35 * cos(t * 0.35 + 2.6 * q.x);
  return q - p;
}

void main(){
  float h = fract(aH + iTime * uRise * (0.6 + 0.8 * aSeed));
  float fade = smoothstep(0.0, 0.06, h) * smoothstep(1.0, 0.86, h);
  float down = 1.0 - h;

  float r = uTopR + pow(down, 1.7) * uWidthGrow;
  float ground = smoothstep(uGroundH, 0.0, h);
  r += ground * uGroundSpread * (0.4 + aSeed);

  float rr = r * (0.3 + 0.7 * aRad);
  vec3 pos = vec3(cos(aAng) * rr, h * uHeight, sin(aAng) * rr);
  pos.y *= mix(1.0, 0.4, ground);

  float amp = uBillow * (0.22 + 1.5 * down) * (0.5 + r);
  vec3 wp = pos * uBillowScale + vec3(0.0, -iTime * uChurn, aSeed * 10.0);
  pos += warp(wp, iTime * uChurn) * amp;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  float topGlow = smoothstep(0.0, 0.85, h);
  float axis = exp(-pow(rr / max(0.001, r), 2.0) * 1.5);
  float tw = 0.55 + 0.45 * sin(iTime * uTwinkle + aSeed * 43.0);
  float spark = step(0.7, aSeed);
  float glit = mix(1.0, tw, uGlitter) * (0.6 + 0.8 * spark);
  vB = fade * glit * (0.25 + 1.1 * topGlow) * (0.6 + 0.8 * axis) * uBright * uAlpha;

  vec3 col = mix(uGround, uSmoke, topGlow);
  col = mix(col, uCore, topGlow * axis * 0.85);
  vCol = col;

  float size = uSize * (0.7 + 0.9 * spark) * (0.8 + 0.6 * topGlow);
  gl_PointSize = clamp(size * uRes.y / 1000.0 / -mv.z, 1.0, 40.0);
  gl_Position = projectionMatrix * mv;
}`;

const SMOKE_FRAG = `
uniform float uCoreStrength, uCoreSize, uCoreSharp, uBloomAmount, uBloomWidth, uHaloFalloff;
varying vec3 vCol; varying float vB;
void main(){
  float pd = length(2.0 * gl_PointCoord - 1.0);
  float core = pow(max(0.0, 1.0 - pd / max(0.001, uCoreSize)), uCoreSharp) * uCoreStrength;
  float halo = pow(max(0.0, 1.0 - pd / max(0.001, uBloomWidth)), uHaloFalloff) * uBloomAmount;
  float tex = core + halo;
  gl_FragColor = vec4(vCol, tex * vB);
}`;

const STAR_VERT = `
attribute float aSeed, aSize;
uniform float iTime, uAlpha, uSize, uBright;
uniform vec2 uRes; uniform vec3 uColor;
varying vec3 vCol; varying float vB;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.45 + 0.55 * sin(iTime * (0.8 + aSeed * 2.0) + aSeed * 30.0);
  vB = tw * uBright * uAlpha;
  vCol = uColor;
  gl_PointSize = clamp(uSize * aSize * uRes.y / 900.0 / -mv.z, 0.6, 6.0);
  gl_Position = projectionMatrix * mv;
}`;

const STAR_FRAG = `
varying vec3 vCol; varying float vB;
void main(){
  float d = length(2.0 * gl_PointCoord - 1.0);
  float tex = pow(max(0.0, 1.0 - d), 1.6);
  gl_FragColor = vec4(vCol, tex * vB);
}`;

function buildSmoke(n: number) {
  const pos = new Float32Array(n * 3);
  const aH = new Float32Array(n), aAng = new Float32Array(n), aRad = new Float32Array(n), aSeed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    aH[i] = Math.random();
    aAng[i] = Math.random() * Math.PI * 2;
    aRad[i] = Math.sqrt(Math.random());
    aSeed[i] = Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aH", new THREE.Float32BufferAttribute(aH, 1));
  g.setAttribute("aAng", new THREE.Float32BufferAttribute(aAng, 1));
  g.setAttribute("aRad", new THREE.Float32BufferAttribute(aRad, 1));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(aSeed, 1));
  return g;
}

function buildStars(n: number) {
  const pos = new Float32Array(n * 3), aSeed = new Float32Array(n), aSize = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
    const rad = 60 + Math.random() * 40;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = Math.cos(th) * s * rad;
    pos[i * 3 + 1] = (u * 0.5 + 0.4) * rad;
    pos[i * 3 + 2] = Math.sin(th) * s * rad - 20;
    aSeed[i] = Math.random();
    aSize[i] = 0.4 + Math.random() * Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(aSeed, 1));
  g.setAttribute("aSize", new THREE.Float32BufferAttribute(aSize, 1));
  return g;
}

export default function PlumeBackdrop({ staticFrame = false }: { staticFrame?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 240);
    camera.position.set(0, CONFIG.camHeight, CONFIG.camDist);
    scene.add(camera);

    const dpr = Math.min(window.devicePixelRatio, 2);
    const res = new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr);

    const smokeMat = new THREE.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        iTime: { value: 0 }, uAlpha: { value: 0 }, uRes: { value: res },
        uHeight: { value: CONFIG.height }, uTopR: { value: CONFIG.topR },
        uWidthGrow: { value: CONFIG.widthGrow }, uGroundSpread: { value: CONFIG.groundSpread },
        uGroundH: { value: CONFIG.groundH }, uRise: { value: CONFIG.riseSpeed },
        uBillow: { value: CONFIG.billow }, uBillowScale: { value: CONFIG.billowScale },
        uChurn: { value: CONFIG.churn }, uSize: { value: CONFIG.pointSize },
        uBright: { value: CONFIG.brightness }, uGlitter: { value: CONFIG.glitter },
        uTwinkle: { value: CONFIG.twinkleSpeed },
        uSmoke: { value: hexToVec3(CONFIG.smokeColor) },
        uCore: { value: hexToVec3(CONFIG.coreColor) },
        uGround: { value: hexToVec3(CONFIG.groundColor) },
        uCoreStrength: { value: CONFIG.coreStrength }, uCoreSize: { value: CONFIG.coreSize },
        uCoreSharp: { value: CONFIG.coreSharp }, uBloomAmount: { value: CONFIG.bloomAmount },
        uBloomWidth: { value: CONFIG.bloomWidth }, uHaloFalloff: { value: CONFIG.haloFalloff },
      },
      vertexShader: SMOKE_VERT, fragmentShader: SMOKE_FRAG,
    });
    const smoke = new THREE.Points(buildSmoke(CONFIG.smokeCount), smokeMat);
    smoke.frustumCulled = false;
    scene.add(smoke);

    const starMat = new THREE.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        iTime: { value: 0 }, uAlpha: { value: 0 }, uRes: { value: res },
        uSize: { value: CONFIG.starSize }, uBright: { value: CONFIG.starBright },
        uColor: { value: hexToVec3(CONFIG.starColor) },
      },
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
    });
    const stars = new THREE.Points(buildStars(CONFIG.starCount), starMat);
    stars.frustumCulled = false;
    scene.add(stars);

    const mouseTarget = { x: 0, y: 0 }, mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const appearStart = performance.now();
    let raf = 0;
    let disposed = false;

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const d = Math.min(window.devicePixelRatio, 2);
      res.set(w * d, h * d);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      if (disposed) return;
      mouse.x = lerp(mouse.x, mouseTarget.x, 0.05);
      mouse.y = lerp(mouse.y, mouseTarget.y, 0.05);
      const t = performance.now() / 1000;
      const el = performance.now() - appearStart;
      smokeMat.uniforms.iTime.value = t;
      smokeMat.uniforms.uAlpha.value = clamp((el - 300) / 1800, 0, 1) * CONFIG.opacity;
      starMat.uniforms.iTime.value = t;
      starMat.uniforms.uAlpha.value = clamp((el - 100) / 1400, 0, 1) * CONFIG.opacity;

      // the plume holds the LEFT of the frame (no auto-orbit), gentle parallax only
      camera.position.set(mouse.x * CONFIG.parallax, CONFIG.camHeight + mouse.y * CONFIG.parallax * 2.2, CONFIG.camDist);
      camera.lookAt(9.5, CONFIG.lookHeight, 0); // look right of the column -> column renders left
      renderer.render(scene, camera);
      if (!staticFrame) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      smoke.geometry.dispose(); smokeMat.dispose();
      stars.geometry.dispose(); starMat.dispose();
      renderer.dispose();
    };
  }, [staticFrame]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
