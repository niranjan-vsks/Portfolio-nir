# Recreate this section: Slider Spectra

You are an expert front-end developer. Produce a **single self-contained `index.html`** that
renders the section below **exactly** as specified — same layout, styles, typography, colors,
copy, responsive behaviour and interactions. No build step, no framework, no external CSS/JS
(inline everything). Hardcode every value given here as fixed constants.

## What it is

An immersive dark-stage **eyewear coverflow slider**. Seven portrait cards fan into a CSS-3D
coverflow arc beneath a faint minimalist glasses silhouette. The centre card lifts, brightens
and casts a coloured halo keyed to its own hue; the flanking cards tilt away, sink, recede in Z
and dim into the near-black background. It **autoplays** (pausing on hover, while dragging, and
when the browser tab is hidden), and you can **drag / swipe / use arrow-keys / click a card** to
spin the fan — the motion is continuous, momentum-eased, and wraps around forever. Below the fan
sits a small glasses mark, a light-weight headline, and an "Enter Store" pill button.

Pure HTML + CSS 3D + one small script — no WebGL, no framework, no external dependencies. Card
photos load over the network (URLs listed under **Assets**); a per-card `c1`/`c2` neon gradient
stays as the fallback behind each image.

## Layout & structure

A single full-viewport `<section id="section">` (min-height `100svh`) is a vertical flex column,
centred, with these children in order:

1. `<div class="halo" aria-hidden="true">` — the coloured glow that bleeds from behind the centre card.
2. `<div class="mark" aria-hidden="true">` — the minimalist glasses SVG logo.
3. `<div class="stage" id="stage">` — the coverflow stage (perspective container) holding
   `<div class="deck" id="deck">`, into which the cards are injected by JS.
4. `<h2 class="caption" id="caption">` — the headline.
5. `<a class="cta" id="cta">` — the "Enter Store" pill with an arrow dot.
6. `<p class="sr-only" aria-live="polite" id="live">` — a screen-reader live region announcing the active card.

The section carries `aria-roledescription="carousel"` and `aria-label="Eyewear showcase"`. The
stage is `role="group"` with `aria-label="Drag, swipe or use arrow keys to browse eyewear"`.

Each **card** is a `<button type="button" class="card">` positioned absolutely at the deck centre,
with `aria-label` = `"<name> — eyewear <i+1> of <N>"`, its own `--c1`/`--c2` custom properties,
and inner markup:

```html
<span class="card__inner">
  <span class="card__media">
    <img src="<image-url>" alt="<name> eyewear" draggable="false" loading="lazy">
  </span>
</span>
```

(If a card had no image, the `<img>` is omitted and the `card__media` gradient shows alone.)

Reproduce the section markup verbatim:

```html
<section id="section" aria-roledescription="carousel" aria-label="Eyewear showcase">
  <div class="halo" aria-hidden="true"></div>

  <div class="mark" aria-hidden="true">
    <!-- minimalist glasses logo -->
    <svg viewBox="0 0 120 46" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round">
      <path d="M6 16 Q2 18 2 26"/>
      <path d="M114 16 Q118 18 118 26"/>
      <circle cx="34" cy="26" r="16"/>
      <circle cx="86" cy="26" r="16"/>
      <path d="M50 24 q10 -8 20 0"/>
    </svg>
  </div>

  <div class="stage" id="stage" role="group" aria-label="Drag, swipe or use arrow keys to browse eyewear">
    <div class="deck" id="deck"><!-- cards injected from the card list --></div>
  </div>

  <h2 class="caption" id="caption">Eyewear That Stands Out</h2>

  <a class="cta" id="cta" href="#">
    <span id="ctaLabel">Enter Store</span>
    <span class="cta__dot" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>
    </span>
  </a>

  <p class="sr-only" aria-live="polite" id="live"></p>
</section>
```

## Styles

Use this full CSS verbatim (the CSS custom properties on `#section` mirror the palette/geometry
constants; `--card-w`, `--card-h`, `--persp` and `--halo` are updated live by the script):

