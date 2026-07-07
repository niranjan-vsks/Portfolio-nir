# STATE.md — v2 Renovation ROUND 2 (RENOVATION_PRD_FINAL)

_Session 1 (prep only, 2026-07-07, Opus). No feature code written this session._

**Authoritative spec (authority order):** (1) Niranjan's live answers to the Decision Gates below → (2) `RENOVATION_PRD_FINAL.md` → (3) `New Portfolio Fixes` doc (screenshots = the VISUAL source of truth; on any visual conflict the Fixes doc WINS) → (4) prior specs (this file's old plan, bullseye/00–10). This PRD's R0–R12 plan REPLACES the previous round's plan (also R0–R12 but different scope).

**The #1 standing order (behavioral):** _"MAINTAIN ALL THE EFFECTS, ALL THE COMPONENTS CODE AS IS AND ONLY AND ONLY MAKE MINOR SURGICAL CHANGES."_ Port every template essence-preserving from its real source/master prompt. Surgical content swaps only. A gutted/flattened port is a FAILED phase, not a shipped one. When a port is hard, STOP and flag at the gate — never downgrade silently. See [[feedback-essence-preservation]].

---

## A. Round-1 → Round-2 DELTA (what the last build got wrong; do NOT rebuild the wrong things)

Round 1 (previous STATE, now superseded) shipped a working site but the visual layer was rejected. This round largely reworks the visual layer; content + plumbing (content loader, RAG/chat API, image route, credentials, search index) mostly stays.

REPLACE / REBUILD:
- **Landing** — current: globe bg + hub cards + CSS photo card. Target: globe FIXED at centre rotating on its own axis (no blue ring, not fullscreen) + **3D-rotating terminal-card carousel orbiting it** (jordan.dev reference) + the REAL Aceternity `3d_card_photo` (not a flat rectangle) with an ask_niranjan button on it. Remove bar-graph/stardust. (PRD §9, DG-1, DG-2)
- **Cards everywhere** — current: `TerminalCard` deck (rejected as cheap) + Container Scroll on project pages. Target: **terminal flip cards** from `terminal_card` (Aceternity) — short caption front, FLIP on hover, CLICK routes to page. This is THE card, site-wide (projects, experience, certs, landing orbit). (PRD §12.1)
- **Container Scroll** — REMOVE everywhere except Saarthi's mobile-vs-web View. (PRD §13.4)
- **Project pages** — target: Slider Spectra hero in a "View" tab + tabbed sub-sections (Overview / System Design / Product Design / View / GitHub). Macbook Scroll on Loop Copilot Overview (DG-5). (PRD §13)
- **Mind Map brain** — current: procedural "white table lamp" (rejected). Target: reference-quality glossy neuron brain (`brain` + `neuron_landing_page`), zoom-in dissolve → blue neuron-starfield → dissolve into graph. (PRD §10.1)
- **Mind Map graph** — add emissive/bloom nodes, hover zoom + node motion (keep the praised connected-highlight), translucent description card CENTER-LEFT for every node, full on-click routing contract (zero 404s), dynamic data, a node per skill, tag-chip deep-links. (PRD §10.2–10.4)
- **Experience** — split into its OWN page `/experience` (currently just `/about#experience`) with an explicit FDE section + Wikipedia-style inline hyperlinks. (PRD §11.1)
- **About** — Infinite Moving Cards (terminal-style) for the experience strip + the MISSING skills marquee; Wave Galaxy bg. (PRD §11.2)
- **Contact** — Solaris background (`solaris/solaris.html`), replaces Particle Sphere. (PRD §9/DG-3)
- **Typography** — full overhaul; current mono-heavy landing is the "third class font" defect. Premium legible display/body; mono ONLY inside terminal surfaces; larger Encrypted Text. (PRD §6.1)
- **Buttons** — one system: Aceternity **Hover Border Gradient** (glow border + text glow + 3D rest + press-in). Replaces the current small bland buttons. (PRD §6.2)
- **Top nav** — rebuild "Navbar Dark Shadow" premium style. (PRD §8.1)
- **Footer** — rebuild visible, full sitemap (current one is invisible). (PRD §8.3)
- **Search** — centered, prominent, gooey, smart. (PRD §8.2)
- **Dashboard** — make metric cards clickable + fill the dead space under the numbers. (PRD §15.1)
- **Chatbot** — full premium UI rebuild; entry also from the landing photo card. (PRD §15.2)

