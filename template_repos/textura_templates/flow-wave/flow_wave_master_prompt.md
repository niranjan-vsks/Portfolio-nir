# Recreate this Three.js scene: Flow Wave

You are an expert Three.js creative developer. Produce a **single self-contained `index.html`**
that renders the scene below **exactly** as specified — same geometry, shaders, colors, motion,
and postprocessing. Load Three.js **r0.143.0** via an ES-module importmap from unpkg; no build
step, no bundler, pure ES modules in one `<script type="module">`. Hardcode every value given
here as fixed constants.

## What it looks like
A wide, dark-emerald sea of glowing particle hills rolling gently under two octaves of Simplex
noise, lit only by additive green points fading from near-black (`#02160c`) into bright mint
(`#34e89a`). As you scroll, the camera dives from a high downward-angled view to skim low almost
inside the field while the swell grows and the hills stream toward you; the cursor parallaxes the
view and parts the surface where it points. A faint green corner-flame haze and drifting ambient
motes wrap the whole frame.

## Page & boilerplate
- importmap: `three` → `https://unpkg.com/three@0.143.0/build/three.module.js`, `three/addons/` →
  `https://unpkg.com/three@0.143.0/examples/jsm/`.
- Imports: `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass` from
  `three/addons/postprocessing/…`; `GammaCorrectionShader`, `CopyShader` from
  `three/addons/shaders/…`.
- Full-window fixed `<canvas id="scene">` (`position:fixed; inset:0; width:100vw; height:100vh`)
  on a black page (`html,body { margin:0; padding:0; background:#000 }`). A tall scroll host
  `<div id="scroll-host" style="height:620vh"></div>` so the page scrolls (drives the camera
  dive). Optional fixed bottom-centre `<div id="scroll-hint">scroll ↓</div>` in faint uppercase
  11px text.
- `THREE.WebGL1Renderer({ canvas, antialias:true })`, `setPixelRatio(window.devicePixelRatio)`,
  `shadowMap.enabled = true`, `shadowMap.type = THREE.VSMShadowMap`.
- Scene background `0x000000`, fog `new THREE.Fog(0x000000, 0, 15)`. Camera
  `PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 400)` at `(0, 7, 16)`.
- Layers: define `LAYERS = { NONE:0, TORUS_SCENE:1, BLOOM_SCENE:2, ENTIRE_SCENE:3 }`. Enable
  `TORUS_SCENE`, `BLOOM_SCENE`, `ENTIRE_SCENE` on the camera and `scene.add(camera)`.
- Postprocessing — three composers sharing one `RenderPass(scene, camera)`:
  - **torusComposer** (`renderToScreen = false`): RenderPass → `ShaderPass(GammaCorrectionShader)`
    → `UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.22, 0.2, 0)` →
    `ShaderPass(CopyShader)`.
  - **bloomComposer** (`renderToScreen = false`): RenderPass →
    `UnrealBloomPass(new Vector2(innerWidth, innerHeight), 0.4, 0.55, 0)` →
    `ShaderPass(GammaCorrectionShader)`.
  - **finalComposer**: RenderPass → `finalPass` (the FinalPass ShaderPass below). Wire
    `finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture` and
    `finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture`.
  Include the composite/FinalPass shader **verbatim** below.

## Fixed parameters (bake these in)
Use these exact constants wherever the values are referenced (colors via the `hexToVec3` helper
below):

```js
const bgColor       = '#02160c'   // FinalPass background tint
const flameColor    = '#0aff7f'   // corner-flame A
const flameColor2   = '#aef0c0'   // corner-flame B
const flameAmt      = 0.2         // corner-flame intensity
const atmoColor     = '#7affbf'   // ambient motes color
const atmoCount     = 300         // mote count
const atmoSize      = 24          // mote base size
const atmoSpeed     = 1.0         // mote warp speed
const colorLow      = '#02160c'   // points low color
const colorHigh     = '#34e89a'   // points high color
const opacity       = 0.26        // point opacity
const pointSize     = 5.5         // point base size
const brightness    = 0.45        // point color multiplier
const waveHeight    = 3           // base swell amplitude
const flow          = 1           // noise scroll speed
const tilt          = 0           // sheet X rotation (negated)
const scale         = 0.275       // shrinks the sheet to frame
const scrollRise    = 1.0         // swell amplitude growth on scroll
const camStartY     = 7,  camStartZ = 16   // scroll 0 camera
const camEndY       = 0.8, camEndZ  = -2   // scroll 1 camera
const lookStartZ    = 2,  lookEndZ  = -16  // look-target pan
const parallax      = 1.2
const pointerRadius   = 7.0
const pointerStrength = 0.9
```