```css
/* ---- reset (the file is standalone so it owns the page) ---- */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body { background: var(--bg, #05070c); }

/* ---- CONFIG → CSS custom properties ---- */
#section {
  --bg:       #05070c;   /* stage background (near-black) */
  --bg2:      #0a1020;   /* subtle upper wash */
  --text:     #f4f6fb;   /* headline / button ink */
  --muted:    rgba(244,246,251,.42);
  --halo:     #ff2e74;   /* live glow colour — JS keeps it in sync with the centre card */
  --card-w:   260px;     /* card size — JS scales these with the viewport */
  --card-h:   330px;
  --ease:     cubic-bezier(.22,.61,.36,1);
}

/* ---- the section fills the viewport (one "screen section") ---- */
#section {
  position: relative; overflow: hidden;
  min-height: 100svh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: clamp(18px, 3.5vh, 46px);
  padding: clamp(28px, 6vh, 72px) 16px;
  background:
    radial-gradient(140% 100% at 50% -8%, var(--bg2) 0%, transparent 55%),
    radial-gradient(120% 90% at 50% 120%, #000 10%, transparent 60%),
    var(--bg);
  color: var(--text);
  font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* coloured halo that bleeds from behind the centre card (hue tracks the active card) */
.halo {
  position: absolute; top: 46%; left: 50%; z-index: 0;
  width: min(70vw, 640px); aspect-ratio: 1; transform: translate(-50%, -50%);
  background: radial-gradient(closest-side, var(--halo), transparent 72%);
  opacity: .32; filter: blur(30px); pointer-events: none;
  transition: background .5s var(--ease);
}

/* small glasses mark above the fan */
.mark { position: relative; z-index: 2; color: var(--text); display: grid; place-items: center; }
.mark svg { width: 46px; height: auto; display: block; }

/* ---- the coverflow stage ---- */
.stage {
  position: relative; z-index: 1;
  width: 100%; height: calc(var(--card-h) + 90px);
  display: grid; place-items: center;
  perspective: var(--persp, 1600px); perspective-origin: 50% 44%;
  cursor: grab; touch-action: pan-y; user-select: none;
}
.stage.-drag { cursor: grabbing; }

.deck { position: relative; width: 0; height: 0; transform-style: preserve-3d; }

.card {
  position: absolute; width: var(--card-w); height: var(--card-h);
  left: calc(var(--card-w) / -2); top: calc(var(--card-h) / -2);
  margin: 0; padding: 0; border: 0; background: none; cursor: pointer;
  transform-style: preserve-3d; will-change: transform, opacity;
  -webkit-tap-highlight-color: transparent;
}
.card__inner {
  position: absolute; inset: 0; border-radius: 22px; overflow: hidden;
  background: #0a0e18;
  box-shadow: 0 30px 60px -22px rgba(0,0,0,.85), 0 6px 20px -10px rgba(0,0,0,.7);
}
/* neon-gradient portrait placeholder (an <img>, if given, sits on top) */
.card__media {
  position: absolute; inset: 0;
  background:
    radial-gradient(115% 78% at 50% 122%, rgba(0,0,0,.82), transparent 52%),
    radial-gradient(58% 66% at 61% 54%, rgba(0,0,0,.55), transparent 60%),
    radial-gradient(92% 62% at 46% 6%,  color-mix(in srgb, var(--c1) 78%, #fff 22%), transparent 66%),
    linear-gradient(158deg, var(--c1), var(--c2));
}
.card__media img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
/* glossy edge + inner ring */
.card__inner::after {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 0 1px rgba(255,255,255,.06);
}
.card:focus-visible { outline: none; }
.card:focus-visible .card__inner { box-shadow: 0 30px 60px -22px rgba(0,0,0,.85), 0 0 0 3px var(--halo); }

/* ---- headline + call to action ---- */
.caption {
  position: relative; z-index: 2; margin: 0; text-align: center;
  font-weight: 300; letter-spacing: -.005em; line-height: 1.05;
  font-size: clamp(28px, 5.4vw, 54px);
}
.cta {
  position: relative; z-index: 2;
  display: inline-flex; align-items: center; gap: 14px;
  padding: 9px 9px 9px 26px; border: 0; border-radius: 999px; cursor: pointer;
  background: var(--text); color: #08090d; text-decoration: none;
  font-size: 15px; font-weight: 600; letter-spacing: .01em;
  transition: transform .2s var(--ease), box-shadow .2s var(--ease);
  box-shadow: 0 12px 30px -12px rgba(0,0,0,.7);
}
.cta:hover { transform: translateY(-2px); box-shadow: 0 18px 40px -14px rgba(0,0,0,.8); }
.cta:active { transform: translateY(0); }
.cta:focus-visible { outline: 2px solid var(--halo); outline-offset: 4px; }
.cta__dot { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 999px;
  background: #08090d; color: #fff; }
.cta__dot svg { width: 15px; height: 15px; }

.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

@media (prefers-reduced-motion: reduce) {
  .halo { transition: none; }
}
```

