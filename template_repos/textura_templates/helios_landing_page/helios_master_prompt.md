# Recreate this site as a single HTML file: Helios — Fusion Console

Build the site described below as **one self-contained `index.html`** — pure HTML, CSS, and JavaScript. Use **ES modules loaded from a CDN via an importmap** (Three.js, GSAP, Lenis). **No build step, no framework, no bundler, no npm.** Inline all CSS in one `<style>` block and all JS in one `<script type="module">`. Hardcode every value exactly as given — counts, colors, sizes, durations, shader source. Faithfulness to the original look and motion matters far more than brevity; this is a long spec and the output is expected to be long too.

The original is a React + TypeScript (CRA/craco) single-page case study with a full-screen WebGL galaxy/terrain scene behind scroll-driven text sections. Reproduce the same visual and behavioral result in vanilla form: decompose the React component tree into plain DOM, and translate the per-frame scene controller, scroll→progress math, and GLSL shaders verbatim.

---

## What it is

Helios is a design-studio case study about designing the **operator console for a stealth-stage fusion-reactor startup**. The palette is near-black backgrounds with a single sage/moss-green accent (`#9bc26a` family, brightening to `#cfe2a3`), white text. A full-viewport fixed WebGL canvas renders a sequence of green particle scenes — a loading spiral, a rotating particle wave/galaxy disc, an assembling galaxy sphere, a morphing point-cloud terrain, and a rising star sphere — that crossfade as you scroll. Over it sit five scroll-pinned/flowing text sections: **Hero**, **Sitemap** (chapter index), **Roadmap (Brief)**, **Impact**, then a **Footer**. Scroll is smoothed by Lenis; each section's visibility drives a `--scene-progress` CSS variable that fades its text, and the same progress values drive which 3D scene is visible and how far it has assembled.

---

## Page shell & libraries

Use an importmap so the scene modules can `import * as THREE from 'three'` and pull postprocessing from `three/examples/jsm/...`. Pin Three.js to **r0.143** to match the original (the postprocessing API used — `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass`, `Pass`, `GammaCorrectionShader`, `CopyShader`, `mergeBufferGeometries`, `WebGL1Renderer`, `PlaneBufferGeometry`, `SphereBufferGeometry` — is r143-era). If a CDN no longer serves r0.143, use the closest available r0.14x and keep `WebGL1Renderer`; if only newer majors are available, fall back to `WebGLRenderer` and `PlaneGeometry`/`SphereGeometry` and note the swap.

```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.143.0/build/three.module.js",
    "three/examples/jsm/": "https://unpkg.com/three@0.143.0/examples/jsm/",
    "gsap": "https://unpkg.com/gsap@3.12.5/index.js",
    "lenis": "https://unpkg.com/lenis@1.1.13/dist/lenis.mjs"
  }
}
</script>
```

GSAP is optional infrastructure (the original uses a small custom tween for the loader; you may use GSAP or a tiny rAF tween — behavior is what matters). Lenis is required for smooth scroll.