Helpers:

```js
const Lerp = (a, b, t) => a + (b - a) * t
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
function hexToVec3(hex) {
  const n = parseInt(hex.slice(1), 16)
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255)
}
```

## Geometry
One `THREE.Points`. Base geometry: `new THREE.SphereGeometry(4.2, 200, 600)` (it is reshaped
entirely in the vertex shader into a flat noise sheet — keep these exact segment counts).
`frustumCulled = false`, enable layer `ENTIRE_SCENE`, add it inside a `THREE.Group` that is added
to the scene. The group's rotation is set each frame: `group.rotation.x = -tilt` (so `0`),
`group.rotation.y = 0`.

Shared GLSL — a 3D Simplex noise function injected into the points vertex shader (paste verbatim,
referenced as `SNOISE`):

```glsl
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
```

## Material & shaders
`THREE.ShaderMaterial` with `transparent: true`, `depthWrite: false`,
`blending: THREE.AdditiveBlending`. Uniforms (initialised from the constants above):
`uTime:0`, `uStream:0`, `uAppear:0`, `uColLow: hexToVec3(colorLow)`,
`uColHigh: hexToVec3(colorHigh)`, `uOpacity: opacity`, `uSize: pointSize`,
`uBrightness: brightness`, `uWaveHeight: waveHeight`, `uFlow: flow`, `uScale: scale`,
`uCursor: new THREE.Vector3()`, `uRepelRadius: pointerRadius`,
`uRepelStrength: pointerStrength`, `uActivity: 0`. The `${SNOISE}` placeholder in the vertex
shader is the Simplex function above.

Vertex shader (verbatim):

```glsl
uniform float uTime; uniform float uStream; uniform float uSize; uniform float uWaveHeight; uniform float uFlow; uniform float uScale;
uniform vec3 uColLow; uniform vec3 uColHigh;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
varying float vFade; varying vec3 vColor;
${SNOISE}
void main() {
  vec3 wp = vec3(position.x * 13.0, 0.0, position.z * 25.0);
  wp.x += position.y * 6.0;
  // uStream slides the sampled hills toward the camera (forward flight).
  float zc = wp.z + uStream;
  float wn = snoise(vec3(wp.x * 0.08, zc * 0.08, uTime * 0.15 * uFlow)) * 2.0;
  wn += snoise(vec3(wp.x * 0.16, zc * 0.16, uTime * 0.3 * uFlow)) * 0.8;
  wp.y += wn * uWaveHeight;

  vec3 finalPos = wp * uScale;
  vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
  vec3 toP = modelPosition.xyz - uCursor;
  float cd = length(toP);
  float fall = smoothstep(uRepelRadius, 0.0, cd);
  modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
  vec4 mvPosition = viewMatrix * modelPosition;

  float colMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
  vColor = mix(uColLow, uColHigh, clamp(colMix, 0.0, 1.0));
  vFade = 1.0;

  gl_PointSize = uSize * (10.0 / -mvPosition.z);
  gl_PointSize = max(gl_PointSize, 1.5);
  gl_Position = projectionMatrix * mvPosition;
}
```

Fragment shader (verbatim):

```glsl
uniform float uOpacity; uniform float uBrightness; uniform float uAppear;
varying float vFade; varying vec3 vColor;
void main() {
  vec2 xy = gl_PointCoord - 0.5;
  float ll = length(xy);
  if (ll > 0.5) discard;
  float a = smoothstep(0.5, 0.1, ll);
  gl_FragColor = vec4(vColor * uBrightness, vFade * a * uOpacity * uAppear);
}
```