## Fixed parameters (bake these in)

Bake every value below directly into the code as fixed constants — do not read them from any
external source. These are the exact defaults for this section.

**Copy**

- Headline (`#caption` text): `Eyewear That Stands Out`
- CTA label (`#ctaLabel` text): `Enter Store`
- CTA href: `#`

**Palette** (also set as the CSS custom properties above)

- `bg`: `#05070c`
- `bg2`: `#0a1020`
- `text`: `#f4f6fb`

**Fan geometry**

- `cardW`: `260`  (base card width in px)
- `cardH`: `330`  (base card height in px)
- `gap`: `164`    (horizontal spacing between adjacent cards in px)
- `rotate`: `38`  (per-step Y-tilt in degrees)
- `depth`: `150`  (per-step Z push-back in px)
- `drop`: `24`    (per-step vertical drop of side cards in px)
- `shrink`: `0.14` (per-step scale reduction)
- `fade`: `0.26`  (per-step opacity fall-off)
- `dim`: `0.2`    (per-step brightness fall-off)
- `visible`: `3`  (cards shown to each side of centre)
- `persp`: `1680` (base perspective in px)

**Motion**

- `autoplayMs`: `3200`   (autoplay advance interval in ms; > 0 means autoplay on)
- `ease`: `0.14`         (glide easing factor per frame toward the target)
- `sensitivity`: `0.0072` (drag distance → index conversion)
- `start`: `2`          (initial centred card index)

**Cards** — 7 items, in order. Each has a display `name`, an image URL (see **Assets**), a
`c1`/`c2` gradient fallback, and a `glow` hue used for the halo when that card is centred:

| # | name | image file | c1 | c2 | glow |
|---|------|-----------|----|----|------|
| 0 | Driftwood | `driftwood-blue.webp` | `#3f6bab` | `#10131f` | `#4a86d8` |
| 1 | Dew | `dew-grass.webp` | `#4ea23a` | `#0d2a12` | `#5fce46` |
| 2 | Rain | `rain-round.webp` | `#6f86a8` | `#141a24` | `#8aa6cf` |
| 3 | Sepia | `reading-room.webp` | `#c6924e` | `#2c1d10` | `#e0ab63` |
| 4 | Carbon | `carbon-silver.webp` | `#c8a988` | `#14110d` | `#e2c39a` |
| 5 | Lens | `lens-macro.webp` | `#5a7ba8` | `#0b0f16` | `#6f93c4` |
| 6 | Clear | `desk-clear.webp` | `#7fae8f` | `#141a17` | `#9fd0ad` |

As a frozen constant block:

```js
const CARDS = [
  { name: 'Driftwood', img: `${ASSET_BASE_URL}/driftwood-blue.webp`, c1: '#3f6bab', c2: '#10131f', glow: '#4a86d8' },
  { name: 'Dew',       img: `${ASSET_BASE_URL}/dew-grass.webp`,      c1: '#4ea23a', c2: '#0d2a12', glow: '#5fce46' },
  { name: 'Rain',      img: `${ASSET_BASE_URL}/rain-round.webp`,     c1: '#6f86a8', c2: '#141a24', glow: '#8aa6cf' },
  { name: 'Sepia',     img: `${ASSET_BASE_URL}/reading-room.webp`,   c1: '#c6924e', c2: '#2c1d10', glow: '#e0ab63' },
  { name: 'Carbon',    img: `${ASSET_BASE_URL}/carbon-silver.webp`,  c1: '#c8a988', c2: '#14110d', glow: '#e2c39a' },
  { name: 'Lens',      img: `${ASSET_BASE_URL}/lens-macro.webp`,     c1: '#5a7ba8', c2: '#0b0f16', glow: '#6f93c4' },
  { name: 'Clear',     img: `${ASSET_BASE_URL}/desk-clear.webp`,     c1: '#7fae8f', c2: '#141a17', glow: '#9fd0ad' },
]
const N = CARDS.length  // 7
```

