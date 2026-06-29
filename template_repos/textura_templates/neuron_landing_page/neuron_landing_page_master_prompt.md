# Recreate this site as a single HTML file: Neural Monitor

You are an expert creative front-end developer. Produce a **single self-contained `index.html`**
that reproduces the project below **exactly** — same layout, scene, visuals, motion, and
interaction. Pure HTML/CSS/JS in one file: no build step, no framework, no bundler. Use ES modules
with a CDN importmap for Three.js (r0.171) and its `examples/jsm` addons, and load Lenis from a CDN
for smooth scroll. Hardcode every value given here as a fixed constant. Rebuild each component
described below as a section of the one file.

## What it is

A scroll-driven neural narrative. A full-bleed, **fixed** WebGL particle brain — an area-sampled
point cloud of a real brain model, ~140k glowing points plus a drifting ambient cloud — sits behind
a stack of seven full-screen story chapters. The brain stands to one side at rest; scrolling flies a
camera between chapters, each one pushing in to **scan and isolate a region** (cortex, temporal,
occipital, cerebellum…), and the finale **disperses** the whole brain into a constellation of signal.
One chapter is a **takeover**: a full-screen drifting node-network "signal field" slides over and
hides the brain, then reveals it again. Everything is deep navy-black (`#01040e`) with a pale-sky
(`#8ecbff`) / azure (`#1f6ae0`) accent, terminal/console chrome (a live telemetry status bar pinned
top, a chapter rail pinned bottom), and General Sans typography. An immersive boot loader fronts the
first paint and the brain assembles in as the loader fades.

## Page shell & libraries

- **Importmap** (ES modules from unpkg), then a module script:
  ```html
  <script type="importmap">
  { "imports": {
    "three": "https://unpkg.com/three@0.171.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.171.0/examples/jsm/"
  }}</script>
  ```
  Import from `three`, plus: `three/addons/loaders/GLTFLoader.js`,
  `three/addons/postprocessing/EffectComposer.js`, `.../RenderPass.js`, `.../ShaderPass.js`,
  `.../UnrealBloomPass.js`, and `three/addons/shaders/GammaCorrectionShader.js`.
- **Smooth scroll:** Lenis — `import Lenis from "https://unpkg.com/lenis@1.3.19/dist/lenis.mjs"`
  (and its CSS, or set `html.lenis,html.lenis body{height:auto}`). New Lenis with defaults; run its
  `raf(time)` from your main loop; drive scroll **progress** (0→1) from `lenis.progress`.
- **Font:** General Sans (Fontshare) — used for *everything* (body + mono chrome):
  `<link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>` and
  `<link href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap" rel="stylesheet">`
  then `font-family:"General Sans",ui-sans-serif,system-ui,sans-serif`.
- **CSS reset / shell:** box-sizing border-box, no margins; `body{background:#01040e;color:#ededed;min-height:100vh;width:100%;overflow-x:hidden}`.
  Define the palette as CSS vars on `:root`:
  ```css
  --brain-void:#01040e; --brain-deep:#04122e; --brain-azure:#1f6ae0; --brain-sky:#8ecbff;
  ```
- **Adaptive rem grid** (so the rem-based layout scales with the viewport) — set the root font-size
  in vw per breakpoint:
  ```css
  html{font-size:16px}
  @media (max-width:1920px){html{font-size:0.833333vw}}
  @media (max-width:1440px){html{font-size:1.111111vw}}
  @media (max-width:1024px){html{font-size:1.5625vw}}
  @media (max-width:640px){html{font-size:4.444444vw}}
  ```
- **Layering:** the `<canvas>` is `position:fixed; inset:0; z-index:0`. Story panels scroll above it
  in a `z-20` flow; the takeover field is `z-10`; the telemetry bar + chapter rail are `z-30`; the
  loader is `z-50`. The whole story overlay is `pointer-events:none` except the finale CTA button.

## The WebGL scene (this is the core — reproduce exactly)

