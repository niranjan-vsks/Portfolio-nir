# Recreate this Three.js scene: Plume

You are an expert Three.js creative developer. Produce a **single self-contained `index.html`**
that renders the scene below **exactly** as specified — same geometry, shaders, colors, motion,
and postprocessing. Load Three.js **r0.143.0** via an ES-module importmap from unpkg; no build
step, no bundler, pure ES modules in one `<script type="module">`. Hardcode every value given
here as fixed constants.

## What it looks like
A **plume**: a tall, wavering column of glittering particle smoke that rises from a soft dust pool
on the floor, churns into rolling cauliflower billows, and tapers to a white-hot flickering tip —
all over a near-black starfield void. The column is tight and warm-white at the top, broad and
cool grey-blue along the floor, threaded with brighter twinkling glints. The camera slowly
auto-orbits the column while the mouse adds gentle parallax. A faint vertical gradient and a soft
vignette frame the whole thing as deep space.

## Page & boilerplate
- importmap: `three` → `https://unpkg.com/three@0.143.0/build/three.module.js`, `three/addons/` →
  `https://unpkg.com/three@0.143.0/examples/jsm/`.
- Module imports: `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass` from
  `three/addons/postprocessing/…`; `GammaCorrectionShader` and `CopyShader` from
  `three/addons/shaders/…`.
- Full-window `<canvas id="scene">`; page is `margin:0; height:100%; background:#000; overflow:hidden`,
  canvas `display:block; width:100%; height:100%`.
- `THREE.WebGL1Renderer({ canvas, antialias:true })`, `setPixelRatio(window.devicePixelRatio)`,
  `shadowMap.enabled = true`, `shadowMap.type = THREE.VSMShadowMap`.
- Scene: `background = new THREE.Color(0x000000)`, `fog = null`.
- Camera: `PerspectiveCamera(50, innerWidth/innerHeight, 0.1, 240)` at `(0, camHeight, camDist)`
  (i.e. `(0, 5.8, 20.5)`). Add the camera to the scene.
- **Layers.** Define `LAYERS = { NONE:0, TORUS_SCENE:1, BLOOM_SCENE:2, ENTIRE_SCENE:3 }`. Enable
  layers 1, 2 and 3 on the camera. Both point clouds enable **only** `ENTIRE_SCENE` (layer 3) —
  their glow is faked in the fragment shader, so they are never run through `UnrealBloomPass`.
- Helper — `#rrggbb` → `THREE.Vector3`:
  ```js
  function hexToVec3(hex) {
    const n = parseInt(hex.slice(1), 16)
    return new THREE.Vector3(((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255)
  }
  ```
- Small math helpers: `Lerp = (a,b,t) => a+(b-a)*t`, `clamp = (v,lo,hi) => Math.max(lo, Math.min(hi, v))`.

- **Postprocessing — three composers** (this exact rig; the scene only populates `ENTIRE_SCENE`,
  so the first two composers render empty bloom layers and the final pass carries the look):
  1. `torusComposer` (`EffectComposer`, `renderToScreen = false`): `RenderPass(scene, camera)` →
     `ShaderPass(GammaCorrectionShader)` → `UnrealBloomPass(new Vector2(W,H), 0.22, 0.2, 0)` →
     `ShaderPass(CopyShader)`.
  2. `bloomComposer` (`EffectComposer`, `renderToScreen = false`): `RenderPass(scene, camera)` →
     `UnrealBloomPass(new Vector2(W,H), 0.45, 0.6, 0)` → `ShaderPass(GammaCorrectionShader)`.
  3. `finalComposer` (`EffectComposer`): `RenderPass(scene, camera)` → `finalPass`
     (`ShaderPass(FinalPass)`, see Atmosphere). Wire
     `finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture` and
     `finalPass.uniforms.torusTexture.value  = torusComposer.renderTarget1.texture`.
     `haloTexture` stays null.

## Fixed parameters (bake these in)
```js
const CONFIG = {
  smokeCount: 130000,
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
  smokeColor: '#cfd9ea',
  coreColor: '#fff6e8',
  groundColor: '#3a4658',
  coreStrength: 16,
  coreSize: 0.79,
  coreSharp: 2.4,
  bloomAmount: 3.9,
  bloomWidth: 2.6,
  haloFalloff: 0.2,
  starCount: 1600,
  starSize: 1.2,
  starBright: 0.9,
  starColor: '#aebed8',
  bgColor: '#0a0e1a',
  bgColor2: '#020205',
  vignette: 0.85,
  camDist: 20.5,
  camHeight: 5.8,
  lookHeight: 10.4,
  autoSpin: 0.04,
  parallax: 0.6,
  opacity: 1,
}
```

## Geometry

**Smoke column** — one `THREE.Points` of `smokeCount` (130000) specks. The `position` attribute is
a dummy zero buffer (the real position is computed in the vertex shader); each speck carries four
static per-point attributes:

```js
function buildSmoke(n) {
  const pos = new Float32Array(n * 3)   // dummy — real position computed in the shader
  const aH = new Float32Array(n), aAng = new Float32Array(n), aRad = new Float32Array(n), aSeed = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    aH[i] = Math.random()
    aAng[i] = Math.random() * Math.PI * 2
    aRad[i] = Math.sqrt(Math.random())   // bias toward the rim for a fuller billow edge
    aSeed[i] = Math.random()
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aH', new THREE.Float32BufferAttribute(aH, 1))
  g.setAttribute('aAng', new THREE.Float32BufferAttribute(aAng, 1))
  g.setAttribute('aRad', new THREE.Float32BufferAttribute(aRad, 1))
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(aSeed, 1))
  return g
}
```

**Starfield** — one `THREE.Points` of `starCount` (1600) static specks scattered on a far shell
behind the action, biased toward the upper hemisphere:

```js
function buildStars(n) {
  const pos = new Float32Array(n * 3), aSeed = new Float32Array(n), aSize = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    // scatter on a far shell behind the action, biased to the upper hemisphere
    const u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2
    const rad = 60 + Math.random() * 40
    const s = Math.sqrt(1 - u * u)
    pos[i*3]   = Math.cos(th) * s * rad
    pos[i*3+1] = (u * 0.5 + 0.4) * rad     // lift the field upward
    pos[i*3+2] = Math.sin(th) * s * rad - 20
    aSeed[i] = Math.random()
    aSize[i] = 0.4 + Math.random() * Math.random()
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute('aSeed', new THREE.Float32BufferAttribute(aSeed, 1))
  g.setAttribute('aSize', new THREE.Float32BufferAttribute(aSize, 1))
  return g
}
```

Both point clouds set `frustumCulled = false`, enable only `LAYERS.ENTIRE_SCENE`, and are added to
the scene.

## Material & shaders
Both clouds use a `ShaderMaterial` with: `transparent:true`, `depthTest:false`, `depthWrite:false`,
`toneMapped:false`, `blending:THREE.AdditiveBlending`.

### Smoke material
Uniforms (initial values): `iTime 0`, `uAlpha 0`,
`uRes = new Vector2(innerWidth*devicePixelRatio, innerHeight*devicePixelRatio)`,
`uHeight 15.5`, `uTopR 0.05`, `uWidthGrow 1.7`, `uGroundSpread 3.1`, `uGroundH 0.49`,
`uRise 0.045`, `uBillow 1.45`, `uBillowScale 2`, `uChurn 2`, `uSize 1.45`, `uBright 4`,
`uGlitter 0.4`, `uTwinkle 2.4`, `uSmoke = hexToVec3('#cfd9ea')`, `uCore = hexToVec3('#fff6e8')`,
`uGround = hexToVec3('#3a4658')`, plus the shared fake-bloom uniforms `uCoreStrength 16`,
`uCoreSize 0.79`, `uCoreSharp 2.4`, `uBloomAmount 3.9`, `uBloomWidth 2.6`, `uHaloFalloff 0.2`.

Smoke vertex shader (verbatim):
```glsl
attribute float aH, aAng, aRad, aSeed;
uniform float iTime, uAlpha, uHeight, uTopR, uWidthGrow, uGroundSpread, uGroundH;
uniform float uRise, uBillow, uBillowScale, uChurn, uSize, uBright, uGlitter, uTwinkle;
uniform vec2 uRes; uniform vec3 uSmoke, uCore, uGround;
varying vec3 vCol; varying float vB;

// organic feedback domain-warp — coherent in position, so the cloud
// folds into rolling cauliflower billows rather than random fuzz.
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
  // animated height — each speck climbs the column and recycles at the top
  float h = fract(aH + iTime * uRise * (0.6 + 0.8 * aSeed));
  float fade = smoothstep(0.0, 0.06, h) * smoothstep(1.0, 0.86, h); // hide the recycle seam
  float down = 1.0 - h;

  // radius profile: tight at the tapered top, fattening down, flaring at the floor
  float r = uTopR + pow(down, 1.7) * uWidthGrow;
  float ground = smoothstep(uGroundH, 0.0, h);
  r += ground * uGroundSpread * (0.4 + aSeed);

  float rr = r * (0.3 + 0.7 * aRad);
  vec3 pos = vec3(cos(aAng) * rr, h * uHeight, sin(aAng) * rr);
  pos.y *= mix(1.0, 0.4, ground);   // pancake the mound onto the ground

  // billowing turbulence — small at top, large toward the broad base
  float amp = uBillow * (0.22 + 1.5 * down) * (0.5 + r);
  vec3 wp = pos * uBillowScale + vec3(0.0, -iTime * uChurn, aSeed * 10.0);
  pos += warp(wp, iTime * uChurn) * amp;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);

  // brightness: hot & bright at the top, dim cool along the floor
  float topGlow = smoothstep(0.0, 0.85, h);
  float axis = exp(-pow(rr / max(0.001, r), 2.0) * 1.5);   // central spine brighter
  float tw = 0.55 + 0.45 * sin(iTime * uTwinkle + aSeed * 43.0);
  float spark = step(0.7, aSeed);                          // ~30% are bright glints
  float glit = mix(1.0, tw, uGlitter) * (0.6 + 0.8 * spark);
  vB = fade * glit * (0.25 + 1.1 * topGlow) * (0.6 + 0.8 * axis) * uBright * uAlpha;

  // colour: dim blue-grey floor → cool smoke body → warm white-hot core
  vec3 col = mix(uGround, uSmoke, topGlow);
  col = mix(col, uCore, topGlow * axis * 0.85);
  vCol = col;

  float size = uSize * (0.7 + 0.9 * spark) * (0.8 + 0.6 * topGlow);
  gl_PointSize = clamp(size * uRes.y / 1000.0 / -mv.z, 1.0, 40.0);
  gl_Position = projectionMatrix * mv;
}
```