## Behaviour & interaction

All of the following runs in one small `<script type="module">`. Cache these constants and DOM
refs up front:

```js
const HEADING = 'Eyewear That Stands Out'
const CTA     = { label: 'Enter Store', href: '#' }
const GEO = { gap: 164, rotate: 38, depth: 150, drop: 24, shrink: 0.14, fade: 0.26, dim: 0.2, visible: 3 }
const CARD_W = 260, CARD_H = 330, PERSP = 1680
const AUTOPLAY_MS = 3200, EASE = 0.14, SENSITIVITY = 0.0072, START = 2

const section = document.getElementById('section')
const stage   = document.getElementById('stage')
const deck    = document.getElementById('deck')
const halo    = section.querySelector('.halo')
const live    = document.getElementById('live')
const reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches

document.getElementById('caption').textContent = HEADING
document.getElementById('ctaLabel').textContent = CTA.label
document.getElementById('cta').setAttribute('href', CTA.href)
```

**Build the deck.** For each card, create a `<button type="button" class="card">`, set its
`aria-label` to `` `${cd.name} — eyewear ${i + 1} of ${N}` ``, set `--c1`/`--c2`, fill it with the
`card__inner`/`card__media`/`img` markup shown above, append it to the deck, and wire a click
handler that calls `go(i)` **only if the pointer did not drag** (guard with the `moved` flag).

```js
const cards = CARDS.map((cd, i) => {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = 'card'
  el.setAttribute('aria-label', `${cd.name} — eyewear ${i + 1} of ${N}`)
  el.style.setProperty('--c1', cd.c1)
  el.style.setProperty('--c2', cd.c2)
  el.innerHTML = `<span class="card__inner"><span class="card__media">${
    cd.img ? `<img src="${cd.img}" alt="${cd.name} eyewear" draggable="false" loading="lazy">` : ''
  }</span></span>`
  el.addEventListener('click', () => { if (!moved) go(i) })
  deck.appendChild(el)
  return el
})
```

**Responsive sizing.** A `layout()` function reads `innerWidth`, computes a scale factor
`f = Math.max(0.56, Math.min(1, vw / 1180))`, and writes `--card-w = round(CARD_W*f)px`,
`--card-h = round(CARD_H*f)px`, `--persp = max(1050, PERSP*f)px`. It stores `f` in a module-scope
`scale` variable used by the transforms. Call `layout()` once on start and on every `resize`
(followed by a `frame()` tick). Default `scale = 1`.

```js
let scale = 1
function layout() {
  const vw = innerWidth
  const f  = Math.max(0.56, Math.min(1, vw / 1180))
  section.style.setProperty('--card-w', Math.round(CARD_W * f) + 'px')
  section.style.setProperty('--card-h', Math.round(CARD_H * f) + 'px')
  section.style.setProperty('--persp', Math.max(1050, PERSP * f) + 'px')
  scale = f
}
window.addEventListener('resize', () => { layout(); frame() })
layout()
```

**Coverflow state.** Two module variables drive everything: `pos` (a continuous, fractional
index — the live position, moves smoothly / follows the drag) and `target` (the whole index we
ease toward). Both start at `START` (2). A `wrap(o)` helper returns the shortest signed offset of
a card from the current position around the ring:

```js
let pos    = START
let target = START
const wrap = o => { o = ((o % N) + N) % N; return o > N / 2 ? o - N : o }
```

**Painting the fan.** `paint()` positions every card each frame. For card `i`, compute the wrapped
offset `o = wrap(i - pos)` and `ao = Math.abs(o)`. If `ao > visible + 0.5`, hide the card
(`opacity: 0`, `pointer-events: none`) and skip it. Otherwise apply:

- scale `sc = Math.max(0.4, 1 - ao * shrink)`
- transform:
  `translateX(o*gap*scale px) translateY(ao*drop*scale px) translateZ(-ao*depth*scale px) rotateY(-o*rotate deg) scale(sc)`
- opacity `Math.max(0, 1 - ao * fade)`
- filter `brightness(Math.max(0.3, 1 - ao*dim)) saturate(1 + (1 - Math.min(1, ao)) * 0.25)`
- z-index `Math.round(100 - ao * 10)`, and re-enable `pointer-events: auto`

Then determine the active card `active = ((Math.round(pos) % N) + N) % N` and set both
`halo.style` and `section.style` `--halo` to `CARDS[active].glow`, so the halo hue tracks the
centre card.

