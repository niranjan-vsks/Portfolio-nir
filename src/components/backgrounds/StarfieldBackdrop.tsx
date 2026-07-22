"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Dense twinkling starfield : the plume and Solaris
 * were rejected as glaring, so this shared backdrop keeps ONLY the star
 * system ( star shaders from the plume master prompt) at higher
 * density, distributed all around instead of one hemisphere. Used on /map
 * (graph phase) and /contact.
 */

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

function buildStars(n: number) {
  const pos = new Float32Array(n * 3), aSeed = new Float32Array(n), aSize = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2;
    const rad = 40 + Math.random() * 60;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = Math.cos(th) * s * rad;
    pos[i * 3 + 1] = u * rad;
    pos[i * 3 + 2] = Math.sin(th) * s * rad - 30;
    aSeed[i] = Math.random();
    aSize[i] = 0.4 + Math.random() * Math.random();
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aSeed", new THREE.Float32BufferAttribute(aSeed, 1));
  g.setAttribute("aSize", new THREE.Float32BufferAttribute(aSize, 1));
  return g;
}

export default function StarfieldBackdrop({
  count = 5200,
  fixed = false,
}: {
  count?: number;
  /** fixed inset-0 (page background) vs absolute (inside a stage) */
  fixed?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 240);
    camera.position.set(0, 0, 20);

    const dpr = Math.min(window.devicePixelRatio, 2);
    const res = new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr);
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: {
        iTime: { value: 0 }, uAlpha: { value: 0 }, uRes: { value: res },
        uSize: { value: 1.7 }, uBright: { value: 1.35 },
        uColor: { value: new THREE.Vector3(0.68, 0.75, 0.85) },
      },
      vertexShader: STAR_VERT, fragmentShader: STAR_FRAG,
    });
    const stars = new THREE.Points(buildStars(count), mat);
    stars.frustumCulled = false;
    scene.add(stars);

    const resize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const d = Math.min(window.devicePixelRatio, 2);
      res.set(w * d, h * d);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    let raf = 0, disposed = false;
    const frame = () => {
      if (disposed) return;
      const t = performance.now() / 1000;
      mat.uniforms.iTime.value = reduced ? 0 : t;
      mat.uniforms.uAlpha.value = Math.min((performance.now() - start) / 1200, 1);
      if (!reduced) stars.rotation.y = t * 0.004;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      stars.geometry.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`${fixed ? "fixed -z-10" : "absolute"} pointer-events-none inset-0 h-full w-full`}
    />
  );
}
