# Recreate this Three.js scene: Wave Galaxy

You are an expert Three.js creative developer. Produce a **single self-contained `index.html`**
that renders the scene below **exactly** as specified — same geometry, shaders, colors, motion,
and postprocessing. Load Three.js **r0.143.0** via an ES-module importmap from unpkg; no build
step, no bundler, pure ES modules in one `<script type="module">`. Hardcode every value given
here as fixed constants.

## What it looks like
A galaxy-like disc of ~120,000 additive points forming an animated radial wave over a small
glowing core cloud, set on deep black. The palette runs from a near-black navy (`#02132e`) through
electric blue (`#1f6bff`) to a bright cyan highlight (`#8ef0ff`), with pale icy-blue core dots
(`#bfe6ff`) and soft sky-blue ambient motes (`#9fd0ff`). As you scroll, the camera dives toward the
plane while the wave erupts taller, the disc spreads outward, the spin accelerates and faint chaos
creeps in; moving the cursor pushes nearby points aside.

## Page & boilerplate
- importmap: `three` → `https://unpkg.com/three@0.143.0/build/three.module.js`, `three/addons/` →
  `https://unpkg.com/three@0.143.0/examples/jsm/`.
- Imports: `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass` from
  `three/addons/postprocessing/…`, plus `GammaCorrectionShader` and `CopyShader` from
  `three/addons/shaders/…`.
- Full-window fixed `<canvas id="scene">` (`position:fixed; inset:0; width:100vw; height:100vh;
  display:block`) on a black page (`html,body{margin:0;padding:0;background:#000}`, `body{height:100%}`).
- A tall scroll host so the page scrolls (drives the camera dive + wave amplitude):
  `<div id="scroll-host" style="height:300vh"></div>`.
- Optional tiny "scroll ↓" hint pinned bottom-center: `position:fixed; bottom:18px; left:50%;
  transform:translateX(-50%); color:rgba(255,255,255,.55); font:11px/1 system-ui; letter-spacing:1px;
  text-transform:uppercase; pointer-events:none; z-index:10`.
- `THREE.WebGL1Renderer({ canvas, antialias:true })`, `setPixelRatio(window.devicePixelRatio)`.
  Also set `renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap`.
- Scene background `0x000000`; `scene.fog = new THREE.Fog(0x000000, 0, 15)`.
- Camera: `PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 80)` at `(0, 0, 3)`. Add it to the scene.
- **Layers:** `const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 }`. Enable
  `TORUS_SCENE`, `BLOOM_SCENE`, and `ENTIRE_SCENE` on the camera.

## Postprocessing
Build three composers off the one renderer and a single shared `RenderPass(scene, camera)`:

1. **torusComposer** (`renderToScreen = false`): `RenderPass` → `ShaderPass(GammaCorrectionShader)`
   → `UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.6, 0.3, 0)` →
   `ShaderPass(CopyShader)`.
2. **bloomComposer** (`renderToScreen = false`): `RenderPass` →
   `UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 1.0, 1.15, 0)` →
   `ShaderPass(GammaCorrectionShader)`.
3. **finalComposer**: `RenderPass` → `finalPass` (the `FinalPass` `ShaderPass` below).

Wire the final pass texture inputs:
`finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture` and
`finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture`.

The `FinalPass` shader (verbatim) is in **Atmosphere / extra layers** below.

## Fixed parameters (bake these in)
Hardcode these as constants wherever they're used:

- Ambient motes: color `#9fd0ff`, count `180`, base size `22`, drift speed `0.8`.
- Wave colors: cool `#02132e`, warm `#1f6bff`, light `#8ef0ff`; core/rock color `#bfe6ff`.
- Scroll choreography: camera dive distance `scrollDiveZ = 4`, wave amplitude target
  `scrollWaveAmp = 6`, disc expand `scrollExpand = 0.55`, spin multiplier `scrollSpin = 6`,
  chaos `scrollChaos = 0.35`.
