# 10 — VERIFY & SHIP

Run the matching section after each phase. Use `/goal` only for the mechanical conditions noted.

## Per-phase verify

### After every phase (mechanical — good `/goal` target)
- `npm run build` exits 0. `npm run lint` clean. No TypeScript errors.
- No console errors on the affected routes. No `localStorage` in any reused 3D component.
- Every route referenced in `mindmap-data.json` and the content files resolves (no 404). Dead routes either built or neutralized (`05`).

### Hero (Phase D) `[REVIEW GATE]` — human
- One WebGL context only (not 5). Confirm in devtools.
- Card-dissolve burst uses the same particles as the background field (visually dissolves into the stars).
- Ambient space elements are sparse, slow, non-occluding; frozen under reduced-motion; off on mobile.
- Tilt + frosted image-on-hover work. Glow is green↔cyan (no rainbow).
- 60fps on a mid laptop; graceful on lower-end.

### Map (Phase E)
- Bloom/glow present and subtle. Routing, hover edge-bump, collapse/expand, pause, mobile fallback all work.
- Liability firewall: no employer→system_design direct path (re-run the data check).

### System Design (Phase H) `[REVIEW GATE]` — human
- Loop Copilot interactive (React Flow, layer toggle). Coforge reference architecture interactive + animated-beam multi-cloud. Saarthi/Rebalancer static Mermaid.
- All copy is "how I would build", generic primitives, zero client/employer/proprietary names.

### Chatbot (Phase I) `[REVIEW GATE]` — human
- Answers grounded in content; refuses/redirects when unknown (no fabrication).
- Sounds like Niranjan (tone review against `interview/persona.md`).
- Secrets from env; no hardcoded keys.

## Performance budget (Phase K — `/goal` on Lighthouse if runnable)
- Lighthouse Performance >= 90 on `/` (landing).
- All 3D lazy-loaded and code-split. Images WebP + sized + `loading="lazy"`.
- 3D disabled < 768px with documented fallbacks.
- `prefers-reduced-motion` honored on every animated surface.

## Copy audit (whole site)
- No em-dashes in any user-facing text.
- No banned phrases (see CLAUDE.md). No fabricated metrics.
- Resume download works and points to the current PDF.

## Ship (Phase L)
- Deploy to Vercel. Set env vars (GROQ key, vector store). Run the RAG ingest once in the deploy environment.
- Smoke test in production: all routes, mode switcher, chatbot, resume download, mobile fallbacks.
- Confirm `/work-with-me` (if built) is noindex and absent from nav/sitemap.
- Update `bullseye/STATE.md` to "shipped"; list any `TODO(niranjan)` left (esp. interview content, API keys, resume PDF).
