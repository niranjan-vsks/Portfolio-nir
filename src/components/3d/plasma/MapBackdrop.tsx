"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

/**
 * Mind Map backdrop (feedback 2026-07-09): a high-res starfield with the
 * Plasma Burst scene (textura/plasma-burst.html) sitting SMALL/MEDIUM on the
 * LEFT — fills the dead black space after the brain→graph transition without
 * stealing focus from the graph. Faithful port of the template's filament +
 * spark + hot-core shaders; violet is palette-legal in Map mode. Reduced-motion
 * / mobile => a single static frame (worst-case fallback per the brief).
 * Container-scoped canvas (not window), DPR capped, disposes on unmount.
 */

const CONFIG = {
  colCore: "#ffffff",
  colInner: "#d7c3ff",
  colMid: "#8a5cff",
  colOuter: "#43249f",
  colSpark: "#f1e3ff",
  colPink: "#ff8fcf",
  filaments: 200,
  segments: 60,
  sparks: 460,
  spread: 2,
  curl: 0.62,
  bend: 0.55,
  coreSize: 0.7,
  coreGlow: 0.85,
  lineBright: 1.1,
  tipFade: 0.14,
  sway: 0.16,
  swaySpeed: 1.1,
  shimmer: 0.55,
  shimmerSpeed: 3,
  sparkSize: 0.15,
  twinkle: 2,
  rotateSpeed: 0.06,
  bloomStr: 0.66,
  bloomRadius: 0.39,
  bloomThresh: 0,
  brightness: 1,
};

