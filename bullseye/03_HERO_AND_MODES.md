# 03 — HERO & MODES

Three viewing modes. Cinematic is the landing. A persistent mode switcher (terminal-styled) lets visitors jump between Cinematic / Map / Terminal.

## CINEMATIC MODE (landing, `/`)

One shared R3F canvas (see unified-canvas rule in `02`). Composition, back to front:

### 1. Particle field (background)
- Source: `template_repos/remix-vanta-digital-atelier`. Port its particle rendering into the shared canvas. This REPLACES the older low-fidelity stardust; use Vanta's clarity.
- Color: bluish, mapped to `--cyan`/`--blue-*` with a faint `--blood-red` atmospheric falloff at the edges for depth. Sparse green motes.
- This single particle system is also the source for the card-dissolve burst.

### 2. Ambient astronomical elements (NEW — sparse and slow)
Inside the same canvas, behind the cards, add living cosmos detail. Discipline rules are mandatory:
- 1 distant **planet** slowly orbiting/rotating (low-poly, subtle, off to one side).
- Occasional **asteroid** or **satellite/spaceship** drifting across the far field, roughly every 30-60s, slow, small, low-poly.
- They must NEVER occlude the cards or text, never pull focus, never spike draw calls.
- Lazy-loaded; frozen under `prefers-reduced-motion`; disabled on mobile.
- Keep total added geometry tiny (these are atmosphere, not centerpieces).

### 3. Project cards (4)
- Source mechanic: `template_repos/remix-interactive-3d-card-with`. Port its mouse-tilt + flip + edge-glow into 4 card meshes in the shared canvas. **Drop the orbit concept.** Cards sit in a calm arc/row and tilt toward the cursor.
- Each card: **frosted translucent front** with the project's image on an inner plane behind it; the image sharpens/brightens on hover (the "image revealed inside the glass" effect). Front face shows project name + one-line tagline; back (on flip) shows key metric + stack.
- Recolor to palette. **Kill the template's rainbow HSL glow cycle**; constrain the glow to a green↔cyan pulse.
- The 4 cards = Loop Copilot, Saarthi, Autonomous Portfolio Rebalancer, AI Quality Engineering Platform. Card → routes to `/projects/[slug]`.

### 4. Card-dissolve burst (route transition)
- On card click: the card dissolves into particles drawn from the SAME background field, then routes to the project page. It should look like the card scattering into the stars already behind it. ~800ms.

### 5. Terminal intro overlay
- Typewriter effect with blinking `_` cursor, JetBrains Mono, `--green`. Example beat (pull real copy from `content/hero.md`):
  ```
  > niranjan.vsks
  > role: Senior Agentic AI Engineer (Forward Deployed)
  > status: shipping agentic systems into enterprise environments
  > _
  ```
- Do not auto-skip; respect reduced-motion (render final state instantly).

### 6. Entry labels ("what brings you here?")
- FDE-corrected. Do NOT use the old "Product Management" label. Use audience-routing that stays FDE-pure, e.g.: `> agentic_ai_and_rag`, `> enterprise_delivery`, `> all_projects`. Each scrolls/routes to the relevant section.

### 7. `ask_niranjan` entry
- Persistent terminal-styled button (`> ask_niranjan`) opening the chatbot (see `08`).

`[REVIEW GATE]` after this mode is built.

## MAP MODE (`/map`)
See `05`. The mind map. Reachable from the mode switcher.

## TERMINAL MODE (`/terminal`)
- A literal terminal UI: a prompt, a list of commands (`projects`, `system-design`, `about`, `skills`, `contact`, `resume`, `ask`), keyboard navigation, and command output that routes or renders inline.
- Pure JetBrains Mono, `--green` on `--bg`. This is the fastest, most engineer-credible path through the site, and a strong signal in itself.
- Fully keyboard-accessible.
