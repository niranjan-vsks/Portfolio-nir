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

### R1 — Global foundation · HARD · ✅ DONE (2026-07-07)
Typography overhaul (legibility floor). Hover Border Gradient button system (one, site-wide). Top nav (Navbar Dark Shadow). Visible footer + full sitemap. Flow Wave default-bg plumbing. **The one true terminal flip card** (port `terminal_card_code.js` essence-preserving: caption front, hover-flip, click-route). Interlink primitives: tag-chip → mind-map deep-link (`?node=<id>`), and the wiki-style inline hyperlink component (distinct color + hover caption dialog). **Acceptance:** buttons/nav/footer/cards match the reference look side-by-side; every card routes; zero dead links.

### R2 — Landing · HARD · ✅ DONE (2026-07-07, revised per feedback)
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
- **2026-07-12 (R8 + R12 DONE — SHIPPED):** R8: ask_niranjan premium UI rebuild (terminal-chrome window, avatar-anchored assistant bubbles vs right-aligned user bubbles, glowing focus-ring input, FAQ chips, aria-live streaming + blinking caret, "no history stored" footer); backend /api/ask + RAG + rate limit untouched (KEEP); still honest-but-thin until interview/*.md lands. R12: verify suite updated (routes: -rebalancer, +wealthos, +experience, +9 forward-deployed; firewall check extended to ALL /forward-deployed pages; "fine-tuning" dropped from BANNED — Niranjan commissioned that capability page). Full run: 42/42 green after fixing 3 user-facing em-dashes (saarthi.md ×2, WorkWithMe copy). Production build green (38 routes). **Deployed to Vercel production**: https://portfolio-nir-ten.vercel.app (deployment READY, prod smoke 200 on /, /map, /forward-deployed, /contact, /projects/wealthos, /experience, /chat). Remaining open: R11 formal perf/a11y audit pass (Lighthouse targets), chatbot tone gate re-run once interview content arrives, custom domain aliasing (niranjanvsks.xyz) if not already pointed.
- **2026-07-12 (AGain Fixes — full pass):** All items shipped + verified in browser. (1) **Contact**: Solaris removed (glaring); shared `StarfieldBackdrop` (verbatim plume star shaders only, denser, full-sphere) + Starman video pinned right (sticky, larger than landing popup); channel cards enlarged; **Work with me** section — professional CTA opens an editable compose modal (to niranjan.vsks@gmail.com, prefilled subject/body) with Send via Gmail / Outlook / default-mail buttons. (2) **About**: prose bumped to 16px; strip cards bigger with CAPS titles and the new two-stage hover (expand 1.13 instantly + stays while hovered, flips to a back face after ~0.45s, keeps cycling every 6s); Why FDE augmented with 3 real-data stat cards + link to /forward-deployed. (3) **Mind map**: plume REMOVED (component deleted; SolarisBackdrop deleted too); intense starfield only; post-fit 30% dolly-in so the graph arrives filled (verified visually). (4) **Projects hub**: terminal flip cards (grouped independent/work, CAPS names). (5) **Project pages**: description un-boxed — direct 16px prose sections; Container Scroll removed from project pages (was already PRD-banned outside Saarthi). TerminalFlipCard names now CAPS. Build green, tsc+eslint clean, 0 console errors on /contact, /projects, project pages, /map.
- **2026-07-11 (night — R7 + R10 DONE):** R7: all 8 dashboard metric cards now clickable (added hrefs to the 4 that lacked one: /experience, /forward-deployed/architecting-ai-solution, /projects/qe-platform, /forward-deployed); dead space filled with `DashboardExplorer` — domain-filterable stack explorer (skills from skills.md; chips route to /map?node= via SKILL_NODE, else /skills) + status-filterable projects list (from getAllProjects, live status badges). R10: search index enriched with 8 FDE capability pages, 3 experience anchors, and 15 skill terms that deep-link zoomed mind-map nodes; Cmd+K / Ctrl+K toggle added alongside `/`; suggestions updated ("Loop Copilot system design", "Forward Deployed Engineering", "GraphRAG"). Verified in browser (Ctrl+K → "graphrag" → skill/project/fde/section results ranked correctly). tsc+eslint clean. **Remaining: R8 (chatbot rebuild — blocked on interview content for tone gate), R11 (perf/a11y), R12 (verify+ship).**
- **2026-07-11 (evening — assets in + R4 done + R9 done):** (1) **Loop Copilot screenshots LIVE**: all 5 PNGs PII-scrubbed in-place with obvious placeholders ("John Doe Motors appt", "Acme Pharma appt", "demo_accounts_list.xlsx", "john.doe@example.com"); slug added to SCREENSHOTS_CLEARED. The stub pipeline is fully automatic: drop any image into `content/projects/<slug>/`, add the slug to SCREENSHOTS_CLEARED in `projects/[slug]/page.tsx`, and SliderSpectra auto-fits any dimensions (object-contain on black). (2) **Saarthi View**: mobile/web toggle; mobile plays Niranjan's wireframe walkthrough (`public/saarthi/mobile-demo.webm`) inside an iPhone-style mockup frame; web tab is an honest stub. (3) **R4 part 2 DONE**: About page Infinite Moving Cards experience strip (click → /experience#slug, hover-pause) + the missing skills marquee (skills parsed from skills.md; ~34 mapped to verified mind-map node ids → /map?node= deep-links; unmapped → /skills, zero 404s). (4) **R9 DONE**: Solaris ported verbatim (breathing particle sun, fresnel hollow core, cursor solar-flare, fBm corner aurora, UnrealBloom, intro dolly; demo UI panel/localStorage dropped; reduced-motion freeze) → replaces Particle Sphere on /contact. All verified in browser, tsc+eslint clean. **Remaining:** R7 dashboard clickable-metric polish, R8 chatbot premium rebuild, R10 gooey search, R11 perf/a11y contract, R12 verify+ship.
- **2026-07-11 (Right_Now_Portfolio_Fixes.pdf — full pass):** All doc items shipped across 6 commits. (1) **/projects 500 fixed**: user's rebalancer.md was a frontmatter-less "WealthOS content pack"; unpacked into `projects/wealthos/wealthos.md` (+ system-design + interview files), deleted rebalancer, renamed everywhere (search, footer, dashboard, credentials, system-design section, mind-map node → /projects/wealthos), hardened generateStaticParams with basename fallback. (2) **Landing**: faithful Ascend planet port into GlobeStage (verbatim day/night/city-lights/ocean-glint shader + 3 cloud shells + billboard halo; fresnel "blue ring" shell removed); card click contract (out-of-focus → revolve to front, in-focus → route; routes prefetched; active card scales 1.08); FDE orbit card added. (3) **Mind map**: zero-404 contract (all 49 dead /skills/* hrefs dropped → those nodes zoom+focus; hpe-rag/mphasis-ml/about# hrefs repointed to real routes; domain click = zoom into branch, page-backed click = route immediately, hover prefetch); zoomToFit(900,40) on brain hand-off (was too zoomed out); **PlumeBackdrop** (verbatim plume master-prompt port, 60k particles, left-anchored, no auto-orbit) replaces the glaring plasma burst (plasma component deleted). Deep-link /map?node= verified working (old 500 gone). (4) **/forward-deployed hub**: 8 capability terminal flip cards (grid, hover-flip w/ 2-liner back, click → /forward-deployed/[slug]); content in `content/fde/*.md` (firewall-safe: no employer names; K8s/Docker/LB/OpenSearch/S3/Guardrails detail per Niranjan's authorization); section pages render Wikify project buttons + TagChips → mind-map nodes. (5) **Contact**: premium channel cards (email/LinkedIn/GitHub), copper #4aa8ff + green contrast, HoverBorderGradient CTAs, duplicate H2 stripped. Résumé link → /Niranjan_VSKS_FDE_P1.pdf and GitHub → github.com/niranjan-vsks site-wide. (6) **Starman**: avatar popup now plays star-man.mp4 as-is + comic typewriter dialog. (7) **SliderSpectra** ported (verbatim coverflow math, green↔cyan lane, demo chrome dropped) and wired into every project page except Saarthi; honest gradient placeholders until screenshots are scrubbed. Build green (38 routes), tsc + eslint clean on touched files, 0 console errors on /, /map, /forward-deployed, /contact, /projects/wealthos. **Blocked on Niranjan:** Saarthi iPhone mockup video (he will drop into Saarthi's content folder); scrubbed screenshots (Q1). **Remaining plan:** R4 part 2 (About strips/marquee), R5 tabs polish, R6-R12.
- **2026-07-10 (landing audit + R3 commit + R4 part 1):** Audited landing after the globe-scale root-cause fix (primitive scale 0.115; camera was previously INSIDE the planet — that was the "world-map fullscreen" defect). Shrunk orbit-card `distanceFactor` 5.5→4.1 so the front card no longer swallows the globe. Visual verify: earth mid-sized in a starfield, own-axis spin, cards occlude behind the planet, 0 console errors. Committed R3 part 2 (graph focus/deep-link/detail panel/plasma backdrop) as 121f3c3. **R4 part 1:** built `/experience` (Flow Wave bg) with the explicit FDE section — tags + 4 proof pillars (customer-facing, architecture, cost/cloud/token optimization, stakeholder) sourced from `content/fde.md` (new; every bullet traces to coforge/hpe md + Niranjan's resume), `Wikify` inline wiki-links (projects + `/map?node=skill_graphrag`), employer timeline with `#coforge/#hpe/#mphasis` anchors. Footer/HomeClient/searchIndex now point at `/experience`; added FDE search entry. Build green, tsc clean, no em-dashes. **Note:** dev server needed restart to pick up new Tailwind utilities (md:grid-cols-2 verified in prod CSS). **Remaining R4:** About page Infinite Moving Cards experience strip + skills marquee → mind-map nodes; cert cards. Then R5+.
- **2026-07-08 (R3 part 1 — brain DONE):** Ported the real brain (`BrainScene`) from `brain.html` — samples 110k points off `rotten-brain.glb` + the verbatim glossy-neuron shaders + UnrealBloom + entrance/dissolve. Wired into MindMapClient; brain→graph hand-off verified (0 console errors). Fixed the stuck landing loader (was: `messages` default-array in effect deps restarted it every re-render; now rAF-driven, mount-once, ~1.2s) and lowered globe latency. **Remaining R3:** graph-quality overhaul on `MindMap3D` — bloom/emissive nodes, hover zoom + node motion, translucent description card CENTER-LEFT for every node, full on-click contract (dedicated page → route; parent → zoom subnode; skill → /about#skills; zero 404), a node per skill, `?node=` deep-link + zoom (consumed by TagChip). **Then R4–R12.** Each remaining template ported faithfully from source (no gutting).
- **2026-07-07 (R2 — DONE, revised):** Landing rebuilt. Ran `/impeccable` (brand register + PRODUCT.md/DESIGN.md written; bans internalized — no big-number dashboard, no 01/02 markers, no eyebrows). Real Aceternity `ThreeDCard` (mouse-tracked depth). **Globe ported from the real Ascend `planet.glb`** (opaque earth + blue fresnel atmosphere + starfield = the outer-space background), fixed centre, own-axis rotate. `OrbitingCards` = terminal cards on a tilted 3D ring revolving around the globe (typewriter, drag/arrows, click front card to open; instructional text removed). `StepLoader` (first-visit, hard-timeout) with the globe DEFERRED until the loader finishes (so its heavy init never starves the loader timers). **Per Niranjan's live feedback:** dropped the space-hungry 3D photo card → `CollapsibleAvatar` (expandable bubble, swappable media slot for a future animated avatar); globe opaque; cards revolve around it; removed "click to open". Build green (28 routes), lint 0 errors, 0 console errors. **Note:** loader timing looks slow only in the headless/background Playwright tab (timer throttling, §20.4); focused browser reveals in ~4s. Niranjan reviews the whole app at the end.
- **2026-07-07 (R1 — DONE):** Foundation. `HoverBorderGradient` (the one button: travelling green border, text glow, lift, press-in). `TerminalFlipCard` (the one true card — ported `terminal_card` macOS chrome + syntax-highlighted YAML body + typewriter caption, flips on hover, routes on click; keeps template's multi-color syntax, not flattened). Typography overhaul (Geist for body/headings at 16px legibility floor + generous line-height; mono only on terminal surfaces; prose headings de-mono'd). Nav rebuilt "Navbar Dark Shadow" (elevated, soft shadow, centered search, Résumé = the one button). Footer rebuilt visible with full sitemap. Interlink primitives: `WikiLink` (inline hyperlink + hover caption) and `TagChip` (→ `/map?node=<id>`, consumed in R3). Build green (28 routes), lint 0 errors. **Adoption note:** old `Button`/`ButtonLink` still used on pages that R2–R10 rebuild; swap to HoverBorderGradient per-phase. **Next: R2 landing (globe + orbiting terminal cards + real 3d_card_photo) [GATE].**
- **2026-07-07 (Round-2 Session 1, prep):** Read RENOVATION_PRD_FINAL + New Portfolio Fixes in full. Verified template paths on disk (Section C) and that Playwright MCP is live but the scripted suite is not set up (Section B). Wrote this plan (replaces round-1 plan). Updated memory. No feature code. **Next: on "go", start R0** (Playwright suite + hygiene). Awaiting answers to Q1–Q5 (Section F).
