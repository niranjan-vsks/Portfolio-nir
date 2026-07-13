# Recreate this Three.js scene: Corner Flames

You are an expert Three.js creative developer. Produce a **single self-contained `index.html`**
that renders the scene below **exactly** as specified — same geometry, shaders, colors, motion,
and postprocessing. Load Three.js **r0.143.0** via an ES-module importmap from unpkg; no build
step, no bundler, pure ES modules in one `<script type="module">`. Hardcode every value given
here as fixed constants.

## What it looks like

Turbulent green-teal flames lick out of the **top-left** and **bottom-right** corners of an
otherwise black frame, churning and folding over a deep teal-green atmospheric vignette. The flames
fade in over ~1.5 seconds and then loop endlessly — a glowing, bloom-lit corner overlay with a cool
dark-blue fold accent inside the brighter body.

## Page & boilerplate

- importmap: `three` → `https://unpkg.com/three@0.143.0/build/three.module.js`,
  `three/addons/` → `https://unpkg.com/three@0.143.0/examples/jsm/`.
- A full-window `<canvas id="scene">` filling a black page: `html, body { margin:0; padding:0;
  height:100%; background:#000; overflow:hidden; }` and `canvas { display:block; width:100%;
  height:100%; }`.
- `THREE.WebGL1Renderer({ canvas, antialias: true })`, `setPixelRatio(window.devicePixelRatio)`.
  Also set `renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap`.
- Scene background `0x000000`, fog `new THREE.Fog(0x000000, 0, 15)`.
- Camera: `PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80)` at
  position `(0, 0, 3)`. (The effect is a clip-space quad, so the camera is effectively irrelevant,
  but keep it for the render rig.) `scene.add(camera)`.
- Layer constants: `const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 }`.
  Enable on the camera: `camera.layers.enable(LAYERS.TORUS_SCENE);
  camera.layers.enable(LAYERS.BLOOM_SCENE); camera.layers.enable(LAYERS.ENTIRE_SCENE)`.

### Hex helper

```js
function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}
```

## Fixed parameters (bake these in)

Use these exact values as constants wherever referenced below:

- `colorA` = `#0dbf80` (flame body)
- `colorB` = `#001f33` (cool fold accent)
- `brightness` = `1.35`
- `speed` = `1.5`
- `spread` = `0.17`
- `diag` = `-1`
- `alpha` = `2`
- `bgColor` = `#04140f` (atmospheric vignette behind the flames)

## Postprocessing

Import `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass`, `GammaCorrectionShader`,
`CopyShader` from `three/addons/`. Build three composers exactly as follows.

```js
const renderScene = new RenderPass(scene, camera)

const torusComposer = new EffectComposer(renderer); torusComposer.renderToScreen = false
torusComposer.addPass(renderScene)
torusComposer.addPass(new ShaderPass(GammaCorrectionShader))
torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.22, 0.2, 0))
torusComposer.addPass(new ShaderPass(CopyShader))

const bloomComposer = new EffectComposer(renderer); bloomComposer.renderToScreen = false
bloomComposer.addPass(renderScene)
bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.55, 0))
bloomComposer.addPass(new ShaderPass(GammaCorrectionShader))

const finalPass = new ShaderPass(FinalPass)
finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture
finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture

const finalComposer = new EffectComposer(renderer)
finalComposer.addPass(renderScene); finalComposer.addPass(finalPass)
```

`UnrealBloomPass` args are `(resolution, strength, radius, threshold)` — so the torus composer
bloom is `strength 0.22, radius 0.2, threshold 0`, and the bloom composer is
`strength 0.4, radius 0.55, threshold 0`.

### FinalPass composite shader (verbatim)

The final pass composites the torus + bloom + base render over a dark complementary background
vignette built from `uBg`. Define it before the composer wiring:

```js
const FinalPass = {
  uniforms: {
    tDiffuse: { value: null }, torusTexture: { value: null }, bloomTexture: { value: null }, haloTexture: { value: null },
    uBg: { value: hexToVec3('#04140f') }
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture; uniform vec3 uBg;
    varying vec2 vUv;
    void main() {
      vec3 halo = texture2D(haloTexture, vUv).xyz;
      vec3 bg = uBg * (1.0 - 0.4 * length(2. * vUv - 1.));
      gl_FragColor = vec4(bg + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
    }`
}
```

## Geometry

A single full-screen clip-space quad: `new THREE.PlaneBufferGeometry(2, 2)`. The vertex shader
writes `gl_Position = vec4(position, 1.0)` directly, so the quad covers the whole viewport
regardless of camera. The mesh has `frustumCulled = false` and is enabled on
`LAYERS.ENTIRE_SCENE` (`mesh.layers.enable(LAYERS.ENTIRE_SCENE)`), then added to the scene.

## Material & shaders

`THREE.ShaderMaterial` with: `transparent: true, depthTest: false, depthWrite: false,
blending: THREE.AdditiveBlending`. Uniforms:

- `iTime` (float, animated each frame)
- `iAlpha` (float, fade-in value, animated each frame)
- `uColorA` = `hexToVec3('#0dbf80')`
- `uColorB` = `hexToVec3('#001f33')`
- `uBrightness` = `1.35`
- `uSpeed` = `1.5`
- `uSpread` = `0.17`
- `uDiag` = `-1`

Vertex shader (verbatim):

```glsl
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
```

Fragment shader (verbatim):

```glsl
uniform float iTime; uniform float iAlpha;
uniform vec3 uColorA; uniform vec3 uColorB;
uniform float uBrightness; uniform float uSpeed; uniform float uSpread; uniform float uDiag;
varying vec2 vUv;

vec3 warp3d(vec3 pos, float t) {
  float curv = .8, a = 1.9, b = 0.7;
  pos *= 2.;
  pos.x += curv * sin(t + a * pos.y) + t * b;
  pos.y += curv * cos(t + a * pos.x);
  pos.y += curv * sin(t + a * pos.z) + t * b;
  pos.z += curv * cos(t + a * pos.y);
  pos.z += curv * sin(t + a * pos.x) + t * b;
  pos.x += curv * cos(t + a * pos.z);
  return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
}

void main() {
  vec2 uv = 2. * vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * uSpeed), vec3(1.5));
  vec3 col = 1.5 * uColorA * w.x;
  col *= w.y;
  col += uColorB * w.z;
  col *= smoothstep(uSpread, 1., abs(uv.y));          // top & bottom bands
  float m = smoothstep(uDiag, 1., -uv.y * uv.x);       // top-left + bottom-right
  col *= m * m;
  gl_FragColor = vec4(col * uBrightness, iAlpha);
}
```

The two masks are the signature: `smoothstep(uSpread, 1., abs(uv.y))` keeps the effect to the top
& bottom bands; `smoothstep(uDiag, 1., -uv.y * uv.x)` (squared) keeps it to the **top-left +
bottom-right** diagonal, since `-uv.y * uv.x` is positive only in those two quadrants.

## Resize

On load and on `window.resize`, update `renderer.setPixelRatio(devicePixelRatio)` and
`renderer.setSize(w, h, false)`, set `camera.aspect = w / h; camera.updateProjectionMatrix()`, and
for each of `torusComposer`, `bloomComposer`, `finalComposer` call `setPixelRatio(dpr)` and
`setSize(w, h)`.

## Animation & interaction

Capture an `appearStart = performance.now()` when the scene mesh is created. Each frame, update the
flame uniforms before rendering:

```js
this.uniforms.iTime.value = performance.now() / 1000
const elapsed = performance.now() - this.appearStart
const fade = Math.max(0, Math.min(1, (elapsed - 200) / 1500))   // 1.5s fade-in, 200ms delay
this.uniforms.iAlpha.value = fade * 2                            // alpha = 2
```

The render loop renders each composer in turn on its camera layer:

```js
function render() {
  requestAnimationFrame(render)
  sceneObj.render()
  camera.layers.set(LAYERS.TORUS_SCENE);  torusComposer.render()
  camera.layers.set(LAYERS.BLOOM_SCENE);  bloomComposer.render()
  camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render()
}
render()
```

There is no scroll or pointer interaction — the scene is a self-running, looping corner-flame
overlay.

## Assets

None — fully procedural.