KEEP: Flow Wave Green background (the one thing done right — reuse that exact port as the default bg for every dedicated page except About/Contact). Content loader + folder structure, `/api/ask` + RAG + rate limit, `/api/project-image`, credentials module, search index, content-as-source-of-truth, liability firewall, no-fabrication, status labels, dark-only.

STACK NOTE: PRD §3 says "Next.js 14." Repo is on **Next 16 / React 19 / Tailwind 4** (kept from round 1; not downgrading — flag as a knowingly-accepted deviation).

---

## B. Playwright verification status (PRD §20)
- **Playwright MCP (interactive/visual):** integrated and LIVE this session (`mcp__playwright__browser_*` tools available). Use for the §20.2 visual side-by-side and §20.3 motion checks.
- **Scripted suite (`tests/verify/`, run in `/goal`):** NOT set up. No `@playwright/test`, no `playwright.config`, no `tests/`. **R0 must install `@playwright/test`, add config, and write the crawl/console/firewall/copy-audit/screenshot suite.**

---

## C. Template manifest — verified on disk (2026-07-07)
| Template | Type on disk | Phase |
|---|---|---|
| `terminal_card` | SOURCE (`terminal_card_code.js`) + prompt | R1 (the one true card) |
| `slider_spectra` | PROMPT (`slider_spectra.md`) | R5 (project View) |
| `solaris` | SOURCE (`solaris.html`) | R9 (Contact bg) |
| `3d_card_photo` | SOURCE (`.js`) | R2 (landing photo card) |
| `brain` + `neuron_landing_page` | SOURCE | R3 (brain intro) |
| `infinite_moving_cards` | SOURCE (`.js`) | R4 (About strips) |
| `card_spotlight` | SOURCE + prompt | R6/R7 |
| `ascend` | SOURCE (`index.html`) | R2 (globe) |
| `helios_landing_page` | PROMPT | R2 (layout ref) |
| `gooey_search` | PROMPT | R10 (search) |
| `Container_Scroll` | PROMPT | R5 (Saarthi only) |
| `Layout_flipping_text` | SOURCE | R2 (headings) |
| `encrypted_text.md` | PROMPT | R1/R2 |
| `Hover_button` | SOURCE (superseded by Hover Border Gradient) | maybe chips |
| `remix-3d-mockup-animator` | SOURCE (`main.js`, repo root) | R5 (Saarthi mobile) |
| Macbook Scroll (Aceternity) | build from Aceternity | R5 (Loop Copilot Overview) |
| Hover Border Gradient (Aceternity) | build from Aceternity | R1 (buttons) |
| `wave_galaxy_blue`, `flow-wave` | prompt / source | reuse round-1 ports |

---

## D. DECISION GATES — ✅ ALL 5 DEFAULTS CONFIRMED (Niranjan, 2026-07-07)
- **DG-1 Landing nav.** DEFAULT: the orbiting terminal cards ARE the section-nav (each card = one section, click routes). Top nav minimal; footer carries full sitemap.
- **DG-2 Globe.** DEFAULT: reversal wins — globe fixed centre, auto-rotating on own axis; port Ascend globe render quality; drop hover/scroll camera; no blue ring; not fullscreen.
- **DG-3 Contact bg.** DEFAULT: Solaris fully replaces Particle Sphere (keep the template folder, stop using Particle Sphere).
- **DG-4 Perf override.** DEFAULT: accepted — multi-WebGL allowed on Landing + Mind Map WITH the full mandatory mitigation contract (§5). Anti-gutting floor: fallbacks may only defer/tier-down/simplify, never replace a heavy effect with a flat/cheap one on a capable device.
- **DG-5 Loop Copilot signature.** DEFAULT: keep Macbook Scroll on the Overview tab AND Slider Spectra in the View tab.