- Pointer repulsion: radius `0.35`, strength `0.5`.
- FinalPass corner tints: `cornerBlue = #10204a`, `cornerOrange = #0a2e6b`.

Helper used everywhere to turn a hex string into a normalized RGB vector:
```js
function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}
const Lerp = (a, b, t = 0.075) => a + (b - a) * t
```

Track the pointer in pixels:
```js
const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })
```

## Geometry
Build a `Wave` as a `THREE.Group` (`instance`) holding two `THREE.Points` systems. Fixed members:
height `H = 0.1`, radius `R = 2.2`, counts `{1: 120000, 2: 1500}`. Both point systems sit at
`position = (0, 0, -0.8)` and `rotation = (0.6, 0, 0)`. The group starts hidden at `(0, 0, -20)`
and is added to the scene. Enable `LAYERS.ENTIRE_SCENE` on both `Points`. A per-frame lerped pointer
`mouseCurrent = { x:0, y:0, z:0 }` feeds the shaders.

**Wave 1 (the disc — 120000 points).** For each point: a radius biased toward the rim, a random
angle, and a height from a tiny fbm of sine harmonics:
```js
const vertices = [], sizes = [], id = []
const sine = x => .6 * Math.sin(x) + .3 * Math.cos(2 * x) + .1 * Math.sin(4 * x)
const noise1d = (a, r, q) => sine(10. * q * (a + 2 * r))
const fbm = (a, r) => {
  let c = 1, p = 1.3, q = 0.9
  let f = c * noise1d(a, r, 1); c *= q
  f += c * noise1d(a, r, p); c *= q
  f += c * noise1d(a, r, p * p); c *= q
  f += c * noise1d(a, r, p * p * p); c *= q
  return f / 3.43
}
for (let i = 0; i < 120000; i++) {
  const r = 2.2 * Math.pow(Math.random(), 0.45)   // R = 2.2, exponent 0.45 → more points toward rim
  const a = Math.random() * 2 * Math.PI
  vertices.push(r * Math.sin(a), 0.1 * fbm(a, r), r * Math.cos(a))  // H = 0.1
  sizes.push(10 + 10 * Math.random())
  id.push(Math.random())
}
```
Attributes: `position` (3), `size` (1), `id` (1), all `Float32BufferAttribute`.

**Wave 2 (the core — 1500 points).** A denser dome near the center:
```js
const vertices = [], sizes = [], id = []
for (let i = 0; i < 1500; i++) {
  const r = .85 * 2.2 * Math.sqrt(Math.random())     // .85 * R
  const a = Math.random() * 2 * Math.PI
  vertices.push(r * Math.sin(a), 0.1 * (r * r * 6 + 1), r * Math.cos(a))  // H = 0.1
  sizes.push(30 + 30 * Math.random())
  id.push(Math.random())
}
```
Same three attributes.

## Material & shaders

**Material 1** — `THREE.ShaderMaterial` with `blending: THREE.AdditiveBlending`, `depthTest: false`,
`transparent: true`. Uniforms:
```js
{
  iTime: { value: 0 },
  iMouse: { value: this.mouseCurrent },          // the {x,y,z} object, lerped each frame
  uAspect: { value: window.innerWidth / window.innerHeight },
  uPointerRadius:   { value: 0.35 },
  uPointerStrength: { value: 0.5 },
  iAnimate: { value: 0 },
  uOpacity: { value: 1 },
  uCool:  { value: hexToVec3('#02132e') },
  uWarm:  { value: hexToVec3('#1f6bff') },
  uLight: { value: hexToVec3('#8ef0ff') },
  uWaveAmp: { value: 1.0 },
  uExpand:  { value: 1.0 },
  uChaos:   { value: 0.0 }
}
```