Smoke fragment shader — the shared fake-bloom fragment (sharp core + wide halo per speck), verbatim:
```glsl
uniform float uCoreStrength, uCoreSize, uCoreSharp, uBloomAmount, uBloomWidth, uHaloFalloff;
varying vec3 vCol; varying float vB;
void main(){
  float pd = length(2.0 * gl_PointCoord - 1.0);
  float core = pow(max(0.0, 1.0 - pd / max(0.001, uCoreSize)), uCoreSharp) * uCoreStrength;
  float halo = pow(max(0.0, 1.0 - pd / max(0.001, uBloomWidth)), uHaloFalloff) * uBloomAmount;
  float tex = core + halo;
  gl_FragColor = vec4(vCol, tex * vB);
}
```

### Star material
Uniforms (initial values): `iTime 0`, `uAlpha 0`,
`uRes = new Vector2(innerWidth*devicePixelRatio, innerHeight*devicePixelRatio)`,
`uSize 1.2`, `uBright 0.9`, `uColor = hexToVec3('#aebed8')`.

Star vertex shader (verbatim):
```glsl
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
}
```

Star fragment shader (verbatim):
```glsl
varying vec3 vCol; varying float vB;
void main(){
  float d = length(2.0 * gl_PointCoord - 1.0);
  float tex = pow(max(0.0, 1.0 - d), 1.6);
  gl_FragColor = vec4(vCol, tex * vB);
}
```

## Atmosphere / extra layers
The dark void is carried by the `finalComposer`'s composite pass (`FinalPass`). It lays down a
vertical gradient `bgColor2` (near-black floor) → `bgColor` (faint cool top), multiplies in a soft
vignette, then **adds** the three rendered textures (bloom, torus, scene/`tDiffuse`) plus the halo
texture. Uniforms: `tDiffuse null`, `torusTexture` / `bloomTexture` wired to the two off-screen
composers' `renderTarget1.texture`, `haloTexture null`, `uBg = hexToVec3('#0a0e1a')`,
`uBg2 = hexToVec3('#020205')`, `uVignette 0.85`.

Final composite vertex shader (verbatim):
```glsl
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
```

Final composite fragment shader (verbatim):
```glsl
uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uBg2; uniform float uVignette;
varying vec2 vUv;
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 bg = mix(uBg2, uBg, pow(vUv.y, 1.3));
  float vig = 1.0 - uVignette * smoothstep(0.55, 1.5, length(uv * vec2(0.95, 1.0)));
  bg *= vig;
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}
```

## Animation & interaction
Track the pointer in normalized device coords and ease it for parallax:
```js
const mouseTarget = { x: 0, y: 0 }, mouse = { x: 0, y: 0 }
window.addEventListener('mousemove', e => {
  mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1
  mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1)
}, { passive: true })
```

Record `appearStart = performance.now()` when the clouds are created. Each frame
(`requestAnimationFrame`):
- Ease the pointer: `mouse.x = Lerp(mouse.x, mouseTarget.x, 0.05)`, same for `mouse.y`.
- `t = performance.now() / 1000`; `el = performance.now() - appearStart`.
- **Fade-in.** Smoke alpha `a = clamp((el - 300) / 1800, 0, 1) * opacity`; set smoke `iTime = t`,
  `uAlpha = a`. Star `iTime = t`, star `uAlpha = clamp((el - 100) / 1400, 0, 1) * opacity`.
- **Auto-orbit + parallax.** Compute `ang = t * autoSpin + mouse.x * parallax` and
  `dist = camDist`, then
  `camera.position.set(Math.sin(ang)*dist, camHeight + mouse.y * parallax * 2.2, Math.cos(ang)*dist)`
  and `camera.lookAt(0, lookHeight, 0)`.
- **Render the three-layer rig** in order:
  ```js
  camera.layers.set(LAYERS.TORUS_SCENE);  torusComposer.render()
  camera.layers.set(LAYERS.BLOOM_SCENE);  bloomComposer.render()
  camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render()
  ```

On resize: `renderer.setPixelRatio(dpr)`, `renderer.setSize(w, h, false)`, update camera aspect +
`updateProjectionMatrix()`, set pixel ratio and size on all three composers, and refresh each
material's `uRes` uniform to `new Vector2(innerWidth*dpr, innerHeight*dpr)`. Call resize once at
startup.

## Assets
None. The scene is fully procedural — no textures, models, or external files.