```js
function paint() {
  const { gap, rotate, depth, drop, shrink, fade, dim, visible } = GEO
  for (let i = 0; i < N; i++) {
    const o  = wrap(i - pos)
    const ao = Math.abs(o)
    const el = cards[i]
    if (ao > visible + 0.5) { el.style.opacity = '0'; el.style.pointerEvents = 'none'; continue }
    const sc = Math.max(0.4, 1 - ao * shrink)
    el.style.transform =
      `translateX(${o * gap * scale}px) translateY(${ao * drop * scale}px) ` +
      `translateZ(${-ao * depth * scale}px) rotateY(${-o * rotate}deg) scale(${sc})`
    el.style.opacity = String(Math.max(0, 1 - ao * fade))
    el.style.filter  = `brightness(${Math.max(0.3, 1 - ao * dim)}) saturate(${1 + (1 - Math.min(1, ao)) * 0.25})`
    el.style.zIndex  = String(Math.round(100 - ao * 10))
    el.style.pointerEvents = 'auto'
  }
  const active = ((Math.round(pos) % N) + N) % N
  halo.style.setProperty('--halo', CARDS[active].glow)
  section.style.setProperty('--halo', CARDS[active].glow)
}
```

**Animation loop.** A `requestAnimationFrame` loop `frame()` glides `pos` toward `target` unless
the user is dragging: when not dragging, if reduced-motion is on, snap `pos = target`; otherwise
`pos += (target - pos) * EASE` and snap when within `0.001`. Then `paint()`. Track the active card
in `lastActive`; when it changes, announce it into the live region as
`` `${CARDS[i].name}, ${i + 1} of ${N}` ``.

```js
let raf = null, lastActive = -1
function frame() {
  if (!dragging) {
    if (reduce) pos = target
    else {
      pos += (target - pos) * EASE
      if (Math.abs(target - pos) < 0.001) pos = target
    }
  }
  paint()
  const active = ((Math.round(pos) % N) + N) % N
  if (active !== lastActive) { lastActive = active; announce(active) }
  raf = requestAnimationFrame(frame)
}
function announce(i) { live.textContent = `${CARDS[i].name}, ${i + 1} of ${N}` }
```

**Navigation.** `go(i)` moves `target` to card `i` by the shortest signed direction so the ring
stays seamless (`target = Math.round(target) + wrap(i - Math.round(target))`). `next()` does
`target += 1`; `prev()` does `target -= 1`. Because `target` is an unbounded integer that keeps
growing/shrinking while `pos` follows it and `wrap()` folds everything back onto the N-card ring,
the fan **wraps forever** in either direction.

```js
function go(i) {
  const cur = Math.round(target)
  target = cur + wrap(i - cur)
}
const next = () => { target += 1 }
const prev = () => { target -= 1 }
```

**Drag / swipe.** Pointer state: `dragging`, `moved`, `lastX`, `startX`, `vel`. On `pointerdown`,
set `dragging = true`, `moved = false`, capture `lastX = startX = e.clientX`, `vel = 0`, add the
`-drag` class, and `setPointerCapture`. On `pointermove` while dragging, take `dx = e.clientX -
lastX`, update `lastX`; if the total distance from `startX` exceeds 5px set `moved = true` (this is
what suppresses the click). Convert to index delta `d = -dx * SENSITIVITY`, apply `pos += d`, store
`vel = d`, and `paint()` immediately. On `pointerup` / `pointercancel`, `release()`: clear
`dragging`, remove `-drag`, project momentum and snap — `target = Math.round(pos + vel * 8)` — then
`vel = 0`.

```js
let dragging = false, moved = false, lastX = 0, startX = 0, vel = 0
stage.addEventListener('pointerdown', e => {
  dragging = true; moved = false; lastX = startX = e.clientX; vel = 0
  stage.classList.add('-drag'); stage.setPointerCapture(e.pointerId)
})
stage.addEventListener('pointermove', e => {
  if (!dragging) return
  const dx = e.clientX - lastX; lastX = e.clientX
  if (Math.abs(e.clientX - startX) > 5) moved = true
  const d = -dx * SENSITIVITY
  pos += d; vel = d
  paint()
})
function release() {
  if (!dragging) return
  dragging = false; stage.classList.remove('-drag')
  target = Math.round(pos + vel * 8)
  vel = 0
}
stage.addEventListener('pointerup', release)
stage.addEventListener('pointercancel', release)
```