### Renderer / camera / scene
- `WebGLRenderer({ antialias:true })`, `setPixelRatio(min(devicePixelRatio,2))`, sized to the window.
- `PerspectiveCamera(fov 45, near 0.1, far 80)`, initial position `(0, 0.25, 5.4)` (keyframe 0).
- Scene background `#01040e`; `FogExp`/linear `Fog("#01040e", 0, 18)`.
- The brain points live in a `Group` whose initial `position.z = 3.6` (REVEAL_START_Z, near the
  camera); it eases to 0 during the entrance reveal as the brain flies in toward its resting depth.

### Load + sample the brain model (geometry)
Load the GLB (see **Assets**), then build the brain point cloud once:
1. **Gather triangles** — traverse every mesh, transform each face into world space, flatten into a
   `Float32Array` of 9 floats per triangle `[ax,ay,az, bx,by,bz, cx,cy,cz]` (handle indexed and
   non-indexed geometry).
2. **Area-weighted surface sampling** — sample `surfaceCount = 140000` points across that triangle
   soup: compute each triangle's area (`0.5·|(b−a)×(c−a)|`), build a CDF, then for each sample pick a
   triangle by binary-searching a random value into the CDF and a random barycentric point
   (`u,v=rand; if(u+v>1){u=1−u;v=1−v} w=1−u−v`). Also store each point's **geometric normal** (the
   source triangle's normal, normalised) in an `aNormal` attribute — used by the flow motion.
3. **Center & scale** — recentre on the centroid and uniformly scale so the bounding-sphere radius
   is **1.45**.
4. **Bake cavity occlusion** (`aOcclusion`, 0..1) — via a spatial hash, count each point's neighbours
   within `occlusionRadius`; normalise relative to the mean (ridges ≈ mean → 0, folds ≳ mean → 1).
   `occlusionStrength` defaults to 0, so this is wired but visually neutral unless raised.
5. Add an `aSeed` attribute = one random float per point.
- **Ambient cloud** (`ambientCount = 4500`): for each, a position on a sphere of radius `1.5 + rand·0.5`
  (uniform `theta=2π·u`, `phi=acos(2v−1)`), a random unit `aDir`, and a random `aSeed`.
- Both clouds are `THREE.Points` with `frustumCulled=false`, `ShaderMaterial({ transparent:true,
  depthWrite:false, blending:AdditiveBlending })`.

### Brain config constants (bake these in)
```js
const BRAIN_CONFIG = {
  modelUrl: "<ASSET_BASE_URL>/rotten-brain.glb",
  brainCool:"#0a3f70", brainWarm:"#70bcff", edgeColor:"#1f6ae0", centerColor:"#000000",
  centerRadius:0.37, centerFalloff:4, synapseColor:"#eaf3ff", ambientColor:"#2b5a9c",
  particleSize:0.029, ambientSize:0.069, ambientCount:4500, ambientSpeed:0.03, ambientRange:15.5,
  surfaceCount:140000, rotationSpeed:-0.09, synapseRate:0.1, flowSpeed:2.3, flowAmount:0.025,
  glowStrength:2, depthDarkness:1, deepColor:"#010b1e", occlusionStrength:0, occlusionRadius:0.05,
  highlightColor:"#2563eb", highlightRadius:0.6, focusFadeStrength:0.55, isolateStrength:0.88,
  explodeDistance:5, constellationCount:170, constellationColor:"#a8d4ff",
  // cursor halo (lights up + swells particles under the pointer)
  cursorColor:"#000000", cursorStrength:0.74, cursorRadius:0.24, cursorFollow:0.39, cursorFade:0.1, cursorParallax:1,
  cornerBlue:"#0f5fcf", cornerOrange:"#040f2e",
  // UnrealBloom (seeded here, applied to the whole scene)
  bloomStrength:0.69, bloomRadius:0.75, bloomThreshold:0,
};
```
Convert each hex to a normalised `vec3` for the uniforms. Build the uniform sets from these defaults
(brain uniforms: `iTime,iAlpha(0),iResolutionY(720), uCool,uWarm,uEdgeColor,uCenterColor,
uCenterRadius,uCenterFalloff,uSynapse,uSize,uSynapseRate,uFlowSpeed,uFlowAmount,uGlow,
uDepthDarkness,uDeepColor,uOcclusionStrength,uHighlightColor,uHighlightPos(0,0,0),uHighlightRadius,
uHighlightStrength(0),uFocusFadeStrength,uIsolateStrength,uExplode(0),uExplodeDist,
uMouse(-10,-10),uCursor(0),uAspect(1),uCursorRadius(0.24),uCursorColor(#000000),uCursorStrength(0.74)`; ambient uniforms:
`iTime,iAlpha(0),iResolutionY(720),uColor,uSize,uSpeed,uRange`).

