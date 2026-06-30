# STATE.md — v2 Renovation build plan (Session 1: preparation)

_Last updated: 2026-06-29 (Session 1, prep only, Opus 4.8). No feature code was written this session._

**Authoritative spec:** `Portfolio_Renovation_PRD_FINAL.pdf` (the v2 Renovation PRD). It wins over the bullseye/ 00–10 specs on any conflict. This file is the build plan derived from it.

---

## 0. Resume protocol (read first every build session)
- Build runs **one phase per session**. At the end of each phase: commit, then update this file (mark phase done, note what's next). If a session runs out of tokens, only that one phase is lost.
- **Effort follows difficulty, not order.** Top effort on HARD phases. Never silently downgrade a HARD effect to a cheap fallback to save tokens; split and checkpoint instead. Any pre-authorized fallback (e.g. mind-map fade/zoom) must be logged here.
- **Hard rules every phase** (see memory: essence-preservation, liability-firewall, surgical-fixes): no internal-note leaks in rendered copy; no gutted effects; no fabrication (thin → honest "In development" stub); one heavy WebGL effect per page; sound muted by default; mobile fallback + reduced-motion + keyboard focus on every heavy component; real HTML text + meta/OG.
- Skills: `frontend-design` (all UI), `3d-web-experience` (R2/R4/R5/R6 — backgrounds, globe, brain, container scroll), `performance-optimizer` (R12 + measure after each HARD phase). Spec overrides skill conventions.

---

## 1. Asset & source inventory (verified 2026-06-29, facts not assumptions)

### Template source present (`template_repos/textura_templates/`)
| Folder | What's there | Build effort |
|---|---|---|
| `3d_card_photo/` | `3d_card_photo.js` (source) | port |
| `Layout_flipping_text/` | `.js` source | port (easy) |
| `Hover_button/` | html+css source (unassigned, keep for later) | n/a |
| `ascend/ascend/` | `index.html` source (Home hub LAYOUT reference) | reference |
| `helios_landing_page/` | master prompt only (hub layout reference) | reference |
| `brain/` | `brain.html` source | port |
| `neuron_landing_page/neural-monitor/` | FULL Next.js source (brain intro). Also contains `src/components/story/terminal.tsx` = the terminal-card look the PRD calls `terminal/`. | port (HARD) |
| `card_spotlight/` | `card_spotlight.js` + master prompt | port |
| `flow-wave/` | `flow-wave.html` source + master prompt | port |
| `infinite_moving_cards/` | `infinite_moving_cards.js` source | port (easy) |
| `encrypted_text.md` | spec/prompt | build from spec |

### Prompt-only (NO source code — must build from the master prompt; higher effort, treat HARD)
- `Container_Scroll/` → `container_scroll_master_prompt.md` only. **No source.** (PRD 6.5 is the Macbook-Scroll replacement; this is the one Niranjan cares most about — top effort.)
- `gooey_search/` → `gooey_search.md` only.
- `particle_sphere/` → `particle_sphere_purple_master_prompt` only. **(PRD §2 claimed "prompt + source" — incorrect; prompt only.)**
- `wave_galaxy_blue/` → `wave_galaxy_blue_m,aster_prompt.md` only. **(PRD §2 claimed "prompt + source" — incorrect; prompt only.)**

### Not in repo
- **Moving-border (Aceternity):** no folder. The component code is given inline in PRD 6.7, so buildable (port the Aceternity `ui/moving-border` + the demo). Not a blocker.
- **`fey_cards/`:** folder is EMPTY (PRD lists it as styling reference only — fine).
- **Realistic globe template:** not present anywhere. PRD 6.3 says Niranjan "will give a better 3D template with source code." **NOT YET PROVIDED → blocks Home globe.**
- `RENOVATION_DIRECTION_v2.md`: referenced by the PRD but not in the repo. Non-blocking (PRD absorbs it).

### Content present vs missing (`portfolio-assets/content/`)
- Projects are now per-folder: `content/projects/<name>/<name>.md`. Present: `loop-copilot`, `qe-platform`, `rebalancer`, `saarthi`. **Note:** PRD 6.11 writes the path as `portfolio-assets/projects/<name>/` but reality is `portfolio-assets/content/<...>`. See Question Q1.
- `experience/`: `coforge.md`, `hpe.md`, `mphasis.md`. `skills.md`, `about.md`, `contact.md`, `hero.md` present.
- `system-design/`: `loop-copilot.md`, `qe-platform.md`.
- `interview/*` (persona, faq, war-stories, decisions-and-tradeoffs): **ALL 0 bytes (empty).**
- `public/`: has `NiranjanVSKS_FDE.pdf`. **No photo, no project screenshots, no `sounds/sound.ogg`, no globe asset.**

---

## BUILD-START LOCKS (2026-06-29, on "go" — these override earlier notes)
1. **Path:** the single real path is `content/projects/<name>/<name>.md`. Update the loader + any PRD references to match; do NOT migrate files.
2. **Globe (R4):** build a realistic 3D globe FROM SCRATCH (textured earth sphere + atmosphere + starfield in black space). Do NOT wait for an external template; do NOT ship a wireframe or placeholder globe. Home centerpiece, top effort.
3. **AI Labs + Jarvis:** build the routes but keep them hidden from the top nav AND the Home hub cards until their content exists. No publicly reachable empty pages.
4. **Certifications + Education:** real clickable pages with full layout + reference cards, but clearly-marked empty content slots for Niranjan's blurbs. Do not invent descriptions.
- **New assets provided:** Saarthi wireframes at `content/projects/saarthi/Wireframes_Saarthi.pdf`. Photo (`public/`) + Loop Copilot screenshots (`content/projects/loop-copilot/`) incoming — use when present, else clean fallback + log, never a fake.
- **Accepted placeholders this run:** Saarthi/Rebalancer/HPE-RAG diagram images → clean built-in fallback diagram; Dashboard → clearly-marked placeholder numbers; chatbot → thin until `interview/*` filled. Everything visual must be real, not pixelated, not gutted.

## 2. BLOCKED ON NIRANJAN (cannot fill without you — never fabricated; assets above unblock their phase)
1. **Realistic globe:** NOT blocked — building from scratch in R4 per lock #2 (no template needed).
2. **Project screenshots** for the Container Scroll hero, into `content/projects/<name>/` (PRD 6.5/6.11). Until provided: framed static placeholder, no Container Scroll, no fabricated UI.
3. **`interview/*.md` content** (your first-person voice). Chatbot stays thin until filled (PRD 6.9 blocker). Do not fabricate persona.
4. **HPE Conversational RAG Chatbot** and **Global Census Chatbot (HPE)** project content (canonical table needs 2 new Work-Experience project pages). No content files exist → honest "In development" stubs until you supply them.
5. **Jarvis** content: do NOT create the page until `Jarvis.md` exists.
6. **Your photo** (`public/`) for the Home 3D photo card front face.
7. **Typing sound** `public/sounds/sound.ogg` for terminal-card / 3D-photo-card typewriter (PRD 6.4/6.1). Muted by default regardless.
8. **Static diagram images** for Saarthi, Rebalancer (Eraser/Excalidraw) and HPE RAG (semi-interactive) System Design (PRD 6.7). Until provided: clean built-in fallback diagram + logged.
9. **Per-node "used differently" bullets** (4–5 per diagram) for System Design tool nodes (PRD 6.7) where they aren't already in content — accuracy needs your input.
10. **Certifications / Education** dedicated-page content (brief description per cert + which projects map to each) (PRD 6.10).
11. **AI Labs** content (PRD 6.10 — scaffold shell now, content later).
12. **Dashboard** FDE-positioning metrics that aren't in the resume (PRD 6.8) — placeholders clearly marked until you give real numbers.

---

## 3. Questions / contradictions (RESOLVED 2026-06-29 unless noted)
- **Q1 — project content path. RESOLVED:** keep `content/projects/<name>/<name>.md` (Niranjan chose "keep"). Screenshots live in that same folder; R0 updates the loader for the folder structure. Do NOT migrate to `portfolio-assets/projects/`.
- **Q2 — globe. RESOLVED:** build Home now (R4) with a clean placeholder slot; wire the real globe as a small follow-up once Niranjan drops the template + source into the repo. R4 is NOT blocked.
- **Q3 — PRD §2 source error (informational).** `particle_sphere` and `wave_galaxy_blue` are prompt-only; build from master prompts (treated HARD). No veto needed.
- **Q4 — decisions ledger D1–D6. RESOLVED:** Niranjan approved all six defaults (semi-interactive = static+hover; AI Labs scaffold-now; no LLD; encrypted-text headings/captions only; chatbot Groq+Llama; thin→stub).
- **Q5 — HPE split (still pending asset).** Canonical table splits HPE into two Work-Experience project pages (Conversational RAG Chatbot + Global Census Chatbot), separate from the `experience/hpe.md` card. Niranjan to provide both content files; until then they ship as honest "In development" stubs.

---

## 4. v1 → v2 disposition (what existing code does in the renovation)
- **REMOVE:** `src/app/terminal/` + `TerminalNav` (PRD 6.6 kills terminal mode); the Home stardust-burst + 4 flip cards (PRD 6.1); v1 wireframe `GlobeScene` (PRD 6.3 replace).
- **REPLACE:** Home → Ascend hub; Contact globe → moves to Home, Contact gets Particle Sphere; nav → minimal utility + landing hub cards.
- **FIX/KEEP:** `MindMap3D` engine (keep, add brain intro + quality raise); System Design React-Flow approach (keep, restyle + Card Spotlight + moving-border chips + plane filters); chatbot Groq+pgvector plumbing (keep, fix layering + FAQ + rate limit + guardrails); project pages (keep, add Flow Wave + Container Scroll + Sticky Scroll + terminal cards); content loader (update for project folders).
- **CLEANUP (R0, critical):** strip all leaked internal notes from rendered copy. Known v1 leaks: `Footer.tsx` ("attribution pending"), `ProjectVisual` placeholder labels, `work-with-me` TODO line, and **`contact.md` body** which renders "Globe note:" + "TODO(niranjan)" lines straight to the page.

---

## 5. Phased build plan (one phase per session)

Effort: **HARD** = top effort (3D/animation/template port) · **MED** · **ROUTINE** = mechanical. Each phase is sized to finish in one session; HARD phases note a split point.

### R0 — Foundations & leak cleanup · ROUTINE · ✅ DONE (2026-06-29)
- Strip every internal-note leak from rendered copy (incl. `contact.md` body, Footer, ProjectVisual, work-with-me). Update content loader for `content/projects/<name>/<name>.md`. Remove terminal mode (route + nav). Confirm palette tokens incl. expansions (copper-blue, purple, flow-green, violet). Add global sound-toggle (muted default) + reduced-motion utilities. Meta/OG audit.
- Templates: none. **Acceptance:** #1 (no leaks), #9 (meta/OG), partial #10 (terminal gone).

### R1 — Nav + Gooey Search + Loader system · HARD
- Minimal top nav (Logo | Resume | GitHub | Search | Contact) + mobile collapse. Gooey search from `gooey_search.md` (Fuse.js fuzzy over sections/projects/keywords, suggestive phrases, route on match, no LLM). Route-level loader (0→100 in ~10% steps, blurred page behind, first-visit-only + cache, 8s hard-timeout reveal, reduced-motion static state, per-page terminal copy).
- Templates: `gooey_search` (prompt). **Acceptance:** #6 (loader/cache/timeout), #10 (gooey fuzzy). Foundational for all heavy pages.

### R2 — Background effects library · HARD · ✅ DONE (2026-06-30)
- Reusable lazy WebGL backgrounds with one-per-page wrapper, pause-off-screen, quality tiers, mobile fallback, reduced-motion: **R2a** Flow Wave Green (has source). **R2b** Wave Galaxy blue + Particle Sphere purple (prompt-only → build from prompts).
- Templates: `flow-wave` (src), `wave_galaxy_blue` (prompt), `particle_sphere` (prompt). **Acceptance:** #2 (essence), #6 (one-effect), #7 (mobile/reduced-motion).

### R3 — Shared card systems · HARD · ✅ DONE (2026-06-30)
- **R3a (HARD):** Terminal flip card (macOS chrome; functional close/min/max; flip via drag/arrows + swipe; card index e.g. HPE 1/3; encrypted-text heading; green resume keywords; separate normal vs maximized markdown). Used by Experience + Projects.
- **R3b (HARD):** 3d_card_photo (CSS-3D flip only — NOT a 2nd WebGL canvas; back = terminal face with typewriter + muted sound).
- **R3c (MED):** Card Spotlight (shine/expand), Moving-border button (PRD inline code + hover state), Infinite Moving Cards (src), Layout Text Flip (src), Encrypted Text.
- **Acceptance:** #2, #7, #8 (sound muted). These are shared building blocks for R4/R6/R7/R8/R9.

### R4 — Home rebuild (Ascend hub) · HARD · ✅ DONE (2026-06-30)
- Black space + starfield + **realistic globe built FROM SCRATCH** (textured earth sphere + atmosphere + starfield; top effort, no wireframe/placeholder); left 3d_card_photo (R3b); Layout Text Flip heading; Encrypted Text caption; portal cards (Projects → split Work-Experience / Independent, Experience, Mind Map, System Design, About, Contact — **AI Labs hidden until content**) with terminal-command hover + routing; static dashboard-preview chart. Remove stardust + old cards. Globe is the ONLY WebGL on Home.
- Templates: `ascend` (layout ref), globe (scratch build), 3d_card_photo, Layout_flipping_text, encrypted_text. **Acceptance:** #1, #2, #3 (cards route), #6 (one WebGL).

### R5 — Mind Map renovation · HARD · ✅ DONE (2026-06-30, pre-authorized fade/zoom hand-off used)
- Rename Map→Mind Map. Brain intro from `neuron_landing_page` (blue particle brain + catchy one-liner; auto-expand 5s OR click within 4s; scatter→fade/zoom hand-off into the force graph on the blue bg). Cut all neuroscience text/labels. Raise graph quality (distinct icons, category colors, every node clickable + routes). **Ensure a node exists for EVERY skill name** (skills→mindmap routing, PRD 6.10). Copper-sulphate-blue bg.
- **Pre-authorized fallback:** true particle→node morph is hard; clean fade/zoom hand-off is allowed on desktop+mobile (NOT counted as gutting) — log the chosen path here when built.
- Templates: `neuron_landing_page`, `brain`. **Acceptance:** #2, #3, #7.

### R6 — Project pages renovation · HARD · ✅ DONE (2026-06-30)
- Flow Wave bg. Container Scroll hero **built from `container_scroll_master_prompt.md` (no source)** with real screenshots (**BLOCKED** → framed placeholder fallback, no fake UI). Sticky Scroll Reveal (problem→approach→outcome). Project-page terminal flip card (flip REQUIRED here). Optional infinite-cards skills marquee. Live links. Multiple routes in.
- Templates: `Container_Scroll` (prompt), `flow-wave`, terminal card, `infinite_moving_cards`. **Acceptance:** #2, #3, #5 (stubs for screenshot-less projects logged).

### R7 — System Design renovation · HARD
- Interactive (Loop Copilot, QE ref): custom React Flow, distinct correct icon per node type; node click → Card Spotlight (≤4 one-line "used differently" bullets). Static (Saarthi, Rebalancer): Eraser/Excalidraw image (**BLOCKED** → clean fallback). Semi-interactive (HPE RAG): static image + hover tooltips (**BLOCKED** image). Plane filters (data/control/observability + optional deployment/schema/orchestration). Moving-border tag chips → route to mind-map node + zoom. **Firewall frame on every Coforge/QE diagram.**
- Templates: `card_spotlight`, moving-border. **Acceptance:** #2, #3, #4 (firewall holds).

### R8 — Dashboard (new) · MED · ✅ DONE (2026-06-30)
- Card Spotlight metric cards on Flow Wave bg. Real resume numbers where they exist (projects, clouds=AWS/Azure/GCP, QE 85–90% / hallucination 15%→<5% / 17 teams, RAG metrics); clearly-marked placeholders elsewhere (BLOCKED). Firewall (no client-tied identifying figures).
- Templates: `card_spotlight`, `flow-wave`. **Acceptance:** #4, #5.

### R9 — About + Skills + Certifications + Education + AI Labs · MED
- About: Wave Galaxy + starfield bg; Experience via terminal flip cards (interactive). Skills: Infinite Moving Cards, each skill card → its mind-map node (depends on R5 skill nodes). Certifications/Education: real clickable dedicated pages with full layout + reference cards to projects, **clearly-marked empty content slots** for Niranjan's blurbs (do not invent descriptions). AI Labs + Jarvis: build routes but **hidden from top nav AND Home hub** until content exists (no publicly reachable empty pages).
- Templates: `wave_galaxy_blue`, `infinite_moving_cards`, terminal card. **Acceptance:** #1, #3 (multi-route), #5.

### R10 — Chatbot renovation · MED · ✅ DONE (2026-06-30)
- Fix layering/z-index isolation (own stacking context, no mode overlap). Wave Galaxy bg. FAQ ready-buttons feed the assistant + cache FAQ answers (same/similar each time). Rate limiter. Strict guardrails (on-topic, Niranjan voice, refuse unknown, no fabrication). No session history. Keep Groq+pgvector, model-agnostic config.
- **BLOCKED:** thin until `interview/*` filled (logged). **Acceptance:** #2, #4 (no fabrication), #7.

### R11 — Contact renovation · MED · ✅ DONE (2026-06-30)
- Particle Sphere (purple) bg. Keep contact info + résumé CTA. Remove globe (now on Home). Ensure stripped contact.md (R0) renders clean.
- Templates: `particle_sphere`. **Acceptance:** #1, #6, #7.

### R12 — Polish · perf · a11y · SEO · verify · ROUTINE→MED
- `performance-optimizer`: Lighthouse ≥90, one-heavy-effect audit, lazy/pause-off-screen, image WebP. Mobile fallbacks for every heavy component. Reduced-motion + keyboard focus everywhere. Sound toggle present, no autoplay. Meta/OG + link previews. Full acceptance sweep vs PRD §7. (Deploy to Vercel is Niranjan's.)
- **Acceptance:** all 10 criteria.

---

## 6. Per-phase acceptance source
All acceptance numbers above map to PRD §7 (Definition of Done): 1 no note leaks · 2 essence/resolution preserved · 3 everything routes (multi-route) · 4 firewall holds · 5 no fabrication, stubs logged · 6 one WebGL/page + loader + cache + timeout · 7 mobile + reduced-motion + keyboard · 8 sound muted + toggle, no autoplay · 9 real HTML text + meta/OG · 10 terminal removed + gooey fuzzy search.

## 7. Session log
- **2026-06-30 (R8 + R10 + R11 — DONE):** R11 Contact: Particle Sphere bg, removed the rejected wireframe globe (`Globe`/`GlobeScene` deleted; real globe is on Home), contact info + résumé CTA + availability. R10 Chatbot: dedicated `/chat` page (own isolated stacking context, Wave Galaxy bg), `ChatSurface` with FAQ ready-buttons that feed the assistant, 429 handling, no session history; added an in-memory IP rate limiter (15/min) to `/api/ask`. Still thin until `interview/*` filled (logged, not fabricated). R8 Dashboard: `/dashboard` with Card Spotlight metric cards — every number traces to real content (loop-copilot/qe-platform/about/hero), no client-tied or invented figures; placeholder-needing metrics omitted, not faked. Build green (20 routes), lint 0 errors. **Next: R9 (about/skills/certs/education/AI Labs) → R7 (system design polish) → R1 (nav/search/loader) → R12.**
- **2026-06-30 (R6 — DONE):** Project pages rebuilt. `ContainerScroll` (faithful Aceternity scroll-driven 3D device frame, recolored dark+green — NOT B&W, reduced-motion static). `ProjectShowcase`: Container Scroll hero with the real screenshot or a clean static device frame (never fake UI), then a `TerminalCard` flip-deck of the project narrative (project-page flip ✓). `page.tsx`: Flow Wave bg, SEO header (status/tagline/metric/stack/live/system-design/mind-map links), internal-note section filter (drops qe-platform "NDA framing (must hold)"). Content loader: `getProjectImages` + `splitSections`; new `/api/project-image/[slug]/[file]` route serves screenshots from content/ (path-validated). Scaffolded honest in-development stubs for `hpe-rag-chatbot` + `global-census-chatbot` (canonical 7-table; no fabricated detail) — Jarvis still absent. Removed v1 `ProjectVisual`. Build green (18 routes, 6 projects), lint 0 errors. **Blocked:** Loop Copilot screenshots (→ static frame until dropped in content/projects/loop-copilot/); HPE/Census real content.
- **2026-06-30 (R3 + R5 — DONE):** R3 shared cards: `TerminalCard` (macOS flip-deck, close/min/max controls, index badge, arrow nav, green resume-keywords via `.terminal-body strong`), `CardSpotlight` (cursor glow + optional expand), `MovingBorderButton` (travelling border + hover lift), `InfiniteMovingCards` (skills marquee). (3d photo card landed in R4.) R5 Mind Map: `BrainIntro` (procedural blue particle brain, breathing pulse, click/5s auto → scatter+fade), `MindMapClient` orchestrates brain→force-graph hand-off on a copper-blue backdrop with a one-liner; mobile + reduced-motion skip the morph (PRE-AUTHORIZED fade/zoom path per PRD 6.2). Kept the react-force-graph engine. Added shared `useIsMobile` hook + `fadeIn`/`marquee` keyframes. Build green, lint 0 errors. **Deferred to R9/R12:** a mind-map node per skill (reconcile skills.md ↔ mindmap-data.json) + label-sprite sharpness. **Next: R6 project pages (Container Scroll).**
- **2026-06-30 (R4 — DONE):** Home rebuilt as the Ascend-style hub. **Globe from scratch** (`src/components/3d/globe/GlobeCanvas.tsx`): procedural shader earth (fbm continents, ice caps, day/night terminator with city lights), fresnel atmosphere shell, drei `Stars`, drag-to-rotate + slow auto-spin, reduced-motion aware. (No external earth texture: network fetch was sandboxed, so it's fully procedural — looks like a lit earth, not a wireframe.) Built `PhotoCard3D` (CSS-3D flip, photo→monogram fallback, back terminal summary typewriter w/ opt-in sound), `HubCards` (terminal-command hover portals), `EncryptedText` + `LayoutTextFlip` (reduced-motion aware, real text in DOM), `DashboardPreview` (static green bar chart). `HomeClient` composes globe + photo card + heading + cards + preview; `page.tsx` feeds from hero.md. **Removed the rejected v1 cinematic** (`HeroClient`, `HeroScene` — stardust burst, PRD 6.1). ESLint: extended R3F purity relaxation to `backgrounds/**`. Build green, lint 0 errors. **Blocked:** real photo (`public/niranjan-photo.jpg`) → monogram until provided. **Next: R3 card systems → R5 brain → R6 projects.**
- **2026-06-30 (R2 — DONE):** Built the background library under `src/components/backgrounds/`: `FlowWaveScene` (faithful R3F port of the flow-wave simplex-noise green point sheet, cursor void-repel, additive), `WaveGalaxyScene` (blue spiral galaxy), `ParticleSphereScene` (purple fibonacci shell, noise-breathing, vertical violet→blue gradient), `BackgroundCanvas` host (DPR cap), and `PageBackground` lazy dispatcher with on-brand static gradient fallbacks on mobile + reduced-motion handling. Build green. Wired into pages during R6/R8/R9/R10/R11. **Next: R4 globe-from-scratch (Home centerpiece) + R3 card systems + R5 brain.**
- **2026-06-29 (Session 1, prep):** Read PRD in full. Surveyed repo (inventory in §1). Tuned `code-reviewer` agent for v2 rules. Updated memory (project context, renovation reference, essence-preservation, liability-firewall). Wrote this plan. Resolved Q1/Q2/Q4 (see §3). No feature code written.
- **2026-06-29 (Session 2, R0 — DONE):** Locked the 4 build-start decisions (see top block). Updated content loader for `content/projects/<name>/<name>.md` folders (`getProject`/`getAllProjects`/`getAllContentDocs`). Stripped all rendered internal-note leaks: `about.md` TODO, `contact.md` (Globe note + TODO), `work-with-me` TODO `<p>`, `Footer` attribution-pending credits. Removed terminal mode (deleted `src/app/terminal/` + `TerminalNav.tsx`; cleaned `SiteNav` links). Added palette tokens `--copper`, `--purple`. Built sound foundation: `SoundProvider` (muted default) + `SoundToggle` (lucide, in nav) + shared `useReducedMotion` (useSyncExternalStore). Meta/OG audit: fixed em-dash in title/OG (banned char), added Twitter card + keywords. **Fixed a build blocker: root `tsconfig.json` was type-checking the full template apps under `template_repos/` — added `template_repos` to `exclude` (reference-only, mirrors the eslint ignore).** Verify: `npm run build` green (16 routes, projects resolve from folders), `npm run lint` 0 errors, leak sweeps clean. **Next: R1 — Nav + Gooey Search + Loader system (HARD). Awaiting assets in §2 (photo, Loop Copilot screenshots, interview/*, HPE content, diagram images); none block R1.**
