# 00 — MASTER BUILD PROMPT (orchestration)

You are building the FDE portfolio for Niranjan VSKS. This file orchestrates the build. Execute phases in order. After each phase, run the matching checklist in `10_VERIFY_AND_SHIP.md`, then continue. Stop at every `[REVIEW GATE]`.

## Stack (locked)
Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Framer Motion · Three.js + React Three Fiber (R3F) + drei · react-force-graph-3d · Vercel deploy. Content read from `portfolio-assets/content/`. Chatbot backend = Next.js route handlers + Groq (Llama 3.1 8B) + a pgvector store.

## How to run this build
- Auto-edit on; `--dangerously-skip-permissions` is acceptable for unattended phases, BUT you must still halt at `[REVIEW GATE]`s.
- Use `/goal` for mechanical "build until green" loops, e.g.: `/goal "npm run build" exits 0, npm run lint is clean, and every route referenced in content/data resolves with no 404, or stop after 25 turns`. Do NOT use `/goal` for visual or tonal quality; those are human gates.
- Work phase by phase. Keep a running `bullseye/STATE.md` you create and update: what's done, what's pending, open questions. This survives context resets.
- Skills: prefer `frontend-design` (all UI), `3d-web-experience` (all 3D phases), `performance-optimizer` (perf passes). Spec overrides any skill convention.

## Reference assets already provided (use them; do not regenerate)
- **Content is pre-written.** `portfolio-assets/content/` contains real, accurate copy for hero, about, skills, contact, all 4 projects, 3 experience entries, and the 2 interactive system-design write-ups. Render from these. Do NOT invent or rewrite copy. The only `TODO(niranjan)` gaps are in `interview/` (his voice) and a few optional items.
- **Hero skeleton provided.** `bullseye/reference/hero-scene.reference.tsx` is the starting architecture for the unified canvas. Build the real hero by porting the Vanta field + interactive-card mechanic into this structure. Do not invent a different particle architecture; the burst must sample the same particle field.
- **Mind map provided** (`05`): data + component + page already written. Integrate, do not rebuild.

## Realistic expectation
You will get the scaffold and mechanical work substantially correct autonomously. The hero 3D, the card-burst blend, the system-design diagrams, and the chatbot tone need human eyes. Expect 2-3 iteration passes. Do not declare "done" on visual phases; surface them at the gate.

## Phases

### Phase A — Scaffold & design system
- Init Next.js 14 + TS + Tailwind + shadcn. Wire fonts (JetBrains Mono, Geist) per `01`.
- Implement the design tokens from `01` as CSS variables + Tailwind theme. No light mode.
- Build the content loader that reads `portfolio-assets/content/*.md` (frontmatter + markdown) and the route skeleton from `02`.
- Verify: build passes, tokens resolve, content loader returns parsed MD.

### Phase B — Content model
- Create the `portfolio-assets/content/` tree per `07` with all section files. Populate from the resume/context where known; leave `TODO(niranjan)` where his first-person voice is required (especially `interview/`).
- Wire every page to render from these MD files.

### Phase C — Template intake
- For each folder in `template_repos/` (see `04`): read the actual `index.html` / `.js` files, identify the reusable core, and port it into a React/R3F component under `src/components/3d/` or `src/components/`. Apply every per-template tweak in `04` (recolor, strip demo chrome, remove light-mode, fix the rainbow-HSL glow, etc.).
- Do NOT instantiate raw Three.js scenes per-component. See `02` unified-canvas rule.

### Phase D — Unified hero (Cinematic mode)  `[REVIEW GATE]`
- Build the single shared R3F canvas per `03`: Vanta-style particle field + 4 tilt cards + dissolve-burst + ambient astronomical elements, ALL sharing one scene and one particle system.
- Terminal typewriter intro + FDE entry labels + `ask_niranjan` entry.
- **GATE:** surface the running hero for review (look, feel, burst blend, performance). Do not proceed until approved.

### Phase E — Map mode
- Integrate the provided react-force-graph-3d component (`05`). Port the Omma glow/bloom (UnrealBloomPass + emissive nodes). Wire routing, hover, collapse/expand, mobile fallback, pause/resume. Enforce the liability firewall in the data and copy.

### Phase F — Terminal mode
- Build the terminal-style navigation mode per `03` (command list, keyboard nav, routes to all sections).

### Phase G — Project pages
- Build the 4 project pages from `06` + content MDs. Saarthi gets the phone mockup (`04`); Loop Copilot gets the Macbook scroll (`04`). Each links to `/system-design`.

### Phase H — System Design page  `[REVIEW GATE]`
- Build `/system-design` per `06`. Loop Copilot FIRST (fully interactive), then Coforge reference architecture (interactive). Saarthi + Rebalancer static (Mermaid). "How I would build" framing, liability firewall in all copy.
- **GATE:** surface the diagrams for clarity/accuracy review.

### Phase I — Content/RAG ingestion + Chatbot  `[REVIEW GATE]`
- Build `ask_niranjan` per `08`: embed `portfolio-assets/content/` into the pgvector store, RAG retrieval, Groq/Llama answer with the interview-simulation persona, static-photo UI.
- API keys: read from env; if absent, scaffold and leave clear `TODO(niranjan): set GROQ_API_KEY` notes. Do not hardcode secrets.
- **GATE:** surface a few sample conversations for tone review (must sound like Niranjan, not a generic bot).

### Phase J — Contact, resume download, freelance
- Build Contact per `09`: globe (tweaked), contact info, and the prominent **Download Résumé (PDF)** CTA (also in nav) linking to `public/NIRANJAN_VSKS_Resume.pdf`.
- Optional noindex `/work-with-me` page per `09`. Main profile stays FDE-pure.

### Phase K — Polish & performance
- Run `performance-optimizer`: lazy-load all 3D, code-split routes, optimize images (WebP), bundle audit, fix re-renders/memory leaks. Hit the budget in `.claude/rules/3d-performance.md`.
- Accessibility pass: keyboard nav, reduced-motion honored everywhere, alt text, focus states.

### Phase L — Verify & ship
- Run the full `10_VERIFY_AND_SHIP.md` checklist. Deploy to Vercel. Confirm all routes, the chatbot, and the resume download work in production.

## NOT in V1 (do not build; park for later)
Voice/avatar layer for the chatbot, Crystal Morph effect, the recruiter "what I'd build for you" report. The chatbot is static-photo + text only.