### Shaders — VERBATIM
Ambient cloud:
```glsl
// AMBIENT_VERTEX
attribute vec3 aDir;
attribute float aSeed;
uniform float iTime;
uniform float iResolutionY;
uniform float uSize;
uniform float uSpeed;
uniform float uRange;
varying float vSeed;
varying float vPhase;
void main() {
  vSeed = aSeed;
  float speed = 0.35 + aSeed * 0.9;
  float phase = fract(iTime * uSpeed * speed + aSeed);
  vPhase = phase;
  vec3 dir = normalize(aDir + vec3(1e-5));
  vec3 p = position + dir * phase * uRange;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float lifeSize = mix(1.0, 0.6, phase);
  gl_PointSize = uSize * lifeSize * (iResolutionY / 720.0) * (200.0 / -mv.z);
}
```
```glsl
// AMBIENT_FRAGMENT
uniform vec3 uColor;
uniform float iAlpha;
varying float vSeed;
varying float vPhase;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = length(p);
  if (r > 0.5) discard;
  float k = smoothstep(0.5, 0.0, r);
  float life = smoothstep(0.0, 0.1, vPhase) * smoothstep(1.0, 0.7, vPhase);
  float twinkle = 0.5 + 0.5 * sin(vSeed * 40.0 + vPhase * 30.0);
  gl_FragColor = vec4(uColor * k * life * (0.4 + 0.6 * twinkle), k * life * iAlpha * 0.6);
}
```
Brain surface:
```glsl
// BRAIN_VERTEX
attribute float aSeed;
attribute float aOcclusion;
attribute vec3 aNormal;
uniform float iTime;
uniform float iResolutionY;
uniform float uSize;
uniform float uSynapseRate;
uniform float uCenterRadius;
uniform float uFlowSpeed;
uniform float uFlowAmount;
uniform vec3 uHighlightPos;
uniform float uHighlightRadius;
uniform float uHighlightStrength;
uniform float uExplode;
uniform float uExplodeDist;
uniform vec2 uMouse;        // cursor in NDC (-1..1)
uniform float uCursor;      // cursor effect strength (0..1)
uniform float uAspect;      // viewport width / height (circular halo)
uniform float uCursorRadius;// NDC halo radius (shrinks as the brain gets far)
uniform float uCursorStrength; // overall halo intensity multiplier
varying float vSeed;
varying float vSynapse;
varying float vHemi;
varying float vDepth;
varying float vFrontness;
varying float vCenterness;
varying float vOcclusion;
varying float vHighlight;
varying float vFar;
varying float vCursor;
varying vec3 vWorldPos;
void main() {
  vSeed = aSeed;
  vOcclusion = aOcclusion;
  vec3 p = position;
  vWorldPos = p;
  vHemi = step(0.0, p.x);
  vHighlight = (1.0 - smoothstep(0.0, uHighlightRadius, distance(position, uHighlightPos))) * uHighlightStrength;
  vec3 focalDir = normalize(uHighlightPos + vec3(1e-5));
  float align = dot(normalize(position + vec3(1e-5)), focalDir);
  vFar = smoothstep(0.55, -0.35, align);
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
  float firePhase = aSeed * period;
  float ft = mod(iTime + firePhase, period);
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
  float screenDist = length(pNDC - centerNDC);
  vCenterness = 1.0 - clamp(screenDist / max(0.05, uCenterRadius), 0.0, 1.0);
  vec2 dMouse = pNDC - uMouse;
  dMouse.x *= uAspect;
  vCursor = (1.0 - smoothstep(0.0, uCursorRadius, length(dMouse))) * uCursor;
  float baseSize = uSize * (iResolutionY / 720.0) * (200.0 / -mv.z);
  gl_PointSize = baseSize * (1.0 + fire * 2.5 + vHighlight * 1.8 + vCursor * 1.3 * uCursorStrength);
  vDepth = -mv.z;
}
```
```glsl
// BRAIN_FRAGMENT
uniform vec3 uCool;
uniform vec3 uWarm;
uniform vec3 uEdgeColor;
uniform vec3 uCenterColor;
uniform float uCenterFalloff;
uniform vec3 uSynapse;
uniform float iAlpha;
uniform float uGlow;
uniform float uDepthDarkness;
uniform vec3 uDeepColor;
uniform float uOcclusionStrength;
uniform vec3 uHighlightColor;
uniform float uHighlightStrength;
uniform float uFocusFadeStrength;
uniform float uIsolateStrength;
uniform float uExplode;
uniform vec3 uCursorColor;
uniform float uCursorStrength;
varying float vSeed;
varying float vSynapse;
varying float vHemi;
varying float vDepth;
varying float vFrontness;
varying float vCenterness;
varying float vOcclusion;
varying float vHighlight;
varying float vFar;
varying float vCursor;
varying vec3 vWorldPos;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float r = length(p);
  if (r > 0.5) discard;
  float core = pow(smoothstep(0.5, 0.0, r), 2.2);
  float t = pow(vCenterness, max(0.05, uCenterFalloff));
  vec3 base = mix(uEdgeColor, uCenterColor, t);
  vec3 yTint = mix(uCool, uWarm, smoothstep(-0.6, 1.0, vWorldPos.y) * 0.6 + vSeed * 0.25);
  yTint = mix(yTint, yTint * vec3(0.95, 1.0, 1.05), vHemi * 0.4);
  base *= mix(vec3(1.0), yTint, 0.35);
  base = mix(base, uDeepColor, clamp(vOcclusion * uOcclusionStrength, 0.0, 1.0));
  vec3 col = base + uSynapse * vSynapse * 2.0;
  col = mix(col, uHighlightColor, vHighlight * 0.5);
  col += uHighlightColor * vHighlight * 0.7;
  float nonFocus = (1.0 - vHighlight) * uHighlightStrength;
  col = mix(col, uDeepColor, nonFocus * uIsolateStrength);
  float depthMul = mix(1.0 - uDepthDarkness, 1.0, vFrontness);
  col *= depthMul;
  float alphaOut = core * iAlpha * mix(1.0 - uDepthDarkness * 0.7, 1.0, vFrontness);
  alphaOut *= 1.0 + vHighlight * 0.8;
  float focusDim = 1.0 - uHighlightStrength * uFocusFadeStrength * vFar;
  col *= focusDim;
  alphaOut *= focusDim;
  col += uCursorColor * vCursor * 0.8 * uCursorStrength;
  alphaOut += vCursor * core * 0.32 * uCursorStrength;
  alphaOut *= 1.0 - smoothstep(0.0, 1.0, uExplode) * 0.8;
  gl_FragColor = vec4(col * uGlow, alphaOut);
}
```
Final composite (full-screen):
```glsl
// FINAL_VERTEX
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
```
```glsl
// FINAL_FRAGMENT
uniform float iTime;
uniform sampler2D tScene;   // brain + real bloom, rendered off-screen
uniform vec3 iCornerBlue;
uniform vec3 iCornerOrange;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t) {
  float curv = .8, a = 1.9, b = 0.7; pos *= 2.;
  pos.x += curv * sin(t + a * pos.y) + t * b; pos.y += curv * cos(t + a * pos.x);
  pos.y += curv * sin(t + a * pos.z) + t * b; pos.z += curv * cos(t + a * pos.y);
  pos.z += curv * sin(t + a * pos.x) + t * b; pos.x += curv * cos(t + a * pos.z);
  return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
}
void main() {
  vec2 uv = 2. * vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
  vec3 col = 1.5 * iCornerBlue * w.x; col *= w.y; col += iCornerOrange * w.z;
  col *= smoothstep(0.6, 1., abs(uv.y));
  col *= smoothstep(-.5, 1., -uv.y * uv.x); col *= smoothstep(-.5, 1., -uv.y * uv.x);
  gl_FragColor = vec4(col + texture2D(tScene, vUv).xyz, 1.);
}
```