## E. BLOCKED ON NIRANJAN (honest stubs; never fabricated — PRD §16)
1. `interview/*.md` persona (chatbot stays honest-but-thin; verified still empty).
2. **SCRUBBED Loop Copilot screenshots** — 5 PNGs are dropped, but PRD Rule 3 requires Lenovo account data + email removed BEFORE they render. **Until confirmed scrubbed, treat as stub (do NOT ship them).** See Q below.
3. HPE Conversational RAG + Global Census content (honest stubs exist).
4. Photo — PROVIDED (`public/niranjan-photo.jpg`); confirm it's final.
5. Typing sound asset (sound stays muted regardless).
6. Saarthi / Rebalancer / HPE static diagram images.
7. Per-node bullets for interactive-diagram Card Spotlights beyond content.
8. Certification / education blurbs.
9. AI Labs content (route hidden).
10. Real dashboard numbers beyond content files.

## F. CONTRADICTIONS / QUESTIONS — RESOLVED 2026-07-07
**Answers:** Q1 → screenshots NOT scrubbed; hold as stub (Loop Copilot View shows placeholder until scrubbed set arrives; never render unscrubbed). Q2 → keep Geist for display/body + JetBrains Mono in terminal surfaces only, at the legibility floor; Encrypted Text bigger. Q3 → all 5 DG defaults approved. Q4 → keep `/ai-labs` hidden noindex scaffold. Q5 → Jarvis stays fully hidden until `Jarvis.md` exists.

Original questions (kept for record):
- **Q1 (blocking R5):** Are the 5 dropped Loop Copilot screenshots already scrubbed of Lenovo data + email? If not, I hold them as a stub and ship the View tab with wireframes/placeholder until scrubbed ones arrive.
- **Q2 (R1/R2):** Font direction — keep Geist (body) + JetBrains Mono (terminal only), or swap the display face to the Aceternity-reference grotesque? Default: keep Geist for display/body, mono only in terminal surfaces, sizes bumped to the legibility floor (body 15–16px, labels 13–14px).
- **Q3:** Confirm DG-1..DG-5 defaults (Section D) or override any.
- **Q4:** `/ai-labs` — keep the hidden scaffold, or drop the route this round? (Not in the new PRD section specs; Section 16 lists its content as blocked.)
- **Q5:** Jarvis stays fully hidden (no page, no nav/graph/search) until a `Jarvis.md` exists — confirm.

---

## G. PHASED PLAN (R0–R12, per PRD §18). One phase per session. Commit + update this file at every boundary. Halt at each `[REVIEW GATE]`. Every phase runs the §20 verification (scripted suite + visual side-by-side) before it is "done"; screenshot evidence goes TO the gate, does not close it.

### R0 — Intake + hygiene · ROUTINE
Verify all template + content paths (done, Section C). Install + wire Playwright scripted suite at `tests/verify/` (crawl every route for 0 errors, console-error assert, firewall string-check on /system-design, copy audit for em-dashes/banned phrases, full-page screenshots per phase). Reconcile this STATE plan (done). Strip any remaining rendered internal notes. Fix known issues. Record DG statuses. **Acceptance:** suite runs green on the current build; STATE reconciled.

### R1 — Global foundation · HARD
Typography overhaul (legibility floor). Hover Border Gradient button system (one, site-wide). Top nav (Navbar Dark Shadow). Visible footer + full sitemap. Flow Wave default-bg plumbing. **The one true terminal flip card** (port `terminal_card_code.js` essence-preserving: caption front, hover-flip, click-route). Interlink primitives: tag-chip → mind-map deep-link (`?node=<id>`), and the wiki-style inline hyperlink component (distinct color + hover caption dialog). **Acceptance:** buttons/nav/footer/cards match the reference look side-by-side; every card routes; zero dead links.

### R2 — Landing · HARD · `[REVIEW GATE]`
Black space; globe fixed-centre own-axis (Ascend render quality, no ring, not fullscreen); orbiting 3D terminal-card carousel (typewriter, hover-focus, click-route, keyboard/tap); real `3d_card_photo` with balanced photo/text + Summary + ask_niranjan buttons; Layout Text Flip + Encrypted Text at legible sizes; step-loader + mitigation contract; NO bar-graph/stardust/ring. **Acceptance §9.5** + visual side-by-side vs Ascend + 55fps sample.