**Fonts.** Original uses **Gilroy** [400, 500], **Lato** [400, 700, 800], **Neue Haas Grotesk Display Pro** [500] as local woff2. These are not on a free CDN — substitute the closest Google Fonts and say so in a comment: use **Lato** (available on Google Fonts — keep it) for display/headings, and **Sora** or **Inter** as the Gilroy substitute for UI/body text (Gilroy ≈ a geometric-humanist sans; Sora is the closest free match). Neue Haas Grotesk is unused in the rendered sections, ignore it. Define `$lato` → `'Lato'` and `$gilroy` → `'Sora', sans-serif` equivalents.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700;800&family=Sora:wght@400;500;600&display=swap" rel="stylesheet">
```

**Global resets / background / scroll model:**

```css
*, *::after, *::before { box-sizing: border-box; margin: 0; padding: 0; }
html { overflow-x: hidden; overscroll-behavior-y: none; scrollbar-width: none; -ms-overflow-style: none; }
html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
body { margin: 0; background: #010101; color: #fff; scrollbar-width: none; -ms-overflow-style: none; }
button { cursor: pointer; border: none; background: none; padding: 0; margin: 0; font-family: inherit; }
button:focus, input:focus { outline: none; }
ul { list-style: none; padding: 0; margin: 0; }
a { color: inherit; text-decoration: none; }
p, h1, h2, h3, h4 { margin: 0; }
:root { --index: calc(1vw + 1vh); }
.container { max-width: 1412px; width: 100%; padding: 0 40px; margin: 0 auto; height: 100%; }
@media (max-width: 1180px) { .container { padding: 0 25px; } }
@media (max-width: 991px)  { .container { padding: 0 15px; } }
```

DOM skeleton (translate this React tree):

```html
<body>
  <div id="app">
    <div class="controller -not-loaded">      <!-- becomes .-loaded after preloader hits 100% -->
      <div class="scene"><canvas></canvas><div class="scene-loader">0%</div></div>
      <div class="scene-overlay" aria-hidden="true"></div>
      <div class="menu" id="menu">…</div>      <!-- mobile only, hidden until burger toggled -->
      <header class="header">…</header>
      <div class="controller-slides">
        <div class="slide" data-slide-id="hero">      <div class="hero -appearing section" id="hero">…</div></div>
        <div class="slide" data-slide-id="sitemap">   <div class="sitemap section" id="sitemap">…</div></div>
        <div class="slide" data-slide-id="roadmap" style="min-height:250vh"><div class="brief section" id="brief">…</div></div>
        <div class="slide" data-slide-id="impact">    <div class="impact section" id="impact">…</div></div>
      </div>
      <footer class="footer" id="footer">…</footer>
    </div>
  </div>
</body>
```

The scene canvas is `position:fixed; inset:0` behind everything. `.scene-overlay` is a fixed full-screen vignette (no z-index, sits between `.scene` and the slides). Slides are in normal flow; each `.slide > *` is `position:sticky; top:0; height:100vh` so the section text pins while the slide's scroll range passes — **except** Sitemap, Brief, and Impact which override to static/flowing (see each section). The Roadmap slide is tall (`min-height:250vh`) to give the terrain morph scroll length.

`.scene` CSS:

```css
.scene {
  position: fixed; inset: 0; width: 100vw; height: 100vh;
  height: 100lvh; width: 100lvw;     /* largest viewport on iOS so canvas never gaps */
  pointer-events: none;
  transform: translateZ(0); -webkit-transform: translateZ(0);
  will-change: transform; backface-visibility: hidden; -webkit-backface-visibility: hidden;
}
.scene canvas { width: 100%; height: 100%; pointer-events: none; transform: translateZ(0); }
.scene .scene-loader {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  color: #fff; font-family: 'Lucida Sans Unicode','Lucida Grande',Arial,sans-serif;
  font-size: 1.25rem; line-height: 1; pointer-events: none;
}
.scene-overlay {
  position: fixed; inset: 0; pointer-events: none;
  background: linear-gradient(180deg,
    rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 58%,
    rgba(0,0,0,0.38) 82%, rgba(0,0,0,0.72) 100%);
}
.controller { width: 100%; position: relative; }
.controller.-not-loaded .controller-slides,
.controller.-not-loaded .header,
.controller.-not-loaded .menu { opacity: 0; visibility: hidden; }
.controller-slides { position: relative; width: 100%; }
.slide { position: relative; width: 100%; min-height: 100vh; }
.slide > * { position: sticky; top: 0; height: 100vh; width: 100%; }
.header { transition: opacity 1s, visibility 1s; }
.section { display: flex; align-items: center; flex-direction: column; justify-content: center; height: 100vh; min-height: 100vh; width: 100%; }
```

**Smooth scroll (Lenis):**

```js
import Lenis from 'lenis'
const lenis = new Lenis({
  duration: 1.1,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4,
})
function raf(time){ lenis.raf(time); requestAnimationFrame(raf) } requestAnimationFrame(raf)
```

Programmatic navigation (chapter buttons, footer links, "back to top") scrolls to a slide via Lenis: `const top = el.getBoundingClientRect().top + window.scrollY; lenis.scrollTo(top, { duration: 1.4 })`. Targets are looked up by `[data-slide-id="<id>"]` where ids are `hero, sitemap, roadmap, impact`. (Original also has `partners, product, investors, social` ids that map to chapter buttons — but those sections aren't built; point those buttons at `sitemap` as a graceful fallback, or wire them to the nearest existing slide.)

---

## Layout & sections (in order)

Brand color tokens (use as literals everywhere): primary sage `#9bc26a`, bright sage `#cfe2a3`, light wash `#d6ecc2`, deep moss `#3a5c20`, darkest moss `#1c3a22` / `#2c4a32`, white `#fff`. Body/UI text is the Gilroy-substitute; headings/wordmarks are Lato.

### Header (fixed, z-index 120)

```html
<header class="header">
  <div class="container header__container">
    <div class="header__logo">
      <span class="header__logo-mark" aria-hidden="true"><span class="header__logo-mark-core"></span></span>
      <p>HELIOS</p>
    </div>
    <nav class="header__nav">
      <a href="#" class="header__nav-btn header__nav-btn_sitemap"><span>Chapters</span></a>
    </nav>
    <button class="header__btn header__cta">
      <span class="header__cta-label">View live demo</span>
      <span class="header__cta-arrow" aria-hidden="true">→</span>
    </button>
    <button class="header__burgermenu"><span></span><span></span><span></span></button>
  </div>
</header>
```

CSS (exact):
- `.header`: `padding-top: calc(45px + env(safe-area-inset-top,0px)); position:fixed; left:0; top:0; z-index:120; width:100%; transition: opacity 1s, visibility 1s;`
- `.header__container`: `display:flex; align-items:center; justify-content:space-between;`
- `.header__logo`: `display:flex; align-items:center; cursor:pointer;` — its `p`: `margin-left:14px; font:600 16px/1 Gilroy; color:#fff; text-transform:uppercase; letter-spacing:.3em;`. Clicking the logo scrolls to `hero`.
- `.header__logo-mark`: `width:28px; height:28px; flex-shrink:0; position:relative; display:inline-block; border:1.5px solid #9bc26a; border-radius:50%; box-shadow:0 0 0 1px rgba(58,92,32,.15), 0 0 14px -2px rgba(155,194,106,.35);` with `::before { content:''; position:absolute; inset:4px; border:1px solid rgba(168,196,122,.9); border-radius:50%; }`.
- `.header__logo-mark-core`: `position:absolute; inset:10px; border-radius:50%; background:radial-gradient(50% 50% at 50% 50%, #cfe2a3 0%, #3a5c20 70%, rgba(58,92,32,0) 100%); box-shadow:0 0 10px rgba(155,194,106,.7);`
- `.header__cta` (pill): `display:inline-flex; align-items:center; gap:10px; padding:11px 22px; border:1px solid rgba(155,194,106,.45); border-radius:999px; background:rgba(155,194,106,.06); color:#fff; font:600 11px/1 Gilroy; letter-spacing:.22em; text-transform:uppercase; white-space:nowrap; box-shadow:0 8px 24px -10px rgba(58,92,32,.35), inset 0 1px 0 rgba(207,226,163,.15); transition: border-color .3s, background .3s, transform .3s, box-shadow .3s;`. Hover: `border-color: rgba(155,194,106,1); background: rgba(155,194,106,.14); transform: translateY(-1px);` and arrow `translate(4px,-1px)`. `.header__cta-arrow`: `font-size:14px; color:#cfe2a3; transform:translateY(-1px); transition:transform .3s;`.
- `.header__nav`: `padding:0 82px; flex-grow:1; display:flex; align-items:center; justify-content:space-between;`. `.header__nav-btn`: `font:700 16px/1.19 Lato; color:#fff; white-space:nowrap;`, its `span` hover lifts: `transform:translateY(-4px); opacity:.5;`. The "Chapters" nav button scrolls to `sitemap`.
- The Chapters nav link starts hidden (`opacity:0; visibility:hidden; transform:translateY(15px)`) and is only revealed when a `.header.--nav` class is set — original adds `--nav` when the active scene is not hero/sitemap/none. You may simplify: keep Chapters always visible, or toggle `--nav` once the user scrolls past the hero. Reveal transition: `.3s transform ease-in, .3s opacity`.
- **Burger** (`.header__burgermenu`, `display:none` on desktop, shown ≤912px): `width:44px; height:44px; position:relative; border:1px solid rgba(155,194,106,.35); border-radius:999px; background:rgba(155,194,106,.06); box-shadow:0 8px 24px -12px rgba(58,92,32,.45), inset 0 1px 0 rgba(207,226,163,.12);`. Three `span` bars `width:18px; height:1.5px; background:#cfe2a3; border-radius:2px; position:absolute; left:50%; margin-left:-9px;` positioned at `top:16px`, centered (`top:50%; transform:translateY(-50%); width:12px; margin-left:-6px`), and `top:calc(100% - 16px)`. When `.header.--menu-active`, bars turn white and morph to an X: bar1 `top:50%; transform:translateY(-50%) rotate(-45deg)`, bar2 `scaleX(0); opacity:0`, bar3 `top:50%; transform:translateY(-50%) rotate(45deg)`.
- Breakpoints: ≤1151px nav padding 40px; ≤991px header padding-top 30px, nav padding 30px; ≤912px hide `.header__nav` and `.header__btn`, show burger, header padding-top 22px, logo `p` font 17px letter-spacing .34em, mark 34px; ≤480px header padding-top 18px, logo `p` 15px, mark 30px, burger 40px.

### Hero (`data-slide-id="hero"`, pinned 100vh, `.hero.-appearing` until preloader done)

```html
<div class="hero -appearing section" id="hero">
  <div class="hero__top">
    <h1 class="hero__title"><span>HELIOS</span></h1>
    <div class="hero__subtitle hero__title_down"><span>Designing the operator console for a fusion reactor.</span></div>
  </div>
  <div class="hero__bottom">
    <div class="hero__content">
      <p class="hero__brief">A 9-month engagement helping a stealth-stage fusion startup design the control interface their plasma engineers trust under load.</p>
      <button class="hero__cta"><span class="hero__cta-label">Begin briefing</span><span class="hero__cta-arrow" aria-hidden="true">→</span></button>
    </div>
    <p class="ui-text hero__text">Scroll to enter</p>
  </div>
</div>
```

CSS (exact):
- `.hero`: `display:flex; flex-direction:column; justify-content:space-between; align-items:center; padding:110px 0 64px; text-align:center; position:relative;` plus the scroll-fade variables: `--content-fade: clamp(0, calc((var(--scene-progress, 1) - 0.55) * 3.2), 1); --content-drift: calc((1 - var(--content-fade)) * -32px);`
- `.hero__top, .hero__bottom`: `opacity: var(--content-fade); transform: translateY(var(--content-drift)); transition: opacity .25s linear, transform .25s linear; will-change: opacity, transform;`
- `.hero__top`: `display:flex; flex-direction:column; align-items:center; margin-top:2vh;`
- `.hero__title`: `font:400 168px/1 Lato; letter-spacing:.04em; text-transform:uppercase; color:#fff; user-select:none; margin:0;` (`span` inline-block, white).
- `.hero__subtitle`: `margin-top:28px; font:400 22px/1.4 Gilroy; color:rgba(255,255,255,.92); max-width:30ch;`
- `.hero__bottom`: `display:flex; flex-direction:column; align-items:center; width:100%;`
- `.hero__content`: `display:flex; flex-direction:column; align-items:center; max-width:600px; width:100%; padding:0 24px;`
- `.hero__brief`: `font:400 15px/1.7 Gilroy; color:rgba(255,255,255,.72); margin:0 0 28px; max-width:54ch;`
- `.hero__cta`: `display:inline-flex; align-items:center; gap:14px; padding:17px 32px; border:1px solid rgba(155,194,106,.55); border-radius:999px; background:rgba(155,194,106,.08); color:#fff; font:600 13px/1 Gilroy; letter-spacing:.2em; text-transform:uppercase; box-shadow:0 12px 36px -10px rgba(58,92,32,.4), inset 0 1px 0 rgba(207,226,163,.25); transition: border-color .35s, background .35s, transform .35s, box-shadow .35s;`. Hover: border-color rgba(155,194,106,1), background rgba(155,194,106,.18), `translateY(-2px)`, stronger shadow; arrow `translate(6px,-1px)`. `.hero__cta-arrow`: `font-size:16px; color:#cfe2a3; transform:translateY(-1px); transition:transform .35s;`. Clicking CTA scrolls to `sitemap`.
- `.hero__text` (the `.ui-text` base is `max-width:27.0625em; font:400 16px/1.5 Gilroy; color:#fff; text-align:center;`) overridden: `margin-top:28px; font:500 11px/1 Gilroy; letter-spacing:.38em; text-transform:uppercase; color:rgba(255,255,255,.42); text-align:center; margin-left:0;`
- Responsive: ≤1180px title 140px; ≤855px padding `110px 0 56px`, title `17vw`, subtitle 18px/26ch, brief 14px; ≤656px cta `14px 24px`/12px, subtitle 16px margin-top 22px, top margin-top 0; ≤480px padding `96px 0 44px`, title `19vw` letter-spacing .02em, subtitle 15px, brief 13px/1.65, text 10px letter-spacing .32em.

**Hero entrance/reveal (HeroAnim).** The hero starts hidden. While `.hero.-appearing` is present, the inner elements have `transition:none` and sit offset/invisible. When the preloader finishes it removes `-appearing` (after a 150ms delay) and the slide is `-active`, triggering a staggered reveal. Define an easing `$ease = cubic-bezier(.16,.77,.3,1)`.

Per-element hidden state + transition (all `will-change:transform,opacity; transition-property:transform,opacity; transition-timing-function:$ease; transition-duration:1.4s`):
- `.hero__title`: hidden `translateY(40px) scale(.94)`, opacity 0, delay .1s, duration **1.8s**
- `.hero__subtitle`: hidden `translateY(28px)`, opacity 0, delay .35s
- `.hero__brief`: hidden `translateY(20px)`, opacity 0, delay .55s
- `.hero__cta`: hidden `translateY(20px)`, opacity 0, delay .75s
- `.hero__text`: hidden `translateY(12px)`, opacity 0, delay .95s

Rule: `.hero.-appearing` → all those elements `transition:none`. Revealed: `.slide.-active .hero:not(.-appearing)` → all `transform:none; opacity:1`. So: add `-active` to the hero slide once loaded, then drop `-appearing`; the elements ease into place in sequence.

### Sitemap (`data-slide-id="sitemap"`, flows static, clipped to 100vh on desktop)

```html
<div class="sitemap section" id="sitemap">
  <div class="container sitemap__container">
    <div class="sitemap__intro">
      <p class="sitemap__eyebrow">Chapters</p>
      <h2 class="sitemap__heading">The HELIOS case study, in five steps.</h2>
    </div>
    <div class="sitemap__content">
      <div class="sitemap__row sitemap__row_1">
        <!-- SitemapBtn: number, title, subtitle -->
        <button class="sitemap-btn sitemap-link --roadmap"><div class="sitemap-btn__circle"><span></span></div><div class="sitemap-btn__index">01</div><div class="sitemap-btn__text"><p class="sitemap-btn__title">Roadmap</p><p class="sitemap-btn__subtitle">Three phases of the engagement</p></div></button>
      </div>
      <div class="sitemap__row sitemap__row_2">
        <button class="sitemap-btn sitemap-link --partners">…02 · Discovery · Field research with plasma physicists…</button>
        <button class="sitemap-btn sitemap-link --product">…03 · System · Control architecture…</button>
      </div>
      <div class="sitemap__row sitemap__row_3">
        <button class="sitemap-btn sitemap-link --investors">…04 · Console · Operator UI build…</button>
        <button class="sitemap-btn sitemap-link --social">…05 · Outcome · What shipped, what we learned…</button>
      </div>
    </div>
    <button class="gray-button sitemap__join"><div class="gray-button__content"><span>View live demo →</span></div></button>
  </div>
</div>
```

Each SitemapBtn markup is: `<button class="sitemap-btn <class>"><div class="sitemap-btn__circle"><span></span></div><div class="sitemap-btn__index">NN</div><div class="sitemap-btn__text"><p class="sitemap-btn__title">TITLE</p><p class="sitemap-btn__subtitle">SUB</p></div></button>`. The five chapters (number / title / subtitle / scroll target):
- `--roadmap` · 01 · Roadmap · "Three phases of the engagement" → roadmap
- `--partners` · 02 · Discovery · "Field research with plasma physicists" → (partners; fallback)
- `--product` · 03 · System · "Control architecture" → (product; fallback)
- `--investors` · 04 · Console · "Operator UI build" → (investors; fallback)
- `--social` · 05 · Outcome · "What shipped, what we learned" → (social; fallback)

CSS (exact):
- Override sticky: `.slide > .sitemap.section { position:static; overflow:hidden; max-height:100vh; }`
- `.sitemap__container`: `display:flex; flex-direction:column; justify-content:center; align-items:center;`
- Hidden initial state (the JS reveal animates these): `.sitemap__eyebrow, .sitemap__heading, .sitemap__row_1, .sitemap__row_2, .sitemap__row_3, .sitemap__join { opacity:0; transform:translate3d(0,36px,0); will-change:opacity,transform; }`
- `.sitemap__intro`: `text-align:center; margin-bottom:32px; max-width:720px;`
- `.sitemap__eyebrow`: `font:500 11px/1 Gilroy; letter-spacing:.34em; text-transform:uppercase; color:rgba(155,194,106,.85); margin-bottom:14px;`
- `.sitemap__heading`: `font:400 28px/1.35 Lato; color:rgba(255,255,255,.92); letter-spacing:.01em; max-width:18ch; margin:0 auto;`
- `.sitemap__content`: `display:flex; flex-direction:column; max-width:1027px; width:100%;`
- `.sitemap__row`: `display:flex; align-items:flex-start; justify-content:space-between;`
- `.sitemap__row_1`: `justify-content:center;` `.sitemap__row_2`: `margin-top:64px;` `.sitemap__row_3`: `margin:280px auto 0; max-width:859px; width:100%; transform:translateX(-2%);`
- Radial glow behind each node, `.sitemap-btn__circle::before`: `content:''; display:block; width:300px; height:300px; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) scale(0.5); z-index:-1; background:radial-gradient(50% 50% at 50% 50%, rgba(127,168,77,0.45) 10%, rgba(127,168,77,0.1) 50%, transparent); background-size:contain !important; opacity:0; transition:transform .5s ease-out, opacity .5s ease; pointer-events:none; filter:blur(10px);`. On `.sitemap-btn:hover` it goes `transform:translate(-50%,-50%); opacity:1;`. Warm-themed `.--partners, .--investors` glow uses `radial-gradient(50% 50% at 50% 50%, rgba(155,194,106,0.55) 10%, rgba(58,92,32,0.18) 45%, transparent 90%)` and lays out `flex-direction:row-reverse` with text right-aligned; cool-themed `.--social, .--product` glow uses `radial-gradient(... rgba(127,168,77,0.5) 10%, rgba(44,74,50,0.15) 50%, transparent)`.
- `.--roadmap`: `padding-bottom:50px; flex-direction:column; align-items:center; gap:14px;` circle absolutely centered at bottom, text centered. `.--investors` circle `margin-left:42px; transform:translateY(-20%)`. `.--partners` `margin-top:44px`, circle `margin-left:36px`. `.--social` `margin-top:8px`, circle `margin-right:40px; transform:translateY(-20%)`. `.--product` circle `margin-right:38px; margin-top:auto; transform:translateY(50%)`.
- `.sitemap-btn`: `display:flex; align-items:center; gap:16px; background:transparent; border:none; cursor:pointer; padding:4px 0; transition:transform .35s ease;`. Hover: `translateY(-2px)`, index → rgba(155,194,106,1), title → #fff.
- `.sitemap-btn__index`: `font:600 11px/1 Gilroy; letter-spacing:.28em; color:rgba(155,194,106,.7); position:relative; z-index:3; min-width:22px; transition:color .3s;`
- `.sitemap-btn__text`: `display:flex; flex-direction:column; gap:4px; position:relative; z-index:3; text-align:left;`
- `.sitemap-btn__title`: `font:400 22px/1 Lato; letter-spacing:.03em; text-transform:uppercase; color:rgba(255,255,255,.9); transition:color .3s;`
- `.sitemap-btn__subtitle`: `font:400 12px/1.4 Gilroy; color:rgba(255,255,255,.45); max-width:26ch;`
- `.sitemap-btn__circle`: `position:relative; z-index:2;` its `span`: `display:block; width:16px; height:16px; border-radius:50%; background:radial-gradient(50% 50% at 50% 50%, #ffffff 30%, rgba(168,196,122,0.7) 60%, rgba(58,92,32,0) 100%);`
- `.sitemap__join` (sage pill, **display:none on desktop**, shown on mobile): `margin-top:48px;` its `.gray-button__content`: `padding:14px 26px; border-radius:999px; border:1px solid rgba(155,194,106,.5); background:rgba(155,194,106,.08); box-shadow:0 12px 32px -10px rgba(58,92,32,.45), inset 0 1px 0 rgba(207,226,163,.2);` span `font:600 12px/1 Gilroy; letter-spacing:.22em; text-transform:uppercase; color:#fff;`. (Base `.gray-button__content` default look: `display:flex; align-items:center; padding:9.5px 16.5px; border-radius:14px; border:1px solid #fff; background:rgba(255,255,255,0.3);` — overridden here.)
- Height/width breakpoints: `@media(max-height:828px) .sitemap__row_3{margin-top:200px}`; `(max-height:717px)` row_2 margin 24px, row_3 160px, intro margin 18px, heading 22px; `(max-width:991px)` row_3 `transform:translateX(0); max-width:95%`.
- **Mobile ≤768px**: turn the chapter list into a clean numbered column on a dark glass card. `.slide > .sitemap.section { max-height:none; min-height:100vh; overflow:visible; padding:120px 0 56px; }`. `.sitemap__content { max-width:480px; margin:0 auto; transform:none !important; background:linear-gradient(180deg, rgba(4,7,6,.15), rgba(4,7,6,.01)); border:1px solid rgba(155,194,106,.12); border-radius:16px; backdrop-filter:blur(10px) saturate(120%); -webkit-backdrop-filter:blur(14px) saturate(120%); padding:6px 16px; opacity:0; will-change:opacity; }`. Each `.sitemap__row` becomes `display:block; width:100%; margin:0 !important;` with a `border-top` between rows, forced order 1/2/3 (Roadmap→Outcome top to bottom). Each `.sitemap-link` becomes `display:grid; grid-template-columns:36px 1fr 16px; align-items:center; gap:14px; padding:18px 4px; flex-direction:row !important;` — circle hidden, index `font-size:11px; color:rgba(155,194,106,.8)`, title 18px, subtitle 12px, and an `::after { content:'→'; color:rgba(207,226,163,.6); font-size:16px; }` that nudges right on hover. `.sitemap__join` shows (`display:block; margin:28px auto 0`). ≤480px tighten grid to `32px 1fr 14px`, title 17px; ≤376/360px reduce section padding.

**Sitemap reveal (JS, rAF — not CSS).** When the Sitemap slide first becomes active, run a sequenced reveal once. Quartic ease-out `e = 1 - (1-t)^4`. On desktop each element rises 36px while fading in; on mobile (innerWidth<768) reveal is **opacity-only** (no transform), and the glass card `.sitemap__content` itself also fades. `animateReveal(el, {delay, duration:650, rise:36})`: set `el.style.opacity=0`, set transform (`translate3d(0, rise px,0)` or `none`), then per-frame step opacity to `e` and transform to `translate3d(0,(1-e)*rise px,0)`. Queue (selector → delay ms, rise):
`.sitemap__eyebrow`(0), `.sitemap__heading`(60), [mobile only: `.sitemap__content`(100, rise 0)], `.sitemap__row_1`(180), `.sitemap__row_2`(240), `.sitemap__row_3`(300), `.sitemap__join`(380). Leave elements at their landed values when done (do not clear styles, or the hidden-state CSS re-hides them).

**Desktop cursor parallax.** On desktop only (≥768px), every frame translate `.sitemap__content` by a lerped fraction of the cursor offset from screen center: `cur.x = lerp(cur.x, mouseX - innerW/2, 0.1)` (same for y), then `transform: translate(cur.x/-10 px, cur.y/-10 px)`.

### Roadmap / Brief (`data-slide-id="roadmap"`, tall slide `min-height:250vh`, flows static)

Three phases stacked vertically inside the tall slide, alternating left/right, each led by a small numeral. Reveal each block via IntersectionObserver (`rootMargin:'0px 0px -20% 0px'`, add class `-in` once, unobserve). Heading splits into per-word `<span class="brief__word" style="--i:N">` (with literal spaces between spans) that stagger.

```html
<div class="brief section" id="brief">
  <div class="container brief__container">
    <p class="brief__chapter brief__reveal">01 · Roadmap</p>
    <article class="brief__stage brief__reveal" style="--wc:5">
      <span class="brief__num" aria-hidden="true">01</span>
      <p class="brief__kicker">Calibration</p>
      <h2 class="brief__heading"><span class="brief__word" style="--i:0">Two</span> <span class="brief__word" style="--i:1">weeks</span> … </h2>
      <p class="brief__body">…</p>
    </article>
    <!-- ×3 -->
  </div>
</div>
```

The three phases (num / kicker / heading / body), verbatim:
1. **01** · Calibration · "Two weeks in the control room" · "We sat behind operators during 47 plasma runs — watched what mattered, watched what got missed, mapped every keystroke across four legacy screens."
2. **02** · Build · "Three views. One console. One clock" · "Anomaly response, routine ops, deep-dive postmortem — context-driven views the team could move between in a single keystroke, all tied to a shared timeline."
3. **03** · Ship · "Live across fourteen reactor cells" · "Operator response time on plasma transients dropped from 14 seconds to under 4. Anomaly classification accuracy is up 34%. Now part of standard onboarding."

Set `--wc` on each `.brief__stage` to the heading's word count (5, 5, 4 respectively) so the body delay accounts for the heading stagger.

CSS (exact):
- `[data-slide-id="roadmap"] { margin-top: 300px; }`
- Override sticky so brief flows: `.slide > .brief.section { position:static; width:100%; height:auto; min-height:100%; display:flex; flex-direction:column; align-items:center; padding:16vh 0 6vh; overflow:visible; }`
- `.brief__container`: `display:flex; flex-direction:column; align-items:center; width:100%; max-width:1180px; padding:0 32px; gap:66vh;`
- `.brief__chapter`: `font:500 11px/1 Gilroy; letter-spacing:.34em; text-transform:uppercase; color:rgba(155,194,106,.85); text-align:center;`
- `.brief__stage`: `display:flex; flex-direction:column; gap:18px; width:100%; max-width:560px;`. `:nth-of-type(odd)` → `align-self:flex-start; align-items:flex-start; text-align:left`; `:nth-of-type(even)` → `align-self:flex-end; align-items:flex-end; text-align:right`.
- `.brief__num`: `font:500 13px/1 Gilroy; letter-spacing:.14em; color:#fff; margin:0 0 4px; display:block;`
- `.brief__kicker`: `font:600 12px/1 Gilroy; letter-spacing:.34em; text-transform:uppercase; color:rgba(155,194,106,.9); margin:0 0 6px;`
- `.brief__heading`: `font:400 46px/1.18 Lato; letter-spacing:.005em; color:#fff; max-width:100%; text-wrap:balance;`
- `.brief__body`: `font:400 16px/1.7 Gilroy; color:rgba(255,255,255,.78); margin:4px 0 0; max-width:56ch;`
- Reveal ease `$briefEase = cubic-bezier(0.22,1,0.36,1)`. `.brief__chapter.brief__reveal`: hidden `opacity:0; transform:translateY(20px); transition:opacity .7s $briefEase, transform .7s $briefEase;`, `.-in` → visible. Inside `.brief__stage`, the `.brief__num, .brief__kicker, .brief__body, .brief__word` start `opacity:0; transform:translateY(22px)` with same .7s transition; `.brief__kicker { transition-delay:140ms; }`; `.brief__word { display:inline-block; transition-delay: calc(var(--i,0)*55ms + 240ms); }`; `.brief__body { transition-delay: calc(var(--wc,0)*55ms + 340ms); }`. `.brief__stage.-in` → all of them `opacity:1; transform:none`.
- Responsive: ≤855px `margin-top:200px`, container gap 54vh padding 22px, all stages left-aligned (drop the alternation), num 12px, heading 32px/1.2, body 14px; ≤480px `margin-top:140px`, padding `12vh 0 8vh`, gap 42vh padding 18px, chapter 10px, kicker 11px, heading 26px, body 13.5px/1.65.

### Impact (`data-slide-id="impact"`, single pinned viewport)

```html
<div class="impact section" id="impact">
  <div class="container impact__container">
    <p class="impact__chapter impact__reveal">02 · Impact</p>
    <h2 class="impact__heading impact__reveal">What the team felt the first week it went live.</h2>
    <div class="impact__grid">
      <div class="impact__metric impact__reveal" style="--i:0"><p class="impact__value">−71<span class="impact__suffix">%</span></p><p class="impact__label">Median operator response on plasma transients</p></div>
      <div class="impact__metric impact__reveal" style="--i:1"><p class="impact__value">+34<span class="impact__suffix">%</span></p><p class="impact__label">Anomaly classification accuracy, day one</p></div>
      <div class="impact__metric impact__reveal" style="--i:2"><p class="impact__value">14<span class="impact__suffix"> cells</span></p><p class="impact__label">Reactor cells running live on the console</p></div>
    </div>
    <p class="impact__foot impact__reveal">Measured across fourteen reactor cells over the first ninety days.</p>
  </div>
</div>
```

CSS (exact):
- `[data-slide-id="impact"] { margin-top: 240px; }`
- `.impact__container`: `display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:30px;`
- `.impact__chapter`: `font:500 11px/1 Gilroy; letter-spacing:.34em; text-transform:uppercase; color:rgba(155,194,106,.85);`
- `.impact__heading`: `font:400 42px/1.2 Lato; letter-spacing:.005em; color:#fff; max-width:18ch; text-wrap:balance;`
- `.impact__grid`: `display:grid; grid-template-columns:repeat(3,1fr); gap:28px; width:100%; max-width:980px; margin-top:14px;`
- `.impact__metric`: `display:flex; flex-direction:column; align-items:center; gap:12px; padding:4px 8px;`
- `.impact__value`: `font:300 72px/1 Lato; letter-spacing:-.01em; color:#fff; display:inline-flex; align-items:baseline; background:linear-gradient(180deg,#ffffff 0%,#d6ecc2 100%); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;`
- `.impact__suffix`: `font-size:28px; font-weight:400; margin-left:4px; -webkit-text-fill-color:rgba(155,194,106,.9);`
- `.impact__label`: `font:400 14px/1.6 Gilroy; color:rgba(255,255,255,.72); max-width:24ch;`
- `.impact__foot`: `font:400 13px/1.6 Gilroy; letter-spacing:.02em; color:rgba(255,255,255,.42); margin:8px 0 0;`
- Reveal ease `cubic-bezier(0.22,1,0.36,1)`: `.impact__reveal { opacity:0; transform:translateY(24px); transition:opacity .7s, transform .7s; }` → `.-in` visible. Cards cascade: `.impact__metric.impact__reveal { transition-delay: calc(var(--i,0)*110ms + 140ms); }`. Use IntersectionObserver with `rootMargin:'0px 0px -15% 0px'`.
- Responsive: ≤855px `margin-top:180px`, gap 24px, heading 30px, grid single-column max-width 420px gap 34px, value 60px, suffix 24px; ≤480px `margin-top:130px`, chapter 10px, heading 25px, value 52px, suffix 21px, foot 12px.

### Footer (normal flow, z-index 2)

```html
<footer class="footer" id="footer">
  <div class="container footer__container">
    <div class="footer__top">
      <div class="footer__brand">
        <p class="footer__wordmark">HELIOS</p>
        <p class="footer__tagline">Designing the instruments people trust under load.</p>
      </div>
      <a class="footer__cta" href="mailto:studio@helios.work"><span class="footer__cta-label">Start a project</span><span class="footer__cta-arrow" aria-hidden="true">→</span></a>
    </div>
    <nav class="footer__nav" aria-label="Footer">
      <ul class="footer__links">
        <li><button class="footer__link" data-go="sitemap">The work</button></li>
        <li><button class="footer__link" data-go="roadmap">Roadmap</button></li>
        <li><button class="footer__link" data-go="impact">Impact</button></li>
      </ul>
      <ul class="footer__links footer__links--social">
        <li><a class="footer__link" href="mailto:studio@helios.work">Email</a></li>
        <li><a class="footer__link" href="https://twitter.com">Twitter</a></li>
        <li><a class="footer__link" href="https://linkedin.com">LinkedIn</a></li>
      </ul>
    </nav>
    <div class="footer__base">
      <p class="footer__copy">© 2026 Helios Studio — case study</p>
      <button class="footer__top-btn" data-go="hero">Back to top <span aria-hidden="true">↑</span></button>
    </div>
  </div>
</footer>
```

CSS (exact):
- `.footer`: `position:relative; z-index:2; width:100%; margin-top:60vh; padding:110px 0 56px; background:linear-gradient(180deg, rgba(2,3,2,0) 0%, rgba(3,5,3,0.86) 26%, #030503 100%);` with a fading hairline `::before { content:''; position:absolute; top:0; left:50%; transform:translateX(-50%); width:min(100%,1412px); height:1px; background:linear-gradient(90deg, transparent 0%, rgba(155,194,106,.26) 50%, transparent 100%); }`
- `.footer__container`: `display:flex; flex-direction:column; height:auto;`
- `.footer__top`: `display:flex; align-items:flex-end; justify-content:space-between; gap:40px; padding-bottom:54px;`
- `.footer__wordmark`: `font:400 clamp(46px,7vw,92px)/0.9 Lato; letter-spacing:.04em; color:#fff;`
- `.footer__tagline`: `font:400 15px/1.6 Gilroy; color:rgba(255,255,255,.56); margin:18px 0 0; max-width:34ch;`
- `.footer__cta`: `display:inline-flex; align-items:center; gap:12px; flex-shrink:0; padding:15px 26px; border:1px solid rgba(255,255,255,.18); border-radius:100px; color:#fff; font:500 14px/1 Gilroy; letter-spacing:.04em; transition:border-color .3s, background .3s, transform .3s;`. Arrow `color:rgba(155,194,106,.95)`. Hover: border `rgba(155,194,106,.55)`, background `rgba(155,194,106,.08)`, arrow `translateX(4px)`.
- `.footer__nav`: `display:flex; align-items:center; justify-content:space-between; gap:24px; padding:28px 0; border-top:1px solid rgba(255,255,255,.07); border-bottom:1px solid rgba(255,255,255,.07);`
- `.footer__links`: `display:flex; flex-wrap:wrap; align-items:center; gap:28px;`
- `.footer__link`: `font:400 14px/1 Gilroy; letter-spacing:.02em; color:rgba(255,255,255,.6); transition:color .25s;` hover `#fff`. `.footer__links--social .footer__link`: `letter-spacing:.12em; text-transform:uppercase; font-size:12px;`
- `.footer__base`: `display:flex; align-items:center; justify-content:space-between; gap:18px; padding-top:30px;`
- `.footer__copy`: `font:400 12px/1.5 Gilroy; letter-spacing:.04em; color:rgba(255,255,255,.38);`
- `.footer__top-btn`: `font:500 12px/1 Gilroy; letter-spacing:.14em; text-transform:uppercase; color:rgba(255,255,255,.6); display:inline-flex; align-items:center; gap:8px; transition:color .25s;` hover `#fff`, span `translateY(-3px)`.
- The `data-go` links scroll to the named slide via Lenis. Responsive: ≤855px `margin-top:50vh; padding:80px 0 44px`, top stacks column, nav stacks column; ≤480px base stacks column, links gap 20px.

### Mobile Menu (≤912px, fullscreen overlay)

Toggled by the burger; `position:fixed; inset:0; z-index:100; background:rgba(4,7,6,.55); backdrop-filter:blur(30px) saturate(140%);` (hidden ≥913px). Content padded `120px 28px 48px; max-width:520px; margin:0 auto; display:flex; flex-direction:column;`. Eyebrow "Chapters" (`font:500 11px/1 Gilroy; letter-spacing:.34em; text-transform:uppercase; color:rgba(155,194,106,.85); margin:0 0 28px`). A list of the five chapters using the same labels as the section_links map — **Roadmap, Discovery, System, Console, Outcome** — each `<button>` is a grid `44px 1fr auto` with index `01..05` (`font:500 11px/1 Gilroy; letter-spacing:.28em; color:rgba(155,194,106,.7)`), name (`font:400 26px/1 Lato; text-transform:uppercase; color:rgba(255,255,255,.92)`), and arrow `→` (`#cfe2a3; opacity:.6`). List has top/bottom hairlines `rgba(155,194,106,.14)`. A sage pill CTA "View live demo →" pinned at bottom (`margin-top:auto`). Clicking a chapter scrolls to its slide and closes the menu; opening the menu locks body scroll. Animate in with a fade + per-item stagger (`transition-delay: calc(var(--i)*60ms + 120ms)`).

---

## The WebGL scene

One fixed canvas renders the whole journey. The scene Controller instantiates **five objects + a flying-points layer** and, every frame, reads scroll-derived progress values and drives each object. (The original source also contains Object4/torus, Object5/product-flame, and Object7/left-sphere classes, but the live Controller does **not** instantiate them — skip them. Object5 uses `text.png` and Object7 uses `moon.jpg`+`light-7.png`; since neither is mounted, those two assets go unused in the rendered build. Object8 uses `light-8.png` and **is** mounted.)

### Renderer, camera, scene, postprocessing

```js
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
```

- **Renderer:** `new THREE.WebGL1Renderer({ canvas, antialias: true })`, `shadowMap.enabled = true`, `shadowMap.type = THREE.VSMShadowMap`. Size to the canvas's parent box; `setPixelRatio(window.devicePixelRatio)`. On touch/narrow devices (`innerWidth<768` or `(hover:none) and (pointer:coarse)`) do **not** attach a resize listener (iOS URL-bar toggling rebuilds the framebuffer and flickers); on desktop, listen to `resize`/`orientationchange` coalesced through rAF.
- **Scene:** `scene.background = new THREE.Color(0x000000)`; `scene.fog = new THREE.Fog(0x000000, 0, 15)`.
- **Camera:** `new THREE.PerspectiveCamera(45, innerW/innerH, 0.1, 80)`, position `(0,0,3)`, `camera.layers.enable(1)`. On resize update aspect + `updateProjectionMatrix()`.
- **Layers enum:** `NONE=0, TORUS_SCENE=1, BLOOM_SCENE=2, ENTIRE_SCENE=3`. (TORUS_SCENE is the torus pass; with the torus object skipped that composer renders empty but keep the pipeline — it's additively combined.)
- **OrbitControls** are created but fully disabled (`enabled=false`, no zoom/rotate/pan) — do not include them; rotation/parallax is per-object from mouse position.

**Composer (three composers, additively combined in a final ShaderPass).** Each frame, render in three layer passes:

```js
// torusComposer (layer TORUS_SCENE):
//   RenderPass(scene, camera)
//   ShaderPass(GammaCorrectionShader)
//   UnrealBloomPass(new Vector2(innerW, innerH), strength 0.6, radius 0.3, threshold 0)
//   ShaderPass(CopyShader)
// bloomComposer (layer BLOOM_SCENE):
//   RenderPass(scene, camera)
//   UnrealBloomPass(new Vector2(innerW, innerH), strength 0.175, radius 0.2, threshold 0)
//   ShaderPass(GammaCorrectionShader)
// finalComposer (layer ENTIRE_SCENE):
//   RenderPass(scene, camera)
//   ShaderPass(FinalPass)   // composites torus + bloom + diffuse + animated background warp
// finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture
// finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture
```

Per-frame render order: set `camera.layers.set(TORUS_SCENE)`, render torusComposer; set `BLOOM_SCENE`, render bloomComposer; set `ENTIRE_SCENE`, render finalComposer. Also update `finalPass.uniforms.iTime.value = performance.now()/1000`.

**FinalPass** — full-screen composite + animated dark-green background warp (the moving green field you see behind the particles). `haloTexture` is declared but never assigned, so it samples as black — harmless; keep it null. Shaders verbatim:

```glsl
// vertex
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4( position, 1.0 );
}
```
```glsl
// fragment
uniform float iTime;
uniform sampler2D tDiffuse;
uniform sampler2D bloomTexture;
uniform sampler2D torusTexture;
uniform sampler2D haloTexture;
varying vec2 vUv;

vec3 warp3d(vec3 pos, float t) {
  float curv =.8, a = 1.9, b = 0.7;
  pos *= 2.;
  pos.x += curv * sin(t + a * pos.y) + t * b;
  pos.y += curv * cos(t + a * pos.x);
  pos.y += curv * sin(t + a * pos.z) + t * b;
  pos.z += curv * cos(t + a * pos.y);
  pos.z += curv * sin(t + a * pos.x) + t * b;
  pos.x += curv * cos(t + a * pos.z);
  return 0.5 + 0.5 * cos(pos.xyz + vec3(1,2,4));
}

void main() {
  vec2 uv = 2. * vUv - 1.;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
  vec3 col = 1.5 * vec3(.05, .22, .12) * w.x;
  col *= w.y;
  col += vec3(.28, .42, .14) * w.z;
  col *= smoothstep(0.6, 1., abs(uv.y));
  col *= smoothstep(-.5, 1., -uv.y*uv.x);
  col *= smoothstep(-.5, 1., -uv.y*uv.x);
  gl_FragColor = vec4(col + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + texture2D(haloTexture, vUv).xyz, 1.);
}
```

### Per-object: geometry, material, shaders (verbatim), behavior

**Object1 — Preloader spiral** (`PlaneBufferGeometry(2,2)`, full-screen quad on layer ENTIRE_SCENE). Defines `POINTS = 17` control points of a logarithmic spiral computed on the CPU each frame and fed as `iPoints`/`iCenters` uniforms; the fragment shader renders glowing quadratic-Bézier strokes (`sdBezier`) between them, plus a bright core at the last center. `updateSpiral(points, centers, time, percent, init)`: for each i, `t = 60*percent - 8*i/count*(1+2*percent)`, `l = .8*e^(-0.05*t)`, `x = l*cos(t) + .1*l*cos(t*5/4 -1)`, `y = l*sin(t) + .1*l*sin(t*3/4 -1)`, written reversed; centers are midpoints of consecutive points. On first render, run a 5000ms tween of `percent 0→1` (renderDelay 10): each step recompute spiral with `time = 4*(performance.now()/1000)` and dispatch a `LOADING` event with `percent = min(100, round(percent*100))`. Update the `.scene-loader` text to `NN%`. When percent > 98 (first time): mark loaded, set `.controller` to `-loaded`, scroll-activate the hero slide, and after the preloader destroys (`destroy:true` path) remove the mesh, then after 150ms remove `-appearing` from `.hero` (firing the hero reveal). Uniforms: `iResolution {x:innerW*dpr, y:innerH*dpr}`, `iPoints` (Float32Array POINTS*2), `iCenters` (same). Defines `#define POINTS 17`, `#define RADIUS 0.03`, `#define GLOW 1.5`.

```glsl
// Object1 vertex
varying vec2 vUv;
void main()	{
  vUv = uv;
  gl_Position = vec4( position, 1.0 );
}
```
```glsl
// Object1 fragment   (prefix with: #define POINTS 17  #define RADIUS 0.03  #define GLOW 1.5)
uniform vec2 iResolution;
uniform vec2 iPoints[POINTS];
uniform vec2 iCenters[POINTS];
varying vec2 vUv;

float dot2( in vec2 v ) { return dot(v,v); }
vec2 sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
  vec2 a = B - A;
  vec2 b = A - 2.0*B + C;
  vec2 c = a * 2.0;
  vec2 d = A - pos;

  float kk = 1.0 / dot(b,b);
  float kx = kk * dot(a,b);
  float ky = kk * (2.0*dot(a,a) + dot(d,b)) / 3.0;
  float kz = kk * dot(d,a);

  vec2 res;

  float p = ky - kx*kx;
  float p3 = p*p*p;
  float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
  float h = q*q + 4.0*p3;

  if(h >= 0.0) {
    h = sqrt(h);
    vec2 x = (vec2(h, -h) - q) / 2.0;
    vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
    float t = clamp(uv.x+uv.y-kx, 0.0, 1.0);
    res = vec2(dot2(d+(c+b*t)*t),t);
  } else {
    float z = sqrt(-p);
    float v = acos( q/(p*z*2.0) ) / 3.0;
    float m = cos(v);
    float n = sin(v)*1.732050808;
    vec3 t = clamp( vec3(m+m,-n-m,n-m)*z-kx, 0.0, 1.0);
    float dis = dot2(d+(c+b*t.x)*t.x);
    res = vec2(dis,t.x);
    dis = dot2(d+(c+b*t.y)*t.y);
    if( dis<res.x ) res = vec2(dis,t.y );
  }
  res.x = sqrt(res.x);
  return res;
}

float map(vec2 pos){
  float d = 1e9;
  const int i = 0;
  for(int i = 0; i < POINTS - 2; i++) {
    vec2 f = sdBezier(pos, iCenters[i], iPoints[i + 1], iCenters[i + 1]);
    d = min(d, max(
      pow(f.x, 0.65) - .01,
      f.x + 0.3 * pow((float(POINTS - 2) - f.y - float(i)) / float(POINTS - 2), 1.85)
    ));
  }
  return d;
}

void main() {
  vec2 uv = (2. * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
  float d = map(uv);
  vec3 col = vec3(.18, .42, .22) * min(pow(RADIUS/max(0., d), GLOW), 2.5);
  float f = length(uv - iCenters[POINTS - 2]);
  col = max(col, vec3(.62, .82, .35) * min(pow(RADIUS/max(0., pow(f, 0.65)), GLOW), 5.));
  gl_FragColor = vec4(col, 1.0);
}
```

**Object2 — Wave / disc** (the Hero scene). A `THREE.Group` holding two `THREE.Points` clouds on layer ENTIRE_SCENE, `AdditiveBlending`, `depthTest:false`, group rotation set via `particleRotation = [0.6,0,0]`, position `[0,0,-0.8]`. Constants: `H = 0.1`, `R = 1.9`, `count1 = 120000`, `count2 = 1500`. Wave1 vertices: `r = R*Math.pow(random,0.6)`, `a = random*2π`, `x = r*sin(a)`, `z = r*cos(a)`, `y = H*fbm(a,r)` where `sine(x)=.6*sin(x)+.3*cos(2x)+.1*sin(4x)`, `noise1d(a,r,q)=sine(10*q*(a+2r))`, and `fbm` sums 4 octaves (`c=1,p=1.3,q=0.9`; multiply c by q each term; divide by 3.43); `size = 10+10*random`; `id = random`; plus a precomputed uniform-on-sphere morph target `spherePos` (sphereR 0.85, `rj = sphereR*cbrt(random)`, with the y component halved). Wave2 ("rocks"): `count2=1500`, `r=.85*R*sqrt(random)`, `y = H*(r*r*6+1)`, `size = 30+30*random`; same sphere targets (sphereR2 0.85). Both share `material1.uniforms`: `iTime, iMouse(vec2), iAnimate(0→1), uOpacity(1), uDisperse(0)`.

Render: keep group at visible z. On first `progress>0.01`, start a 3s ease-out-cubic entrance ramping `iAnimate 0→1` (the wave assembles in). Drive `uDisperse = disperseProgress = 1 - heroProgress` so as you scroll away from the hero the particles fly outward along their sphere directions and fade. Rotate both clouds `rotation.y += 0.15*dt`. Mouse: convert pointer to NDC, lerp `iMouse` toward it at 0.09. Hide the group once `disperseProgress >= 0.98`.

```glsl
// Object2 wave1 vertex
attribute float size;
attribute float id;
attribute vec3 spherePos;
uniform vec2 iMouse;
uniform float iAnimate;
uniform float uDisperse;
varying vec3 pack;
varying float vDisperse;
void main() {
  float d = pow(uDisperse, 1.4);
  vec3 outward = spherePos * d * 7.0;
  outward *= (0.7 + 0.6 * id);
  vec3 pos = position + outward;
  vDisperse = d;

  pack.x = length(pos.xz);
  pack.y = atan(pos.z, pos.x);
  pack.z = pos.y;

  vec4 mv = modelViewMatrix * vec4( pos, 1.0 );
  gl_PointSize =  size / -mv.z * (.5 + .5*iAnimate);
  vec4 res = projectionMatrix * mv;

  vec2 r = res.xy - 2.5 * iMouse;
  float f = clamp(.35 - length(r), 0., 1.);
  res.xy += normalize(r) * f * f;

  float a = pow(iAnimate, 0.6);
  res.xy *= clamp(2. * a + pow(id, .7) - 1., 0., 1.);

  gl_Position = res;
}
```
```glsl
// Object2 wave1 fragment   (note: H=0.1, R=1.9 are string-substituted into the source as literals)
uniform float iTime;
uniform float uOpacity;
uniform float iAnimate;
varying float r;
varying vec3 pack;
varying float vDisperse;
void main() {
  float r = pack.x;
  float a = pack.y;
  float py = pack.z;

  float glow = pow(0.018 / max(0., r), .9);
  float fading = smoothstep(-0.1, .8*0.1, py) * smoothstep(1.6 * 1.9, .7 * 1.9, r*r);
  a = sin(4. * ((-a + 2. * r)));
  float blink = clamp((.2 + 1.5 * r * sin(a)) * (.5 + .5 * sin(r * 8. + iTime * 4.)), 0., 1.);

  vec3 col = vec3(.10, .26, .14) * .6;
  vec3 col2 = vec3(.55, .72, .25) * .6;
  vec3 light = vec3(.45, .70, .35) * .8;
  vec3 tex = 1. - smoothstep(.6, 1., vec3(length(2. * gl_PointCoord - 1.)));
  col = mix(col, col2, clamp(blink + vDisperse * 0.7, 0., 1.));

  float fadeOut = 1.0 - vDisperse;
  gl_FragColor = vec4(col * tex * fading + tex * light * glow, uOpacity * fadeOut);
}
```
```glsl
// Object2 wave2 (rocks) vertex   (H=0.1 substituted as literal)
attribute float size;
attribute float id;
attribute vec3 spherePos;
uniform float iTime;
uniform vec2 iMouse;
uniform float iAnimate;
uniform float uDisperse;
varying float rn;
varying float vDisperse;
void main() {
  rn = id;
  float rr = position.x * position.x + position.z * position.z;
  vec3 pos = vec3(position.x, 0.1 * sin(iTime * .6 + 100. * rn) / (rr * .33 + .8), position.z);

  float d = pow(uDisperse, 1.4);
  pos += spherePos * d * 7.0 * (0.7 + 0.6 * id);
  vDisperse = d;

  vec4 vpos = modelViewMatrix * vec4( pos, 1.0 );
  gl_PointSize =  size / -vpos.z * ( 0.8 + 0.2 * sin(iTime * (1. + rn) * 3. )) * (.5 + .5*iAnimate);
  vec4 res = projectionMatrix * vpos;

  vec2 r = res.xy - 2.5 * iMouse;
  float f = clamp(.35 - length(r), 0., 1.);
  res.xy += normalize(r) * f * f;

  float a = pow(iAnimate, 0.9);
  res.xy *= clamp(2. * a + pow(id, .7) - 1., 0., 1.);

  gl_Position = res;
}
```
```glsl
// Object2 wave2 (rocks) fragment
uniform float uOpacity;
uniform float iAnimate;
varying float rn;
varying float vDisperse;
void main() {
  vec3 color = vec3(.55, .72, .25) * .8;
  vec3 tex = 1. - smoothstep(.3, 1., vec3(length(2. * gl_PointCoord - 1.)));
  float fadeOut = 1.0 - vDisperse;
  gl_FragColor = vec4(color * tex, (.5 + .5 * rn) * uOpacity * fadeOut);
}
```

**Object3 — Galaxy** (the Sitemap scene). A `THREE.Group` at visible z (`0.3` desktop, `-0.24` if `innerWidth<768`), holding a `THREE.Points` of **6000** particles plus a procedurally-drawn **Logo** plane and a **BgLight** bloom plane. Particle attributes: `position` = random point on unit sphere; `randoms` = 3 randoms; `inside` = `1` for i<3500 else `-1`. `depthTest:false`, `transparent`. On mobile scale points to 0.7. Uniforms: `iTime, iResolution, uAssemble(0→1), uOpacity(0→1)`. Render drives `uAssemble = sitemapProgress`, `uOpacity = min(1, progress*1.4)`, Logo opacity `(progress-0.4)*2.5` clamped, BgLight opacity `(progress-0.05)*1.15` clamped. Mouse parallax (once `progress>0.5`): lerp rotation toward cursor offset and set `points.rotation = (curY/-2, curX/-2, 0)`. Logo plane spins `rotation.y -= 0.02` per frame.

- **Logo** = `PlaneGeometry(0.5,0.5)`, `MeshBasicMaterial({transparent, side:DoubleSide, depthTest:false, map: <canvas texture>})` on ENTIRE_SCENE, at origin. Canvas texture (512²): outer ring stroke `rgba(155,194,106,.95)` width 5 at r=0.38·size; inner ring `rgba(168,196,122,.78)` width 2.5 at r=0.27; radial-gradient core fill (`#cfe2a3 0`, `rgba(110,156,52,.85) .45`, `rgba(58,92,32,0) 1`) at r=0.14; four tick marks at cardinal angles from r=0.44 to r=0.485, stroke `rgba(155,194,106,.95)` width 4.
- **BgLight** = `PlaneGeometry(1,1)`, `MeshBasicMaterial({transparent, side:DoubleSide, depthTest:false, map:<canvas>})` on **BLOOM_SCENE**, at `(0,0,-0.1)` scale 0.8. Canvas (512²): tight halo radial-gradient (`rgba(220,235,180,.75) 0`, `rgba(168,196,122,.25) .35`, `rgba(58,92,32,0) 1`) filled to size, plus a pin-prick core (`rgba(207,226,163,1) 0`, `rgba(95,140,45,.8) .6`, `rgba(40,70,22,0) 1`) at r=0.04.

```glsl
// Object3 vertex   (defines: POINTSIZE 40., R_2 .34, R_2_DISTOR 2., R_2_POINTSIZE .5)
attribute vec3 randoms;
attribute float inside;
uniform float iTime;
uniform vec2 iResolution;
uniform float uAssemble;
varying vec3 color;
varying float z;
varying float t;

#define POINTSIZE 40.
#define R_2 .34
#define R_2_DISTOR 2.
#define R_2_POINTSIZE .5

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  float size = POINTSIZE * (1. + randoms.x);
  t = fract(randoms.y + .2 * iTime);
  float r = pow(.2 + min(.7, .8 * t), .3);
  size *= pow(t,.5) * smoothstep(.8, .7, t);
  if (inside < 0.) {
    r = mix(R_2, .0, pow(t, R_2_DISTOR));
    size = size * R_2_POINTSIZE;
  }
  float aP = smoothstep(0.0, 1.0, uAssemble);
  float scatterScale = mix(5.0 + randoms.x * 2.0, 1.0, aP);
  vec3 pos = position * r * scatterScale;

  vec4 vpos = modelViewMatrix * vec4(pos, 1.);
  float warm = step(.7, randoms.z);
  float warmHue = mix(70., 100., randoms.x) / 360.;
  float coolHue = mix(110., 140., randoms.y) / 360.;
  color = hsv2rgb(vec3(mix(coolHue, warmHue, warm), .7, .7));
  z = dot(normalize(cameraPosition), position);
  gl_PointSize = size * iResolution.y / 900. / -vpos.z;
  gl_Position = projectionMatrix * vpos;
}
```
```glsl
// Object3 fragment
varying vec3 color;
varying float z;
varying float t;
uniform float uOpacity;
void main() {
  float d = length(2. * gl_PointCoord - 1.);
  float t2 = max(0., 2.*fract(t) - .66);
  d = d + t2;
  float tex = pow(smoothstep(1., .25, d), 3.);
  float fade = clamp(.7 * z + .8, 0., 1.);
  gl_FragColor = vec4(pow(color * tex * fade, vec3(1./2.2)), tex * uOpacity);
}
```

**Object6 — Terrain** (the Roadmap/Brief scene). A `THREE.Points` grid of `I=100 × J=100 = 10000` points on layer ENTIRE_SCENE, group position `[0,-0.3,0]`, `depthTest:false`, `transparent`. Each point's base position: `x = i/I*1.8 - 0.9`, `y = random`, `z = j/J*1.7 - 0.85`; a "hidden" variant keeps z=0. Render lerps positions hidden→visible by `progress` (roadmap sceneProgress), sets `uAlpha = progress`, and drives `iAnimation = iAnim = roadmapLocalProgress * 2` (two-stage morph: 0..1 shifts z, 1..2 shifts x). Uniforms: `iAnimation, iTime, iResolution, uAlpha, uWarm vec3(0.608,0.761,0.416)` (#9bc26a), `uCool vec3(0.110,0.227,0.133)` (#1c3a22), `uBrightness 1.0, uBloomAmount 0.45, uBloomWidth 1.0`. (Skip the 10k-point loop while `progress` hasn't changed > 0.002.)

```glsl
// Object6 vertex
uniform float iAnimation;
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 uWarm;
uniform vec3 uCool;
uniform float uBrightness;

varying float cameraDistance;
varying float z;
varying vec3 c;
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}
const mat2 m2 = mat2(0.8,-0.6,0.6,0.8);
float fbm( in vec3 p ){
  float f = 0.0;
  f += 0.55000 * cnoise(p);
  p.xz = m2 * p.xz * 2.02;
  f += 0.050 * cnoise(p);
  p.xz = m2 * p.xz * 2.05;
  f += 0.350 * cnoise(p);
  return f;
}
vec2 wnoise(vec2 pos, float t, float curv) {
  pos.x += curv * sin(2.0*t+1.5 * pos.y)+t*0.5;
  pos.y += curv * cos(2.0*t+1.5 * pos.x);
  return 0.5 + 0.5*cos(pos.xy+vec2(0,2));
}
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void main() {
  vec3 v = position;
  float anim1 = clamp(iAnimation, 0., 1.);
  float anim2 = clamp(iAnimation-1., 0., 1.);
  v.z = fract(v.z + anim1);
  v.x = fract(v.x + anim2);
  v.x = 4. * (v.x * 1.6 - 0.8);
  v.z = 4. * (v.z * 1.3 - 0.65);
  v.y = .65 * (clamp(abs((v.x)/2. + 2. - 2.4 * anim2), 0., 1.))
            * fbm(.5 * (v - vec3(.6 * iTime + 6.4 * anim2, 0., 5.2 * anim1))) - .2 * v.x;
  v.x -= .3 * v.z - .3;
  vec2 h = wnoise(8.*(position.xy - vec2(iTime/10.6, 0.)), 0., .4);
  float hue = (h.x+h.y)/2.;
  float fade = cnoise(5.*(vec3(position.xz, 0.) - vec3(iTime/10.6, 0., 0.))) * 1.3 + 0.7;
  float warm = step(.7, hue);
  c = mix(uCool, uWarm, warm) * fade * uBrightness;
  vec4 mvpos = modelViewMatrix * vec4(v, 1.);
  z = v.z;
  cameraDistance = length(cameraPosition - v);
  gl_PointSize = 17.5 * iResolution.y / 730. / -mvpos.z;
  gl_Position = projectionMatrix * mvpos;
}
```
```glsl
// Object6 fragment
varying float cameraDistance;
varying float z;
varying vec3 c;
uniform float uAlpha;
uniform float uBloomAmount;
uniform float uBloomWidth;
void main() {
  float pd = length(2. * gl_PointCoord - 1.);
  float d0 = .3;
  float d = max(0., pd - d0) * max(.3, 1.5 * cameraDistance) * 8.;
  float core = pow(2.71828, -d*d / 2.) / 2.506628;
  float halo = pow(max(0., 1. - pd / max(0.001, uBloomWidth)), 2.5) * uBloomAmount;
  float tex = core + halo;
  float depthFade = min(1., (-z + 2.7) / 1.3) * (z + 2.7) / 1.3;
  gl_FragColor = vec4(tex * c * 1.8, tex * depthFade) * uAlpha;
}
```

**Object8 — Cosmos / rising star sphere** (the Impact scene). A `THREE.Group` lerped from hidden `[0,-5,-8]` to visible `[0,0,0]` by `impactProgress`. Contains a `sphereGroup` (position `(0,-0.4,0)`, scale 2) holding: a dark `MeshStandardMaterial` sphere `SphereBufferGeometry(2,50,50)` color `0x020202`, `side:DoubleSide`, on BLOOM_SCENE, spinning `rotation.y = 0.15*t`; and a **stars** point cloud (20000 points) rendered via a `PointPass`-style `THREE.Points` with the shader below, on ENTIRE_SCENE, sharing the sphere's iTime/iResolution. A directional light `setRGB(.25,.55,.25)` intensity 1 at `(0,5,-10)` on BLOOM_SCENE. Plus a **BgLight** plane `PlaneGeometry(4.5,5)`, `MeshBasicMaterial({transparent, opacity:.9, side:DoubleSide, map: light-8.png})` scale 1.5 at `(0,-3.7,-1)` on BLOOM_SCENE. Stars geometry: 20000 points each `position = (random,random,random)`, `size = (.7+.7*random)*.55`.

```glsl
// Object8 stars vertex   (#define SIZE 40.)
attribute float size;
uniform float iTime;
uniform vec2 iResolution;
varying vec3 col;
varying float fade;

#define SIZE 40.

vec3 warp3d(vec3 pos, float t) {
  float curv = 0.9, a = 1.9, b = 0.003, c = 0.003;
  pos.x += curv * sin(c * t + a * pos.y) + t * b;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.y += curv * sin(c * t + a * pos.z) + t * b;
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.x += curv * cos(c * t + a * pos.z);
  return pos.xyz / 1.9;
}

vec3 warp3s(vec3 pos, float t) {
  float curv = 1.3, a = 1.9, b = 0.08, c = 0.05;
  pos /= 2.;
  pos.x += curv * sin(c * t + a * pos.y) + t * b;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.y += curv * sin(c * t + a * pos.z) + t * b;
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.x += curv * cos(c * t + a * pos.z);
  return cos(pos.xyz / 1.9 * 3.1415 + vec3(1,3,5));
}

vec4 qmult(vec4 p, vec4 q) {
  vec3 pv = p.xyz, qv = q.xyz;
  return vec4(p.w * qv + q.w * pv + cross(pv, qv), p.w * q.w - dot(pv, qv));
}

vec3 rotate(vec3 point, vec4 qrotor) {
  vec3 rv = qrotor.xyz;
  return qmult(qrotor, vec4(point * qrotor.w - cross(point, rv), dot(point, rv))).xyz;
}

vec2 wnoise2(vec2 pos, float t, float curv) {
  pos.x += curv * sin(2.0*t+1.5 * pos.y)+t*0.5;
  pos.y += curv * cos(2.0*t+1.5 * pos.x);
  return 0.5 + 0.5*cos(iTime+pos.xy+vec2(0,2));
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  col = position;
  vec3 v = position;
  vec3 w = warp3d(2. * v - 1., .85*iTime);

  float a = w.x * 6.2831853;
  float b = acos(2. * w.y - 1.);
  float r = pow(w.z, 1./3.);
  float x = r * sin(b) * cos(a);
  float y = r * sin(b) * sin(a);
  float z = r * cos(b);
  v = vec3(x, y, z);
  vec3 s = warp3s(v, .85*iTime);
  v = mix(v, s, 0.15);

  vec3 i = vec3(sin(5. * iTime * .005), sin( 7. * iTime * .005), sin(13. * iTime * .005)) * .5 + .5;
  vec4 q = vec4(sqrt(1. - 0.6 * i.x) * sin(6.2831853 * i.y), sqrt(1. - 0.6 * i.x) * cos(6.2831853 * i.y),
                sqrt(0.6 * i.x) * sin(6.2831853 * i.z), sqrt(0.6 * i.x) * cos(6.2831853 * i.z));

  v = rotate(v.yxz, q);
  v = .988 * normalize(v);
  float fade = v.z * .35 + .65;
  v = 2. * (v - vec3(0, 1, 0));

  vec4 mvpos = modelViewMatrix * vec4(v, 1.);
  gl_PointSize = SIZE * size * iResolution.y / 730. / -mvpos.z;
  gl_Position = projectionMatrix * mvpos;

  vec2 h = wnoise2(v.xy*3., iTime*.01, .4);
  float hue = (h.x+h.y)/2.;
  float warm = step(.75, hue);
  float warmHue = .22 + .06 * hue;
  float coolHue = .32 + .06 * hue;
  col = hsv2rgb(vec3(mix(coolHue, warmHue, warm), 0.75, 0.60)) * fade;
}
```
```glsl
// Object8 stars fragment
varying vec3 col;
uniform vec2 iResolution;
void main() {
  float tex = pow(smoothstep(1., .2, length(2. * gl_PointCoord - 1.)), 3.);
  gl_FragColor = vec4(tex * col, tex );
}
```

**FlyPointPass — global flying points** (a `THREE.Points` of 200 points on ENTIRE_SCENE at `(0,0,-1)`). Each point `position=(2r-1,2r-1,2r-1)`, `size = 25+25*random`. Uniforms: `iTime, iShift(vec3), iAlpha(0), iAnimation(vec3, start z=10), iResolution`. Each frame `update(t)`: `iTime = t`; `iShift += cameraPosition * 0.0022`. The scene Controller blends per-scene targets weighted by sceneProgress and writes `iAlpha` (blended opacity) and `iAnimation` (blended xyz offset): targets are `hero {o:1,x:0,y:0,z:0}`, `sitemap {o:0,x:0,y:0,z:10}`, `roadmap {o:1,x:0,y:3,z:0}` (weighted average of o/x/y/z by each scene's progress; if total weight 0, o=0). Only update when `o>0.001`.

```glsl
// FlyPointPass vertex
attribute float size;
uniform float iTime;
uniform vec3 iShift;
uniform vec2 iResolution;
uniform vec3 iAnimation;
varying float transparency;
varying float warmness;

vec3 warp3d(vec3 pos, float t) {
  float curv = 0.9, a = 1.9, b = 0.25, b2 = 0.03, c = 0.02;
  pos *= 2.;
  pos.x += curv * sin(c * t + a * pos.y) + t * b2;
  pos.y += curv * cos(c * t + a * pos.x);
  pos.z += curv * cos(c * t + a * pos.y);
  pos.z += curv * sin(c * t + a * pos.x) + t * b;
  pos.z = abs( pos.z );
  return pos.xyz;
}

void main() {
  vec3 v = warp3d(position, iTime);
  v = 3. * (2. * fract(v + iShift) - 1.) + iAnimation;

  vec4 vpos = modelViewMatrix * vec4(v, 1.);
  vec2 t = vec2(1);
  vec2 q = vec2(length(position.xy)-t.x,position.z);
  transparency = step(length(v), 3.);
  warmness = step(.75, fract(size * 7.13));

  gl_PointSize = size * iResolution.y / 1000. / -vpos.z;
  gl_Position = projectionMatrix * vpos;
}
```
```glsl
// FlyPointPass fragment
varying float transparency;
varying float warmness;
uniform float iAlpha;
void main() {
  vec3 cool = vec3(.12, .30, .15) * .8;
  vec3 warm = vec3(.55, .72, .28) * .8;
  vec3 color = mix(cool, warm, warmness);
  float tex = smoothstep(1., .3, length(2. * gl_PointCoord - 1.));
  gl_FragColor = vec4(tex * color, tex * transparency * iAlpha );
}
```

(For reference, Object8's stars use the related **PointPass** vertex/fragment family — same `warp3d`/`mix(cool,warm)` palette idiom — but Object8 supplies its own `starsShader` above, so use that one for Object8.)

### Animation loop & scroll→progress mapping

Run one rAF loop. Every frame:
1. **Compute scroll progress** (the heart of the choreography). Maintain `smoothedScrollY`: on touch/narrow (`innerWidth<768` or coarse pointer) lerp it toward `window.scrollY` at factor `0.08` (snap if the gap exceeds `vh*1.5`); otherwise `smoothedScrollY = window.scrollY`. Let `vh = innerHeight`, `cy = smoothedScrollY + vh*0.5`, `fadeBuffer = vh`. For each `[data-slide-id]` group, compute the union document range `[minTop, maxBot]` using `rect.top + window.scrollY` (raw). Then:
   - `center = (minTop+maxBot)/2`, `halfH = (maxBot-minTop)/2`, `plateauHalf = max(0, halfH - fadeBuffer/2)`, `dist = |cy - center|`. **sceneProgress** = `1` if `dist<=plateauHalf` else `max(0, 1 - (dist-plateauHalf)/fadeBuffer)`.
   - `stuck = max(1, (maxBot-minTop) - vh)`, **slideLocalProgress** = `clamp((smoothedScrollY - minTop)/stuck, 0, 1)`.
   - Write `--scene-progress` (3-decimal) and `--slide-local` to the slide wrap element so CSS fades work.
2. **Active screen with hysteresis** (`HYSTERESIS = vh*0.06`): stay on the current slide until `cy` decisively leaves `[minTop-H, maxBot+H)`, then pick the slide whose range contains `cy` (or nearest center past the last slide). This `activeScreen` drives the `.slide.-active` class and the Sitemap reveal trigger.
3. **Drive the scene**: read `heroProg = sceneProgress.hero`, `sitemapProg`, `briefProg = sceneProgress.roadmap`, `briefLocal = slideLocalProgress.roadmap`, `impactProg = sceneProgress.impact`. Then call:
   - `wave.render({ progress: heroProg, disperseProgress: 1 - heroProg })`
   - `galaxy.render({ progress: sitemapProg })`
   - `terrain.render({ progress: briefProg, iAnim: briefLocal * 2 })`
   - `cosmos.render({ progress: impactProg })`
   - `points.render({ sceneProgress })`
   - Preloader: while alive, `preloader.render({ destroy: isLoaded })`.
4. **Render** the three composers (torus → bloom → final) as described.

**Pointer mapping:** track the latest `mousemove`/`mouseenter` event globally. Object2 (wave) reads `clientX/clientY`, converts to NDC, lerps `iMouse` at 0.09 and bends nearby particles. Object3 (galaxy) and the Sitemap card parallax read the cursor offset from screen center and lerp rotation/translation toward it (galaxy only once `progress>0.5`; card only on desktop).

---

## The loader / reveal

On load the page shows only the WebGL preloader: a glowing green logarithmic spiral (Object1) draws itself while a centered `NN%` counter (`.scene-loader`) climbs 0→100 over ~5s (driven by the spiral tween dispatching `LOADING` events). The `.controller` carries `-not-loaded`, which hides the header, menu, and all slides (`opacity:0; visibility:hidden`). When the counter passes ~98%: set `.controller` to `-loaded` (header/slides fade in over 1s), scroll-activate the hero slide (add `.slide.-active`), remove the preloader mesh, and **150ms later** strip `-appearing` from `.hero`. That kicks off the staggered hero reveal (title → subtitle → brief → CTA → "Scroll to enter", per HeroAnim delays), running concurrently with Object2's 3-second `iAnimate 0→1` entrance ramp that assembles the particle wave. From there scrolling crossfades scenes via the progress math.

---

## Fixed parameters (bake these in)

**Colors (hex):** background `#010101`; footer base `#030503`; sage primary `#9bc26a`; bright sage `#cfe2a3`; light wash `#d6ecc2`; deep moss `#3a5c20`; dark moss `#1c3a22`, `#2c4a32`; warm/cool node greens `#7fa84d`, `#a8c47a`, `#b8d090`; scene clear `0x000000`; Object7-sphere color (unused) `0x0A1D0E`; Object8 sphere color `0x020202`; galaxy logo gradient stops as listed; terrain `uWarm vec3(0.608,0.761,0.416)`, `uCool vec3(0.110,0.227,0.133)`.

**Type:** Hero title `400 168px Lato` (140px ≤1180, 17vw ≤855, 19vw ≤480); subtitle `400 22px Gilroy`; brief `15px`; CTA `600 13px` letter-spacing .2em uppercase. Sitemap heading `400 28px Lato`; chapter/eyebrow `500 11px Gilroy` letter-spacing .34em. Brief heading `400 46px Lato` (32px ≤855, 26px ≤480); body `400 16px Gilroy`. Impact heading `400 42px Lato`; value `300 72px Lato` (60/52 down-bp); suffix 28px. Footer wordmark `400 clamp(46px,7vw,92px) Lato`.

**Breakpoints (px):** 1180, 1151, 991, 912, 855, 768 (mobile scene/JS switch + Sitemap mobile), 656, 576 (`onMobile`), 480, 376, 360; height bps 828, 717.

**Durations / easings:** Lenis `duration 1.1`, easing `min(1, 1.001 - 2^(-10t))`, wheelMultiplier 1, touchMultiplier 1.4; programmatic scroll `1.4s`. Preloader tween `5000ms`. Object2 entrance `3000ms` ease-out-cubic; rotation `0.15 rad/s`; mouse lerp `0.09`. Hero reveal `1.4s` (title `1.8s`) `cubic-bezier(.16,.77,.3,1)`, delays .1/.35/.55/.75/.95s. Brief/Impact reveal `.7s` `cubic-bezier(0.22,1,0.36,1)`, brief word stagger `--i*55ms+240ms`, body `--wc*55ms+340ms`, impact cards `--i*110ms+140ms`. Sitemap rAF reveal duration `650ms` quartic, queue delays 0/60/180/240/300/380ms, rise `36px` desktop / `0` mobile, cursor parallax lerp `0.1`, translate `/-10`. Smooth-scroll progress lerp `0.08`, snap threshold `vh*1.5`. Hysteresis `vh*0.06`. fadeBuffer `= vh`.

**Scene counts / geometry:** camera fov 45, near 0.1, far 80, position (0,0,3). Fog `(0x000000, 0, 15)`. Bloom: torus `(0.6, 0.3, 0)`, main `(0.175, 0.2, 0)`. Object1 POINTS 17, RADIUS 0.03, GLOW 1.5. Object2 count1 120000, count2 1500, H 0.1, R 1.9, sphereR 0.85, particlePosition (0,0,-0.8), particleRotation (0.6,0,0). Object3 6000 particles (3500 "inside"), POINTSIZE 40, R_2 .34, visible z 0.3 (-0.24 mobile), mobile scale 0.7. Object6 grid 100×100=10000, group y -0.3, point size factor 17.5, iAnim = local*2. Object8 stars 20000, sphere (2,50,50), sphereGroup pos (0,-0.4,0) scale 2, hidden (0,-5,-8) → visible (0,0,0), bglight plane (4.5,5) scale 1.5 at (0,-3.7,-1). FlyPointPass 200 points, size 25+25·rand, at (0,0,-1), targets hero/sitemap/roadmap as listed.

**Slide layout:** roadmap slide `min-height:250vh` (≈2.5 viewports), `margin-top:300px`; impact `margin-top:240px`; footer `margin-top:60vh`. Sitemap row_2 `margin-top:64px`, row_3 `margin:280px auto 0; translateX(-2%)`.

**Chapter labels (Sitemap & mobile menu):** 01 Roadmap, 02 Discovery, 03 System, 04 Console, 05 Outcome.

---

## Assets

All four scene textures live in our public bucket. Base:
`https://api.getlayers.ai/storage/v1/object/public/public/assets/helios-1d900eeeb8`

| File | In-scene usage | Full URL |
|------|----------------|----------|
| `text.png` | Object5 (product flame text) — Object5 is **not** mounted in the live scene, so this texture is effectively unused; load only if you also build Object5. `RepeatWrapping` on both axes. | `https://api.getlayers.ai/storage/v1/object/public/public/assets/helios-1d900eeeb8/text.png` |
| `moon.jpg` | Object7 sphere `.map` (MeshPhongMaterial). Object7 is **not** mounted in the live scene → unused unless you build Object7. | `https://api.getlayers.ai/storage/v1/object/public/public/assets/helios-1d900eeeb8/moon.jpg` |
| `light-7.png` | Object7 BgLight plane `.map`. Same as above — unused in the live build. | `https://api.getlayers.ai/storage/v1/object/public/public/assets/helios-1d900eeeb8/light-7.png` |
| `light-8.png` | Object8 BgLight plane (`PlaneGeometry(4.5,5)`, scale 1.5, `(0,-3.7,-1)`, `opacity .9`, `DoubleSide`, BLOOM_SCENE) `.map`. **Used** — load it. | `https://api.getlayers.ai/storage/v1/object/public/public/assets/helios-1d900eeeb8/light-8.png` |

Load each via `new THREE.TextureLoader().load('<full URL>')`. (`logo.png` and `light-3.png` from the original repo are not used — ignore them; the Object3 logo + bg-light are generated procedurally on a `<canvas>`.) For cross-origin textures set `texture.crossOrigin = 'anonymous'` if needed.