## Atmosphere / extra layers

### FinalPass composite (dark green background + corner flames)
A `ShaderPass` whose uniforms are: `iTime: 0`, `tDiffuse: null`, `torusTexture: null`,
`bloomTexture: null`, `haloTexture: null`, `uBg: hexToVec3(bgColor)`,
`uFlameA: hexToVec3(flameColor)`, `uFlameB: hexToVec3(flameColor2)`, `uFlameAmt: flameAmt`.

Vertex shader (verbatim):

```glsl
varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
```

Fragment shader (verbatim):

```glsl
uniform float iTime; uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; uniform sampler2D torusTexture; uniform sampler2D haloTexture;
uniform vec3 uBg; uniform vec3 uFlameA; uniform vec3 uFlameB; uniform float uFlameAmt;
varying vec2 vUv;
vec3 warp3d(vec3 pos, float t){ float curv=.8,a=1.9,b=0.7; pos*=2.;
  pos.x+=curv*sin(t+a*pos.y)+t*b; pos.y+=curv*cos(t+a*pos.x);
  pos.y+=curv*sin(t+a*pos.z)+t*b; pos.z+=curv*cos(t+a*pos.y);
  pos.z+=curv*sin(t+a*pos.x)+t*b; pos.x+=curv*cos(t+a*pos.z);
  return 0.5+0.5*cos(pos.xyz+vec3(1,2,4)); }
void main(){
  vec2 uv = 2.*vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime*1.5), vec3(1.5));
  vec3 flame = 1.5*uFlameA*w.x; flame*=w.y; flame += uFlameB*w.z;
  flame *= smoothstep(0.25, 1., abs(uv.y));
  float md = smoothstep(-0.7, 1., -uv.y*uv.x); flame *= md*md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + flame*uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
}
```

### Ambient motes (camera-attached drifting particles)
Build an IIFE that creates `N = Math.round(atmoCount)` points. Allocate `Float32Array`s for
`positions` (3/pt), `sizes` (1/pt), `seeds` (1/pt). For each `i`:
`positions[i*3]   = 2*Math.random()-1`,
`positions[i*3+1] = 2*Math.random()-1`,
`positions[i*3+2] = 2*Math.random()-1`,
`sizes[i] = atmoSize * (0.4 + Math.random())`, `seeds[i] = Math.random()`. Set them as
`position` (3), `size` (1), `seed` (1) buffer attributes on a `BufferGeometry`.

Material: `THREE.ShaderMaterial`, `transparent:true`, `blending: THREE.AdditiveBlending`,
`depthWrite:false`, `depthTest:false`. Uniforms: `uTime:0`, `uColor: hexToVec3(atmoColor)`,
`uRes: new THREE.Vector2(innerWidth*devicePixelRatio, innerHeight*devicePixelRatio)`. The
`THREE.Points` has `frustumCulled=false`, enables layer `ENTIRE_SCENE`, and is added to the scene.

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
  float tex = smoothstep(0.5, 0.0, l); gl_FragColor = vec4(uColor * tex, tex * vA * 0.6); }