### R3 — Mind Map · HARD · `[REVIEW GATE]`
Reference brain intro (glossy neurons, zoom-in dissolve → blue neuron-starfield → dissolve to graph). Graph: emissive+bloom nodes, hover zoom/motion, keep connected-highlight, translucent description card CENTER-LEFT for EVERY node, full on-click contract (dedicated page → route; parent w/ subnodes → zoom+focus subnode; skill → `/about#skills`; else real target or disabled; zero 404), dynamic data from content, a node per skill, `?node=` deep-link + zoom. **Acceptance §10.5** + firewall re-check in data.

### R4 — Experience + About · HARD
`/experience` own page (Flow Wave; explicit FDE section w/ tags+bullets+proof from content; wiki-style inline hyperlinks routing to projects/sections/nodes). `/about` (Wave Galaxy; Infinite Moving terminal cards for experience strip [hover-pause, click→/experience]; skills marquee → mind-map nodes; certification terminal cards). Cert/education dedicated pages (honest stubs). **Acceptance:** experience ≠ about; FDE proofs trace to content; every inline link + card routes.

### R5 — Projects hub + project pages · HARD · `[REVIEW GATE]`
Hub: terminal flip cards grouped Work/Independent. Per project: tabs Overview / System Design / Product Design / View / GitHub. View = Slider Spectra (focused card larger + zoom, others blurred; per-screenshot caption+description). Loop Copilot Overview = Macbook Scroll (DG-5); Saarthi View = Mobile/Web toggle (mockup animator + Container Scroll, allowed here only). Remove Container Scroll elsewhere. Screenshots are stubs until scrubbed (Q1). **Acceptance §13** + zero dead tabs.

### R6 — System Design · MED
Flow Wave bg. Distinct icons per node type; node click → Card Spotlight (≤4 one-line bullets). Plane filters. Tag chips → mind-map deep-link+zoom. Static diagrams as clean images (stubs). Firewall string-check in rendered output. **Acceptance §14.**

### R7 — Dashboard · MED
Flow Wave bg. Card Spotlight metric cards, CLICKABLE (route). Fill dead space with 2–3 interactive elements (filterable skills/stack, projects-by-status). Real numbers only; "Sample data" badge otherwise. **Acceptance §15.1.**

### R8 — Chatbot · MED · `[REVIEW GATE]`
Full premium symmetrical UI rebuild; fixed isolation/z-index/focus-trap; Wave Galaxy bg; entry from nav + landing photo card; Groq+pgvector, model-agnostic; guardrails; FAQ cached; rate limiter; no persisted history. Thin until interview content. **Acceptance §15.2**; tone gate re-runs after content.

### R9 — Contact · MED
Solaris background (port `solaris.html` essence-preserving, no depixelation); contact info; résumé CTA; premium buttons; no globe. **Acceptance:** Solaris matches source side-by-side.

### R10 — Smart search · MED
Centered prominent gooey input; fuzzy over sections/projects/experience/skills/certs/terms; suggestive phrases; `/` + `Cmd+K`; routes to page/anchor/mind-map node. **Acceptance §8.2.**

### R11 — Performance + accessibility · HARD
Full §5 contract end-to-end: device quality tiers, pause-off-screen, first-visit-only step-loader + cache + hard-timeout reveal, mobile fallbacks (alive, not dead), reduced-motion, image optimization, bundle audit, leak cleanup. **Acceptance:** Lighthouse ≥90 non-landing; 60fps mid-tier after load on landing/mind-map.

### R12 — Verify + ship · ROUTINE · `[REVIEW GATE]`
Full §20 crawl (zero reachable errors), copy audit, firewall check, status labels, SEO/OG, deploy to Vercel, prod smoke, final STATE with remaining stubs.

---

## H. Session log
- **2026-07-07 (Round-2 Session 1, prep):** Read RENOVATION_PRD_FINAL + New Portfolio Fixes in full. Verified template paths on disk (Section C) and that Playwright MCP is live but the scripted suite is not set up (Section B). Wrote this plan (replaces round-1 plan). Updated memory. No feature code. **Next: on "go", start R0** (Playwright suite + hygiene). Awaiting answers to Q1–Q5 (Section F).