### Render pipeline (bloom + warped-gradient composite)
Run a two-composer pipeline (positive-priority loop — you own rendering):
1. **sceneComposer** (`renderToScreen=false`): `RenderPass(scene,camera)` → `ShaderPass(GammaCorrectionShader)`
   → `UnrealBloomPass(resolution, strength 0.69, radius 0.75, threshold 0)`. (Threshold 0 keeps the
   bloom temporally stable — no pixels popping across a brightness cutoff.)
2. **finalComposer**: one full-screen `ShaderPass` using FINAL_VERTEX/FINAL_FRAGMENT with uniforms
   `iTime`, `tScene` (= sceneComposer's read-buffer texture), `iCornerBlue (#0f5fcf)`,
   `iCornerOrange (#040f2e)`. Each frame: set `iTime`, `sceneComposer.render()`, set
   `tScene = sceneComposer.readBuffer.texture`, `finalComposer.render()`. Keep both composers sized
   to the canvas + DPR on resize.

### Per-frame scene updates
- `iTime = elapsed`; `iResolutionY = canvasHeight·dpr` for both materials.
- **Entrance reveal** (gated on the loader handing off — see Loader): start a 3.0s timer; `p` ramps
  0→1; `eased = 1 − (1−p)^4` (easeOutQuart). Set brain & ambient `iAlpha = eased`. The brain stays
  **fully assembled** and **flies in from near the camera while unwinding one full 360° horizontal
  turn**: lerp the group's `position.z` from `REVEAL_START_Z = 3.6`→0 by `eased`, and set
  `group.rotation.y = parallaxY + (1 − eased)·2π`, `group.rotation.x = parallaxX` (the cursor-parallax
  tilt, damped separately in refs, is layered on top of the unwinding spin). There is **no** entrance
  dispersal — `uExplode` is driven **only** by the scroll finale (keyframe 7).
- **Cursor halo:** track the pointer in NDC (`x = clientX/W·2−1`, `y = −(clientY/H·2−1)`).
  `uMouse` lerps toward it by `cursorFollow = 0.39`/frame; `uCursor` eases toward 1 while the pointer
  is on-screen (0 on `pointerout`) by `cursorFade = 0.1`/frame; `uAspect = W/H`; with `cr = cursorRadius
  = 0.24`, `uCursorRadius = clamp(cr·4.6 / cameraDistance, cr·0.4, cr·1.3)`. Also push `uCursorColor =
  #000000` + `uCursorStrength = 0.74` (the halo swells point size + lifts alpha; black adds no hue).
  Also tilt the whole group toward the pointer, scaled by `uCursor · cursorParallax (1)`
  (`targetRY = clamp(mouseX)·0.12·k`, `targetRX = −clamp(mouseY)·0.07·k`, eased by 0.04/frame).
- **Story focus:** sample the keyframes at scroll progress (below) and push `uHighlightPos = region`,
  `uHighlightStrength = highlight`, `uExplode = storyExplode` (entrance no longer disperses — it flies in).

### Camera rig + scroll mapping
Replace OrbitControls with a scroll-driven rig. Seven keyframes (camera position, look-at target,
the brain-local region anchor, highlight 0/1, explode 0/1):
```js
const KEYFRAMES = [
  { position:[0,0.25,5.4],  target:[-0.95,0,0],     region:[0,0,1],         highlight:0, explode:0 }, // Arrival
  { position:[1.7,0.7,3.5], target:[0.2,0.45,0.2],  region:[0.0,0.55,0.95], highlight:1, explode:0 }, // Cortex
  { position:[0,0,4.6],     target:[0,0,0],         region:[0,0,1],         highlight:0, explode:0 }, // Signals (takeover)
  { position:[-3.3,-0.2,1.9],target:[-0.15,-0.05,0.1],region:[-0.7,-0.1,0.35],highlight:1,explode:0 },// Network (temporal)
  { position:[0.25,0.45,-4.5],target:[0,0.1,-0.5],  region:[0.0,0.05,-1.05],highlight:1, explode:0 }, // Vision (occipital)
  { position:[-0.5,-1.7,-3.8],target:[0,-0.35,-0.4],region:[0.0,-0.55,-0.75],highlight:1,explode:0 }, // Balance (cerebellum)
  { position:[2.4,0.7,-2.4], target:[0,0.05,-0.2],  region:[0,0,0],         highlight:0, explode:1 }, // The Whole (finale)
];
```
- **Sample:** `scaled = clamp(progress,0,1)·(n−1)`; `i = floor(scaled)`; `t = scaled−i`; **linearly
  interpolate** position/target/region/highlight/explode between frame `i` and `i+1`.
- **Damp:** frame-rate-independent exponential damp of camera position and look-at toward the sample:
  `k = 1 − exp(−3.2·min(delta,0.1))`; `camera.position.lerp(sample.position,k)`;
  `lookAt.lerp(sample.target,k)`; `camera.lookAt(lookAt)`. On the very first frame, snap to keyframe 0
  (no fly-in from the default position).
- **Responsive framing:** `mobile = clamp((1.1 − aspect)/0.6, 0,1)`; when >0, drop the lateral offset
  and pull back: `target.x *= 1−0.85·mobile; target.y *= 1−0.4·mobile; position *= 1+0.4·mobile`.
- Under `prefers-reduced-motion: reduce`, hold progress at 0 (keyframe 0 framing).
- **Scroll source:** the page is as tall as 7 full-screen sections; map whole-page scroll to
  `progress` from `lenis.progress` (fallback: `scrollY / (scrollHeight − innerHeight)`). The active
  **section index** = `min(6, floor(progress·7))`.

## Layout & story sections (DOM, in order)

A `pointer-events:none` overlay (`z-20`) stacks **seven** `h-screen` panels. Brain chapters alternate
the copy to one side (so the brain stands opposite): chapters 1,3,5,7 → **left**, 2,4,6 → **right**
(by index 0,2,4,6 = left; 1,3,5 = right); the finale is **centred**. The takeover chapter (index 2)
is a centred minimal panel over the signal field. All chrome is **console/terminal styled** in the
sky palette: a `>` prompt + `SCREAMING_SNAKE` eyebrow with a blinking `_` cursor, wide letter-spacing,
a `▸ KEY  VALUE` readout row, and a `[ BRACKETED ]` CTA. Titles reveal line-by-line (each line clips
up from `y:110%`→`0` with opacity, ~95ms stagger, ~950ms easeOutCubic); eyebrows/bodies reveal
word-by-word (stagger ~20–40ms, ~720ms easeOutQuart); each column also fades up from `y:28px`. Helper:
`term(s) = s.toUpperCase().replace(/\s+/g,"_")`.

Per-chapter content (eyebrow / title / body / readouts):

1. **`#arrival`** (brain, left) — eyebrow `Arrival`; title **"Eighty-six billion neurons, one quiet field."**;
   body *"A specimen resolves out of the dark. The scan holds it steady while the system maps its
   surface, point by point — the most complex object we have ever tried to understand."*;
   readouts `▸ SPECIMEN  HUMAN · CEREBRUM`, `▸ STATUS  MAPPING`.
2. **`#cortex`** (brain, right) — eyebrow `The Cortex`; title **"The folded sheet where thought
   happens."**; body *"Two millimetres thick, crushed into ridges and valleys to fit. The system
   pushes in on the cortical surface — every fold buys more thinking room without a larger skull."*;
   readouts `▸ REGION  FRONTAL CORTEX`, `▸ DEPTH  2.0 mm`.
3. **`#signals`** (**takeover**, centred) — eyebrow `Signals`; title **"Everything you are, travelling
   as electricity."**; body *"Step inside the traffic. Each pulse is a thought in transit — chemical
   to electric and back, a hundred metres a second, never still."*; readouts `▸ RATE  4.21 M/s`,
   `▸ CHANNEL  AXONAL`. Renders inside the dark **terminal panel** (see Takeover), not a side column.
4. **`#network`** (brain, left) — eyebrow `The Network`; title **"No neuron thinks alone."**; body
   *"Trillions of connections wire the regions into one system. The scan isolates the temporal flank
   and watches it bind to the rest — meaning lives in the links, not the nodes."*; readouts
   `▸ REGION  TEMPORAL · ASSOC.`, `▸ LINKS  1.0e14`.
5. **`#vision`** (brain, right) — eyebrow `Vision`; title **"The world arrives at the back of your
   head."**; body *"The scan swings behind the brain to the occipital pole — where light becomes
   shape, motion, and depth long before you know you are seeing."*; readouts `▸ REGION  OCCIPITAL
   LOBE`, `▸ CHANNEL  VISUAL · V1`.
6. **`#balance`** (brain, left) — eyebrow `Balance`; title **"The quiet half that keeps you
   upright."**; body *"Tucked beneath and behind, the cerebellum holds a tenth of the mass and over
   half the neurons — timing, balance, and every movement you never think about."*; readouts
   `▸ REGION  CEREBELLUM`, `▸ NEURONS  69 B`.
7. **`#whole`** (brain, **centred** finale) — eyebrow `The Whole`; title **"Then it becomes the
   network it always was."**; body *"The surface lets go and the points scatter into constellation —
   the brain resolving into the living web of signal it has been all along. End of scan."*; readouts
   `▸ COHERENCE  98.4%`, `▸ SCAN  COMPLETE`. **CTA** `[ BEGIN AGAIN ]` (the only `pointer-events:auto`
   element) → smooth-scroll back to `#arrival`.

Section typography: titles ~`clamp` from `2rem`→`3.4rem`, semibold, `leading-1.16`, tight tracking,
white; eyebrows `0.42em` tracking, `text-brain-sky/75`; bodies `text-lg/xl`, `text-brain-sky/70`;
readouts above a `1px` `brain-sky/15` top border, tiny uppercase `▸` rows (`brain-sky/40` label,
`brain-sky/90` value, tabular-nums). Side panels `max-w-2xl`; padding `px-8 md:px-16 lg:px-24`.

## Persistent chrome

### Telemetry status bar (top, `z-30`, fixed, full-width)
A `h-9 md:h-10` console title bar: `border-b border-brain-sky/15`, `bg-brain-void/55`,
`backdrop-blur-md`, tiny uppercase `0.2em` tracking, `text-brain-sky/80`. Left→right segments
(separated by `border-l brain-sky/15`, some hidden at small widths): a pulsing dot + **`NEURAL_MONITOR`**
`// LIVE`; `NEURONS 86,000,000,000`; `PARTICLES 140,000`; `FIRING <n.nn M/S>`; `COHERENCE <nn.n%>`;
`FOCUS <REGION>`. Pushed to the right: a small **waveform** (36 bars, the last bar bright
`brain-sky`, the rest `brain-sky/35`) and a `>` `_` blinking prompt. Live behaviour (client timers):
every ~140ms nudge FIRING within `[3.4,5.6]` (start 4.21), COHERENCE within `[0.74,0.99]` (start
0.92), and shift a new random waveform bar in (height `[6,100]`). FOCUS shows the active chapter's
first readout value (e.g. `FRONTAL_CORTEX`), falling back to a region that cycles every 1.5s through
`frontal cortex, occipital lobe, hippocampus, cerebellum, parietal lobe, brain stem, temporal lobe`;
animate each focus change in (fade + slide x 6→0). Bar fades/slides in on load (delay ~350ms).

### Chapter rail (bottom-centre, `z-30`, fixed)
`pointer-events:none`, `bottom-8 md:bottom-10`, a centred row of 7 ticks. Each tick = a short
horizontal bar over a 2-digit index `01`…`07`. The **active** index's bar is `w-8 bg-brain-sky/90`
and its number `text-brain-sky/90`; inactive bars are `w-4 bg-brain-sky/25`, numbers `brain-sky/30`.
Fades in on load (delay ~300ms).

## The takeover "signal field" (Signals chapter)

A `fixed inset-0 z-10 bg-brain-void` layer whose **opacity springs 0→1 while section index === 2**
and back to 0 otherwise (so the brain dissolves away, then returns; ~700ms easeInOutCubic). Inside:
a full-screen `<canvas>` 2D node network + a vignette overlay
`radial-gradient(circle at center, transparent 40%, var(--brain-void) 92%)`. Network: **64 nodes**,
each `{x,y}` random, velocity `(rand−0.5)·0.35`; bounce off edges. Each frame clear, move nodes, draw
**links** between any two nodes closer than **150px** with
`strokeStyle rgba(142,203,255, 0.18·(1−d/150))`, then draw nodes as `arc(x,y,1.6)` filled
`rgba(190,224,255, 0.35 + 0.45·pulse)` where `pulse = 0.5 + 0.5·sin(time·0.004 + x·0.01)`. Only run
the canvas loop while the field is active. The takeover **panel** (chapter 3 copy) renders centred over
it inside a dark **terminal window**: a rounded `border-brain-sky/20 bg-brain-void/80 backdrop-blur`
card with a header (`SIGNALS.LOG` title + three dim dots + a pulsing `LIVE` dot), the body as a
`>`-prompted word-reveal line, the `▸ KEY  VALUE` readouts under a divider, and a trailing `>` `_`
blinking cursor.

## The loader / reveal (hero moment — the preview captures this)

A `fixed inset-0 z-50` curtain over `radial-gradient(circle at 50% 44%, var(--brain-deep),
var(--brain-void) 70%)`. Centre: a **breathing neural core** — concentric soft glows + two thin
`brain-sky/40` rings + a blurred `brain-sky/70` dot, all scaling between ~0.85 and ~1.12 on a ~2.9s
ease-in-out loop (the glow opacity breathing 0.3↔0.7). Below: `NEURAL_ATLAS` in wide `0.5em` tracking,
then a `>` terminal boot line that changes with progress — **`INITIALIZING NEURAL FIELD`** (<35%) →
**`SAMPLING CORTICAL SURFACE`** (<75%) → **`CALIBRATING SYNAPSES`** — with a blinking `_` caret, then a
thin **progress meter** (a `brain-sky` fill with an azure glow + a `NN%` readout). Drive progress from
the GLTF/asset load (0→100). Hold a minimum ~900ms (never flash), hard-cap ~6000ms. When loading
settles: flip the shared `entered` flag (which **starts the brain's 3s entrance — the fully-assembled
brain flies in from near the camera and unwinds one full 360° horizontal turn into place**) and fade
the curtain out over ~1100ms easeInOutCubic, then unmount. About **500ms after** the handoff, the
story copy + chapter rail fade up (opacity/translate; the stack is mounted from first paint so the
reveal is a cheap fade with no remount/stall) — letting the brain's fly-in breathe alone for a beat
first. The brain flying in *as* the curtain fades is the signature reveal.

## Fixed parameters (bake these in)

- Palette: `--brain-void #01040e`, `--brain-deep #04122e`, `--brain-azure #1f6ae0`, `--brain-sky #8ecbff`;
  scene bg/fog `#01040e`, fog range `0→18`.
- Bloom `strength 0.69, radius 0.75, threshold 0`; composite corners `iCornerBlue #0f5fcf`,
  `iCornerOrange #040f2e`.
- Counts: brain `surfaceCount 140000`, ambient `4500`; bounding radius `1.45`. Entrance flies in from
  `REVEAL_START_Z 3.6` (not from behind) + one full `2π` Y spin that unwinds into place.
- Entrance `3.0s` easeOutQuart; camera damp `3.2`; cursor lerps `uMouse 0.39 / uCursor 0.1 / tilt 0.04`,
  cursor halo `color #000000 · strength 0.74 · radius 0.24 · parallax 1`.
- All numeric brain params: the `BRAIN_CONFIG` object above (sizes, speeds, synapseRate 0.1,
  flowSpeed 2.3, flowAmount 0.025, glowStrength 2, centerRadius 0.37, centerFalloff 4, ambientSize
  0.069, ambientRange 15.5, deepColor #010b1e, highlightRadius 0.6, isolateStrength 0.88,
  focusFadeStrength 0.55, explodeDistance 5, etc.).
- Font: General Sans (400/500/600/700). Telemetry NEURONS `86,000,000,000`.

## Assets

```
ASSET_BASE_URL = https://api.getlayers.ai/storage/v1/object/public/public/assets/neural-monitor-bc250d303d
```
- **Brain model** → `https://api.getlayers.ai/storage/v1/object/public/public/assets/neural-monitor-bc250d303d/rotten-brain.glb`
  (loaded by `GLTFLoader`; sampled into the point cloud as described — its meshes are never rendered
  directly, only sampled). Point `BRAIN_CONFIG.modelUrl` at this URL.