Material 1 vertex shader (verbatim):
```glsl
attribute float size; attribute float id;
uniform vec2 iMouse; uniform float iAnimate;
uniform float uWaveAmp; uniform float uExpand; uniform float uChaos;
uniform float uAspect; uniform float uPointerRadius; uniform float uPointerStrength;
varying vec3 pack;
void main() {
  /* Scroll-driven transformation: amplify the wave height, push the
     disc outward, sprinkle some chaos. pack still uses the un-warped
     radial info so the fragment shader's fade ranges remain valid. */
  pack.x = length(position.xz);
  pack.y = atan(position.z, position.x);
  pack.z = position.y;
  vec3 jitter = vec3(
    fract(sin(id * 12.9898) * 43758.5453) - 0.5,
    fract(sin(id * 78.233 ) * 12345.6789) - 0.5,
    fract(sin(id * 39.123 ) * 65432.1234) - 0.5
  );
  vec3 p = position;
  p.y  *= uWaveAmp;
  p.xz *= uExpand;
  p   += jitter * uChaos;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = size / -mv.z * (.5 + .5 * iAnimate);
  vec4 res = projectionMatrix * mv;
  vec2 ndc = res.xy / res.w;
  vec2 diff = ndc - iMouse;
  float pdist = length(diff * vec2(uAspect, 1.0));
  float f = clamp(uPointerRadius - pdist, 0.0, 1.0);
  vec2 dir = length(diff) > 1e-4 ? normalize(diff) : vec2(0.0);
  res.xy += dir * (f * f * uPointerStrength) * res.w;
  float a = pow(iAnimate, 0.6);
  res.xy *= clamp(2. * a + pow(id, .7) - 1., 0., 1.);
  gl_Position = res;
}
```

Material 1 fragment shader (verbatim — note the `0.1` and `2.2` values are inlined from `H` and `R`):
```glsl
uniform float iTime; uniform float uOpacity; uniform float iAnimate;
uniform vec3 uCool; uniform vec3 uWarm; uniform vec3 uLight;
varying vec3 pack;
void main() {
  float r = pack.x; float a = pack.y; float py = pack.z;
  float glow = pow(0.018 / max(0., r), .9);
  float fading = smoothstep(-0.1, .8 * 0.1, py) * smoothstep(2.6 * 2.2, .7 * 2.2, r * r);
  a = sin(4. * ((-a + 2. * r)));
  float blink = clamp((.2 + 1.5 * r * sin(a)) * (.5 + .5 * sin(r * 8. + iTime * 4.)), 0., 1.);
  vec3 col = uCool * .6;
  vec3 col2 = uWarm * .6;
  vec3 light = uLight * .8;
  vec3 tex = 1. - smoothstep(.6, 1., vec3(length(2. * gl_PointCoord - 1.)));
  col = mix(col, col2, blink);
  gl_FragColor = vec4(col * tex * fading + tex * light * glow, uOpacity);
}
```

**Material 2** — a second `THREE.ShaderMaterial` that **shares material 1's uniforms object**
(reuse the exact same uniforms instance) plus one extra: `uRock: { value: hexToVec3('#bfe6ff') }`.
`blending: THREE.AdditiveBlending`, `depthTest: false`, `transparent: false`.