```

The motes' `onBeforeRender` runs each frame: `const t = performance.now()/1000;`
`atmoMat.uniforms.uTime.value = t * atmoSpeed * 8.0;` `pts.position.copy(camera.position)` (so
the motes follow the camera); and `finalPass.uniforms.iTime.value = t` (this is what drives the
corner-flame animation).

## Animation & interaction

**Scroll input (double-damped).** Track `scrollTarget`, `scrollSmooth`, `scrollCurrent` (all
start `0`). On `scroll` (passive) compute
`max = documentElement.scrollHeight - innerHeight`, then
`scrollTarget = max > 0 ? clamp(scrollY / max, 0, 1) : 0`.

**Pointer input.** Keep `mouseTarget {x,y}` and `mouse {x,y}` (smoothed). And a
`POINTER = { world: new THREE.Vector3(), activity: 0, active: false, lastMove: performance.now() }`.
On `mousemove` (passive): `mouseTarget.x = (clientX/innerWidth)*2 - 1`,
`mouseTarget.y = -((clientY/innerHeight)*2 - 1)`, set `POINTER.active = true`,
`POINTER.lastMove = performance.now()`. On `mouseout`: `POINTER.active = false`.

`updatePointerWorld()` projects the cursor onto the `z = 0` plane in world space:

```js
const _ndc = new THREE.Vector3(), _dir = new THREE.Vector3(), _tgt = new THREE.Vector3()
function updatePointerWorld() {
  _tgt.set(0, 0, 0)
  if (POINTER.active) {
    _ndc.set(mouse.x, mouse.y, 0.5).unproject(camera)
    _dir.copy(_ndc).sub(camera.position).normalize()
    const dn = _dir.z
    if (Math.abs(dn) > 1e-4) { const tt = -camera.position.z / dn; if (tt > 0 && Number.isFinite(tt)) _tgt.copy(camera.position).addScaledVector(_dir, tt) }
  }
  POINTER.world.lerp(_tgt, 0.12)
  const idle = (performance.now() - POINTER.lastMove) / 1000
  POINTER.activity += (((POINTER.active && idle < 3) ? 1 : 0) - POINTER.activity) * 0.06
}
```

**Per-frame scene update** (call with the smoothed scroll `scrollCurrent` and smoothed
`mouse`). Maintain a persistent `stream` accumulator (starts `0`), an `appearStart` and `t0`
captured at construction (`performance.now()` / `performance.now()/1000`). Each frame:

```js
const t = performance.now() / 1000
const dt = Math.min(0.05, t - this.t0); this.t0 = t
uniforms.uTime.value = t

// Stream the hills toward us at a constant rate; grow the swell with scroll.
this.stream += dt * (flow * 2.0) * 4.0
uniforms.uStream.value = this.stream
uniforms.uWaveHeight.value = waveHeight * (1 + scroll * scrollRise)

// Camera fly-path: smoothstep over the first 35% of scroll.
const ea = Math.min(scroll / 0.35, 1.0)
const e = ea * ea * (3 - 2 * ea)
const camY = Lerp(camStartY, camEndY, e)
const camZ = Lerp(camStartZ, camEndZ, e)
camera.position.set(m.x * parallax, camY + m.y * parallax * 0.3, camZ)
camera.lookAt(m.x * parallax * 0.5, Lerp(0.0, 0.6, e), Lerp(lookStartZ, lookEndZ, e))
group.rotation.x = -tilt
group.rotation.y = 0
updatePointerWorld()

uniforms.uCursor.value.copy(POINTER.world)
uniforms.uActivity.value = POINTER.activity
const elapsed = (performance.now() - this.appearStart) / 1000
uniforms.uAppear.value = Math.max(0, Math.min(1, (elapsed - 0.2) / 1.4))   // 0.2s delay, 1.4s fade-in
```

**Render loop** (`requestAnimationFrame`):

```js
scrollSmooth  = Lerp(scrollSmooth, scrollTarget, 0.10)
scrollCurrent = Lerp(scrollCurrent, scrollSmooth, 0.06)
mouse.x = Lerp(mouse.x, mouseTarget.x, 0.06)
mouse.y = Lerp(mouse.y, mouseTarget.y, 0.06)
sceneObj.render(scrollCurrent, mouse)
camera.layers.set(LAYERS.TORUS_SCENE);  torusComposer.render()
camera.layers.set(LAYERS.BLOOM_SCENE);  bloomComposer.render()
camera.layers.set(LAYERS.ENTIRE_SCENE); finalComposer.render()
```

**Resize.** On `resize`: `renderer.setPixelRatio(devicePixelRatio)`,
`renderer.setSize(w, h, false)`, update `camera.aspect` + `updateProjectionMatrix()`, and for
each of `torusComposer`, `bloomComposer`, `finalComposer` call `setPixelRatio(dpr)` and
`setSize(w, h)`. Recompute the scroll fraction. Call `resize()` once on startup.

## Assets
None — fully procedural.