function hexToVec3(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function MapBackdrop({ staticFrame = false }: { staticFrame?: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth || window.innerWidth;
    let H = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x04060f, 1);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060f);
    const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 200);
    camera.position.set(0, 0, 6.2);
    scene.add(camera);

    // ---- high-res starfield (dense, size + brightness variation) ----
    const starGeo = new THREE.BufferGeometry();
    const STAR = 2400;
    const sPos = new Float32Array(STAR * 3);
    const sSize = new Float32Array(STAR);
    const sBright = new Float32Array(STAR);
    const srng = mulberry32(0x1234abcd);
    for (let i = 0; i < STAR; i++) {
      const r = 20 + srng() * 70;
      const th = srng() * Math.PI * 2;
      const ph = Math.acos(srng() * 2 - 1);
      sPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      sPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      sPos[i * 3 + 2] = -Math.abs(r * Math.cos(ph)) - 4;
      sSize[i] = srng() < 0.06 ? 2.4 + srng() * 2.2 : 0.5 + srng() * srng() * 1.4;
      sBright[i] = 0.35 + srng() * 0.65;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    starGeo.setAttribute("aSize", new THREE.BufferAttribute(sSize, 1));
    starGeo.setAttribute("aBright", new THREE.BufferAttribute(sBright, 1));
    const starMat = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `attribute float aSize; attribute float aBright; uniform float uPixelRatio, uTime; varying float vB;
        void main(){ vB=aBright*(0.7+0.3*sin(uTime*0.8+aBright*20.0)); vec4 mv=modelViewMatrix*vec4(position,1.0);
        gl_PointSize=aSize*uPixelRatio*(160.0/max(0.001,-mv.z)); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `precision highp float; varying float vB; void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d);
        float a=smoothstep(0.5,0.0,r); a*=a; gl_FragColor=vec4(vec3(0.85,0.9,1.0)*vB, a*vB); }`,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- composer + bloom ----
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), CONFIG.bloomStr, CONFIG.bloomRadius, CONFIG.bloomThresh);
    composer.addPass(bloom);
    composer.addPass(new ShaderPass(GammaCorrectionShader));

    // ---- plasma burst (ported), placed on the LEFT, medium sized ----
    const group = new THREE.Group();
    group.position.set(-2.7, 0.1, 0);
    group.scale.setScalar(0.92);
    scene.add(group);

    const lineUniforms = {
      uTime: { value: 0 }, uSway: { value: CONFIG.sway }, uSwaySpeed: { value: CONFIG.swaySpeed },
      uShimmer: { value: CONFIG.shimmer }, uShimmerSpeed: { value: CONFIG.shimmerSpeed },
      uBright: { value: CONFIG.lineBright }, uBrightness: { value: CONFIG.brightness }, uEnergy: { value: 0 },
    };
    const sparkUniforms = {
      uTime: { value: 0 }, uSparkSize: { value: CONFIG.sparkSize }, uTwinkle: { value: CONFIG.twinkle },
      uBrightness: { value: CONFIG.brightness }, uEnergy: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };
    const coreUniforms = {
      uTime: { value: 0 }, uAlpha: { value: 1 }, uColCore: { value: hexToVec3(CONFIG.colCore) },
      uColMid: { value: hexToVec3(CONFIG.colMid) }, uGlow: { value: CONFIG.coreGlow },
      uBrightness: { value: CONFIG.brightness }, uEnergy: { value: 0 },
    };

    const lineMat = new THREE.ShaderMaterial({
      uniforms: lineUniforms, blending: THREE.AdditiveBlending, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: `attribute vec3 aColor; attribute vec3 aSway; attribute vec3 aSway2; attribute float aAlong; attribute float aSeed;
        uniform float uTime, uSway, uSwaySpeed, uEnergy; varying vec3 vColor; varying float vAlong, vSeed;
        void main(){ vColor=aColor; vAlong=aAlong; vSeed=aSeed; vec3 p=position;
        float amp=uSway*aAlong*(1.0+uEnergy*1.6); float ph=aSeed*6.2831; float t=uTime*uSwaySpeed;
        float w1=sin(t+ph+aAlong*5.0); float w2=cos(t*1.27+ph*1.7+aAlong*9.0); float w3=0.5*sin(t*0.6+ph);
        p+=aSway*(w1+w3)*amp; p+=aSway2*w2*amp*0.8; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
      fragmentShader: `precision highp float; uniform float uTime, uShimmer, uShimmerSpeed, uBright, uBrightness, uEnergy;
        varying vec3 vColor; varying float vAlong, vSeed;
        void main(){ float sh=0.6+uShimmer*0.55*sin(vAlong*16.0-uTime*uShimmerSpeed+vSeed*28.0); sh=max(sh,0.0);
        vec3 c=vColor*(sh*(1.0+uEnergy*0.8))*uBright*uBrightness; gl_FragColor=vec4(c,1.0); }`,
    });
    const sparkMat = new THREE.ShaderMaterial({
      uniforms: sparkUniforms, blending: THREE.AdditiveBlending, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: `attribute vec3 aColor; attribute float aSize; attribute float aPhase;
        uniform float uTime, uSparkSize, uTwinkle, uPixelRatio, uEnergy; varying vec3 vColor; varying float vTw;
        void main(){ vColor=aColor; float tw=0.45+0.55*sin(uTime*uTwinkle+aPhase*6.2831); vTw=tw;
        vec4 mv=modelViewMatrix*vec4(position,1.0); float s=uSparkSize*aSize*uPixelRatio*(200.0/max(0.001,-mv.z));
        gl_PointSize=s*(0.6+0.5*tw)*(1.0+uEnergy*0.4); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `precision highp float; uniform float uBrightness, uEnergy; varying vec3 vColor; varying float vTw;
        void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); float a=smoothstep(0.5,0.0,r); a*=a;
        vec3 c=vColor*(0.4+vTw)*(1.0+uEnergy*0.6)*uBrightness; gl_FragColor=vec4(c,a); }`,
    });
    const coreMat = new THREE.ShaderMaterial({
      uniforms: coreUniforms, blending: THREE.AdditiveBlending, transparent: true, depthTest: false, depthWrite: false,
      vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
      fragmentShader: `precision highp float; uniform vec3 uColCore, uColMid; uniform float uTime, uGlow, uBrightness, uAlpha, uEnergy;
        varying vec2 vUv; void main(){ vec2 p=vUv-0.5; float r=length(p)*2.0; float core=exp(-r*r*16.0);
        float halo=exp(-r*4.2)*0.22; float flick=0.88+0.12*sin(uTime*2.3)+0.06*sin(uTime*7.0); float boost=1.0+uEnergy*1.2;
        vec3 c=(uColCore*core+uColMid*halo)*uGlow*flick*boost*uBrightness; float a=clamp(core+halo,0.0,1.0)*uAlpha;
        gl_FragColor=vec4(c,a); }`,
    });
    const core = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), coreMat);
    group.add(core);

    // build filaments + sparks
    const rng = mulberry32(0x9e3779b9);
    const col = {
      core: hexToVec3(CONFIG.colCore), inner: hexToVec3(CONFIG.colInner), mid: hexToVec3(CONFIG.colMid),
      outer: hexToVec3(CONFIG.colOuter), spark: hexToVec3(CONFIG.colSpark), pink: hexToVec3(CONFIG.colPink),
    };
    const F = CONFIG.filaments, P = CONFIG.segments, segs = P - 1, N = F * segs * 2;
    const pos = new Float32Array(N * 3), colA = new Float32Array(N * 3), swayA = new Float32Array(N * 3);
    const sway2A = new Float32Array(N * 3), alongA = new Float32Array(N), seedA = new Float32Array(N);
    const tipFlare: THREE.Vector3[] = [];
    const coreStart = 0.06, tmp = new THREE.Vector3();
    let w = 0;
    for (let f = 0; f < F; f++) {
      const seed = rng();
      const z = rng() * 2 - 1, th = rng() * 6.2831, rr = Math.sqrt(1 - z * z);
      const dir = new THREE.Vector3(rr * Math.cos(th), rr * Math.sin(th), z);
      const up = Math.abs(dir.y) > 0.99 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
      const u = new THREE.Vector3().crossVectors(dir, up).normalize();
      const v = new THREE.Vector3().crossVectors(dir, u).normalize();
      let len = CONFIG.spread * (0.28 + rng() * rng() * 1.15);
      if (rng() > 0.86) len *= 1.7;
      const f1 = 2 + rng() * 5, f2 = 2 + rng() * 5, p1 = rng() * 6.2831, p2 = rng() * 6.2831;
      const curl = CONFIG.curl * (0.45 + rng());
      const bend = new THREE.Vector3().addScaledVector(u, rng() - 0.5).addScaledVector(v, rng() - 0.5)
        .normalize().multiplyScalar(CONFIG.bend * (0.4 + rng()));
      const pts: THREE.Vector3[] = new Array(P), cols: THREE.Vector3[] = new Array(P);
      for (let i = 0; i < P; i++) {
        const t = i / (P - 1), radius = coreStart + len * t;
        tmp.copy(dir).multiplyScalar(radius);
        tmp.addScaledVector(u, Math.sin(t * f1 * Math.PI + p1) * curl * t);
        tmp.addScaledVector(v, Math.cos(t * f2 * Math.PI + p2) * curl * t);
        tmp.addScaledVector(bend, t * t);
        pts[i] = tmp.clone();
        const c1 = col.inner.clone().lerp(col.mid, THREE.MathUtils.smoothstep(t, 0.0, 0.5));
        const c = c1.lerp(col.outer, THREE.MathUtils.smoothstep(t, 0.5, 1.0));
        c.lerp(col.core, (1 - THREE.MathUtils.smoothstep(t, 0.0, 0.12)) * 0.9);
        const bright = THREE.MathUtils.lerp(1.15, CONFIG.tipFade, THREE.MathUtils.smoothstep(t, 0.0, 1.0));
        cols[i] = c.multiplyScalar(bright);
      }
      tipFlare.push(pts[P - 1]);
      for (let i = 0; i < segs; i++) {
        for (let e = 0; e < 2; e++) {
          const idx = i + e, t = idx / (P - 1), p = pts[idx], c = cols[idx];
          pos[w * 3] = p.x; pos[w * 3 + 1] = p.y; pos[w * 3 + 2] = p.z;
          colA[w * 3] = c.x; colA[w * 3 + 1] = c.y; colA[w * 3 + 2] = c.z;
          swayA[w * 3] = u.x; swayA[w * 3 + 1] = u.y; swayA[w * 3 + 2] = u.z;
          sway2A[w * 3] = v.x; sway2A[w * 3 + 1] = v.y; sway2A[w * 3 + 2] = v.z;
          alongA[w] = t; seedA[w] = seed; w++;
        }
      }
    }
    const lg = new THREE.BufferGeometry();
    lg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    lg.setAttribute("aColor", new THREE.BufferAttribute(colA, 3));
    lg.setAttribute("aSway", new THREE.BufferAttribute(swayA, 3));
    lg.setAttribute("aSway2", new THREE.BufferAttribute(sway2A, 3));
    lg.setAttribute("aAlong", new THREE.BufferAttribute(alongA, 1));
    lg.setAttribute("aSeed", new THREE.BufferAttribute(seedA, 1));
    const lines = new THREE.LineSegments(lg, lineMat);
    lines.frustumCulled = false;
    group.add(lines);

    const S = CONFIG.sparks;
    const sp = new Float32Array(S * 3), sc = new Float32Array(S * 3), ssz = new Float32Array(S), sph = new Float32Array(S);
    for (let i = 0; i < S; i++) {
      const roll = rng();
      let p: THREE.Vector3, isBokeh = false;
      if (roll < 0.42 && tipFlare.length) {
        const base = tipFlare[(rng() * tipFlare.length) | 0];
        p = base.clone().add(new THREE.Vector3((rng() - 0.5) * 0.18, (rng() - 0.5) * 0.18, (rng() - 0.5) * 0.18));
      } else if (roll < 0.88) {
        const z = rng() * 2 - 1, th = rng() * 6.2831, rr = Math.sqrt(1 - z * z);
        const rad = CONFIG.spread * (0.12 + Math.pow(rng(), 1.4) * 1.05);
        p = new THREE.Vector3(rr * Math.cos(th) * rad, rr * Math.sin(th) * rad, z * rad);
      } else {
        isBokeh = true;
        const z = rng() * 2 - 1, th = rng() * 6.2831, rr = Math.sqrt(1 - z * z);
        const rad = CONFIG.spread * (1.0 + rng() * 1.2);
        p = new THREE.Vector3(rr * Math.cos(th) * rad, rr * Math.sin(th) * rad, z * rad * 0.7);
      }
      sp[i * 3] = p.x; sp[i * 3 + 1] = p.y; sp[i * 3 + 2] = p.z;
      const distN = Math.min(1, p.length() / (CONFIG.spread * 1.4));
      const c = (rng() > 0.82 ? col.pink.clone() : col.spark.clone()).lerp(col.mid, distN * 0.5);
      c.multiplyScalar(THREE.MathUtils.lerp(1.0, 0.35, distN) * (isBokeh ? 0.55 : 1.0));
      sc[i * 3] = c.x; sc[i * 3 + 1] = c.y; sc[i * 3 + 2] = c.z;
      ssz[i] = isBokeh ? 1.1 + rng() * 1.3 : 0.3 + rng() * rng() * 0.85;
      sph[i] = rng();
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    sg.setAttribute("aColor", new THREE.BufferAttribute(sc, 3));
    sg.setAttribute("aSize", new THREE.BufferAttribute(ssz, 1));
    sg.setAttribute("aPhase", new THREE.BufferAttribute(sph, 1));
    const sparkPts = new THREE.Points(sg, sparkMat);
    sparkPts.frustumCulled = false;
    group.add(sparkPts);

    let raf = 0;
    let spin = 0;
    const clock = new THREE.Clock();
    const renderFrame = () => {
      const now = clock.getElapsedTime();
      spin += CONFIG.rotateSpeed * 0.016;
      group.rotation.y = spin;
      core.quaternion.copy(camera.quaternion);
      core.scale.setScalar(CONFIG.coreSize);
      lineUniforms.uTime.value = now;
      sparkUniforms.uTime.value = now;
      coreUniforms.uTime.value = now;
      starMat.uniforms.uTime.value = now;
      composer.render();
    };

    const loop = () => { renderFrame(); raf = requestAnimationFrame(loop); };
    if (staticFrame) {
      spin = 0.6; group.rotation.y = spin;
      core.quaternion.copy(camera.quaternion); core.scale.setScalar(CONFIG.coreSize);
      composer.render();
    } else {
      loop();
    }

    const onResize = () => {
      W = mount.clientWidth || window.innerWidth;
      H = mount.clientHeight || window.innerHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H; camera.updateProjectionMatrix();
      composer.setSize(W, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      starGeo.dispose(); starMat.dispose();
      lg.dispose(); lineMat.dispose(); sg.dispose(); sparkMat.dispose();
      coreMat.dispose(); core.geometry.dispose();
      composer.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [staticFrame]);

  return <div ref={mountRef} className="absolute inset-0 h-full w-full" aria-hidden />;
}