Material 2 vertex shader (verbatim — `0.1` is `H`):
```glsl
attribute float size; attribute float id;
uniform float iTime; uniform vec2 iMouse; uniform float iAnimate;
uniform float uWaveAmp; uniform float uExpand; uniform float uChaos;
uniform float uAspect; uniform float uPointerRadius; uniform float uPointerStrength;
varying float rn;
void main() {
  rn = id;
  float rr = position.x * position.x + position.z * position.z;
  vec3 pos = vec3(position.x, 0.1 * sin(iTime * .6 + 100. * rn) / (rr * .33 + .8), position.z);
  pos.y  *= uWaveAmp;
  pos.xz *= uExpand;
  vec3 jitter = vec3(
    fract(sin(id * 12.9898) * 43758.5453) - 0.5,
    fract(sin(id * 78.233 ) * 12345.6789) - 0.5,
    fract(sin(id * 39.123 ) * 65432.1234) - 0.5
  );
  pos += jitter * uChaos;
  vec4 vpos = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size / -vpos.z * (0.8 + 0.2 * sin(iTime * (1. + rn) * 3.)) * (.5 + .5 * iAnimate);
  vec4 res = projectionMatrix * vpos;
  vec2 ndc = res.xy / res.w;
  vec2 diff = ndc - iMouse;
  float pdist = length(diff * vec2(uAspect, 1.0));
  float f = clamp(uPointerRadius - pdist, 0.0, 1.0);
  vec2 dir = length(diff) > 1e-4 ? normalize(diff) : vec2(0.0);
  res.xy += dir * (f * f * uPointerStrength) * res.w;
  float a = pow(iAnimate, 0.9);
  res.xy *= clamp(2. * a + pow(id, .7) - 1., 0., 1.);
  gl_Position = res;
}
```

Material 2 fragment shader (verbatim):
```glsl
uniform float uOpacity; uniform vec3 uRock; varying float rn;
void main() {
  vec3 color = uRock * .8;
  vec3 tex = 1. - smoothstep(.3, 1., vec3(length(2. * gl_PointCoord - 1.)));
  gl_FragColor = vec4(color * tex, (.5 + .5 * rn) * uOpacity);
}
```

## Atmosphere / extra layers

**FinalPass composite shader.** A `ShaderPass` whose uniforms are:
```js
{
  iTime: { value: 0 }, tDiffuse: { value: null },
  torusTexture: { value: null }, bloomTexture: { value: null }, haloTexture: { value: null },
  iCornerBlue:   { value: hexToVec3('#10204a') },
  iCornerOrange: { value: hexToVec3('#0a2e6b') }
}
```
Vertex shader (verbatim):
```glsl
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
```
Fragment shader (verbatim):
```glsl
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 iCornerBlue; uniform vec3 iCornerOrange; varying vec2 vUv;
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
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  vec3 atmoBg = vec3(0.012, 0.05, 0.13) * (1.0 - 0.4 * length(uv));
  gl_FragColor = vec4(atmoBg + col * 0.2 + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}
```
(`haloTexture` stays unset/null — it samples to black.)

**Ambient drifting motes.** A camera-attached `THREE.Points` cloud built in an IIFE. `N = 180`
points, each with a random position in `[-1,1]^3`, a `size` of `22 * (0.4 + Math.random())`, and a
random `seed`. Attributes: `position` (3), `size` (1), `seed` (1). Material:
```js
new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: hexToVec3('#9fd0ff') },
    uRes: { value: new THREE.Vector2(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio) }
  },
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false
})
```
Vertex shader (verbatim):
```glsl
attribute float size; attribute float seed; uniform float uTime; uniform vec2 uRes;
varying float vA;
vec3 warp(vec3 p, float t){ float c=0.9,a=1.9,b=0.02,s=0.05; p*=2.;
  p.x+=c*sin(s*t+a*p.y)+t*b; p.y+=c*cos(s*t+a*p.x); p.y+=c*sin(s*t+a*p.z)+t*b;
  p.z+=c*cos(s*t+a*p.y); p.z+=c*sin(s*t+a*p.x)+t*b; p.x+=c*cos(s*t+a*p.z);
  return cos(p+vec3(1,2,4)); }
void main(){
  vec3 v = position*4.0 + warp(position, uTime)*1.2;
  vec4 mv = modelViewMatrix * vec4(v, 1.0);
  float r = length(v); float farF = 1.0 - smoothstep(5.0, 6.5, r); float nearF = smoothstep(0.0, 0.5, -mv.z);
  vA = farF * nearF;
  gl_PointSize = size * uRes.y / 900.0 / -mv.z; gl_PointSize = max(gl_PointSize, 1.0);
  gl_Position = projectionMatrix * mv;
}
```
Fragment shader (verbatim):
```glsl
uniform vec3 uColor; varying float vA;
void main(){ vec2 p = gl_PointCoord - 0.5; float l = length(p); if (l > 0.5) discard;
  float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.55); }
```
The mote `Points` has `frustumCulled = false`, `LAYERS.ENTIRE_SCENE` enabled, and an
`onBeforeRender` that runs each frame:
```js
const t = performance.now() / 1000
atmoMat.uniforms.uTime.value = t * 0.8 * 8.0      // atmoSpeed = 0.8
pts.position.copy(camera.position)                 // motes ride the camera
finalPass.uniforms.iTime.value = t
```