**Keyboard.** On the section, `keydown`: ArrowRight → `next()`, ArrowLeft → `prev()`, Home →
`go(0)`, End → `go(N - 1)`, each with `preventDefault()`. (Buttons are natively focusable, giving
tab access and the focus ring.)

```js
section.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { next(); e.preventDefault() }
  else if (e.key === 'ArrowLeft') { prev(); e.preventDefault() }
  else if (e.key === 'Home') { go(0); e.preventDefault() }
  else if (e.key === 'End') { go(N - 1); e.preventDefault() }
})
```

**Autoplay.** Every `AUTOPLAY_MS` (3200ms) call `next()` — but only when autoplay should be
active: `AUTOPLAY_MS > 0 && !reduce && !hovering && !dragging && !document.hidden`. A
`syncAutoplay()` clears the current interval and, if active, sets a fresh one. Re-run
`syncAutoplay()` on stage `mouseenter` (set `hovering = true`) / `mouseleave` (`hovering = false`),
on `document` `visibilitychange`, and on stage `pointerdown` / `pointerup` / `pointercancel` — so
autoplay pauses on hover, during a drag, and on a hidden tab, and resumes afterward.

```js
let hovering = false
let autoTimer = null
const autoActive = () => AUTOPLAY_MS > 0 && !reduce && !hovering && !dragging && !document.hidden
function syncAutoplay() {
  clearInterval(autoTimer); autoTimer = null
  if (autoActive()) autoTimer = setInterval(next, AUTOPLAY_MS)
}
stage.addEventListener('mouseenter', () => { hovering = true; syncAutoplay() })
stage.addEventListener('mouseleave', () => { hovering = false; syncAutoplay() })
document.addEventListener('visibilitychange', syncAutoplay)
stage.addEventListener('pointerdown', syncAutoplay)
stage.addEventListener('pointerup', syncAutoplay)
stage.addEventListener('pointercancel', syncAutoplay)
```

**Kick-off.**

```js
go(START); pos = START; frame(); syncAutoplay()
```

## Responsive

- The section is fluid: `min-height: 100svh`, `gap` and `padding` use `clamp()`, and the headline
  is `font-size: clamp(28px, 5.4vw, 54px)`.
- Card size and perspective scale with viewport width via the `layout()` factor
  `f = clamp(0.56, vw/1180, 1)` — so cards shrink smoothly down to 56% on narrow screens and never
  grow past their base size on wide ones. `--persp` is floored at 1050px.
- The stage height is `calc(var(--card-h) + 90px)`, tracking the (scaled) card height.
- `touch-action: pan-y` on the stage lets vertical page scrolling through while horizontal drags
  spin the fan.
- No hard breakpoint layout change is needed — everything reflows continuously; the design holds
  down to roughly 320px wide.
- Respect `prefers-reduced-motion`: the halo colour transition is disabled, and the coverflow
  snaps directly to the target position each frame (no glide easing).

## Assets

Load the seven card photos from these URLs (keep the exact filenames). Point each card's `img` at
the matching URL. Set a single constant and build the URLs from it:

```js
const ASSET_BASE_URL = 'https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25'
```

- `${ASSET_BASE_URL}/driftwood-blue.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/driftwood-blue.webp
- `${ASSET_BASE_URL}/dew-grass.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/dew-grass.webp
- `${ASSET_BASE_URL}/rain-round.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/rain-round.webp
- `${ASSET_BASE_URL}/reading-room.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/reading-room.webp
- `${ASSET_BASE_URL}/carbon-silver.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/carbon-silver.webp
- `${ASSET_BASE_URL}/lens-macro.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/lens-macro.webp
- `${ASSET_BASE_URL}/desk-clear.webp` — https://api.getlayers.ai/storage/v1/object/public/public/assets/slider-spectra-6a98d33b25/desk-clear.webp

Each image sits on top of its per-card `c1`→`c2` `linear-gradient(158deg, …)` fallback (plus the
layered radial overlays defined in `.card__media`), so if an image fails to load the neon gradient
still fills the card. No fonts or other assets are required — the section uses the system font
stack. (If you add a Google Fonts `<link>`, keep it as-is.)