## Animation & interaction

**Intro (`appearIn`).** On load, animate over ~2s: slide the group's `z` from `-20` to `0` with an
OutQuartic ease (`1 - (1 - t)^4`) lerped through `Lerp`, ramping `uOpacity` 0→1 over a window
starting at +500ms lasting 1500ms; simultaneously ramp `iAnimate` 0→1 over 2s with a smoothstep
ease (`t*t*(3-2*t)`), clamping it to `1` at the end. Drive it with `requestAnimationFrame` /
`performance.now()`.

**Scroll mapping.** Track scroll as a normalized `0..1`:
```js
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
let scrollTarget = 0, scrollCurrent = 0
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  scrollTarget = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0
}
window.addEventListener('scroll', updateScroll, { passive: true }); updateScroll()
const baseCameraZ = camera.position.z   // 3
```

**Per-frame `wave.render(scrollT)`** (where `scrollT` is the smoothed scroll):
```js
const t = performance.now() / 1000
const dt = t - this.t0
const spinMul = 1 + scrollT * 6                       // scrollSpin
this.particles1.rotation.y += 0.15 * spinMul * dt
this.particles2.rotation.y += 0.15 * spinMul * dt
this.material1.uniforms.iTime.value = t
this.material1.uniforms.uWaveAmp.value = 1 + scrollT * (6 - 1)   // scrollWaveAmp = 6
this.material1.uniforms.uExpand.value  = 1 + scrollT * 0.55      // scrollExpand
this.material1.uniforms.uChaos.value   = scrollT * scrollT * 0.35 // scrollChaos
this.t0 = t
// lerp the NDC pointer toward the cursor each frame
const target = this.getScenePointer()
this.mouseCurrent.x = Lerp(this.mouseCurrent.x, target.x, 0.09)
this.mouseCurrent.y = Lerp(this.mouseCurrent.y, target.y, 0.09)
this.material1.uniforms.iMouse.value = this.mouseCurrent
```
where the pointer is mapped to NDC:
```js
getScenePointer() {
  return new THREE.Vector3(
    (mouse.x / this.canvas.clientWidth)  *  2 - 1,
    (mouse.y / this.canvas.clientHeight) * -2 + 1,
    0.5
  )
}
```

**Render loop.** Each frame:
```js
function render() {
  requestAnimationFrame(render)
  scrollCurrent = Lerp(scrollCurrent, scrollTarget, 0.08)   // weighted, not snappy
  camera.position.z = baseCameraZ - scrollCurrent * 4       // scrollDiveZ = 4, dives toward the plane
  wave.render(scrollCurrent)
  const t = performance.now() / 1000
  finalPass.uniforms.iTime.value = t
  camera.layers.set(LAYERS.TORUS_SCENE);  torusComposer.render()
  camera.layers.set(LAYERS.BLOOM_SCENE);  bloomComposer.render()
  camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render()
}
render()
```

**Resize.** On resize and once at startup: set renderer pixel ratio + size (`setSize(w, h, false)`),
update `camera.aspect` + `updateProjectionMatrix()`, set pixel ratio + size on all three composers,
and update `material1.uniforms.uAspect.value = w / h`. Also call `updateScroll()` on resize.

## Assets
None — fully procedural.