# RENOVATION PRD (FINAL) : portfolio-nir v2
## The Bullseye Renovation Spec for Claude Code

**Owner:** Niranjan VSKS, Senior Agentic AI Engineer (Forward Deployed positioning)
**Implementer:** Claude Code (Opus). This document is spec only. It contains no code.
**Status:** Authoritative. Where this PRD conflicts with any file in `bullseye/` (00 to 10), any skill convention, or any template default, THIS PRD WINS.

---

## 0. READ THIS FIRST (Claude Code)

### 0.1 What this document is
The v1 build failed on quality. Niranjan reviewed it twice and produced detailed section-by-section feedback. This PRD consolidates ALL of that feedback into one end-to-end renovation spec. His verbatim words are preserved in quote blocks throughout so you feel the severity. Read them. Every quote block is a defect report from the person paying for this work.

### 0.2 Honest scope note
This PRD closes SPEC gaps only. It cannot pre-close:
- CONTENT gaps: empty files, missing screenshots, missing photos, missing blurbs. Every one of these is marked as an explicit stub in Section 16. Render honest "In development" or clearly-labeled placeholder states. NEVER fabricate a value, metric, image, or sentence to fill a gap.
- TASTE gaps: whether motion "feels premium" is judged by Niranjan at the review gates. Do not self-certify visual quality. Surface it.

### 0.3 Authority order (on any conflict)
1. Niranjan's live answers to the Decision Gates in Section 1.
2. This PRD.
3. `New_Portfolio_Fixes_now` (his latest feedback, already folded in here).
4. Prior specs (`bullseye/00` to `10`, RENOVATION_DIRECTION_v2, CONTEXT_HANDOFF).
Where the latest feedback reversed an earlier decision, the reversal is already applied in this PRD.

### 0.4 How to run
- Execute phases R0 to R12 in order (Section 18). Update `bullseye/STATE.md` after every phase (what is done, what is pending, open questions). At R0, reconcile any older phase plan in STATE.md with the plan in this PRD; this PRD's plan wins.
- Halt at every `[REVIEW GATE]`. Do not declare visual phases "done"; surface them.
- Use `/goal` only for mechanical "build until green" loops (build passes, lint clean, zero dead routes). Never for visual or tonal quality.
- Skills: `frontend-design`, `3d-web-experience`, `performance-optimizer`. Spec overrides skill conventions. No Superdesign in unattended runs.

### 0.5 The number one recurring failure (root cause, fix it in your behavior)
Twice in a row, rich templates were reduced to flat black-and-green rectangles, effects were gutted, and fonts came out cheap. Niranjan's verbatim standing order:

> "MAINTAIN ALL THE EFFECTS, ALL THE COMPONENTS CODE AS IS AND ONLY AND ONLY MAKE MINOR SURGICAL CHANGES."

> "DONT MAKE THE SAME MISTAKE OF Reducing it to a Basic Bland Black and Green thing."

**RULE:** Port every named template ESSENCE-PRESERVING from its source or master prompt. Keep its real styling, depth, materials, motion, resolution, and polish. Make only surgical content swaps (text, images, links, palette-lane recolor where Section 4 says so). If a port is genuinely hard, STOP and flag it at the next gate. Never downgrade silently. A degraded port is a failed phase, not a shipped phase.

### 0.6 The bar
> "The Website should look, Clean and Premium and Show that the guy who built this is someone of a Production grade, enterprise standard and not some basic Noob AI prompter."

> "Everything must be seamlessly integrating and working like Clockwork."

Premium, enterprise, production-grade. Zero reachable errors. That is the bar for every phase.

---

## 1. DECISION GATES (five questions, defaults locked, Niranjan can override)

Each gate has a DEFAULT resolved from Niranjan's own authority order (latest feedback wins). Implement the default UNLESS Niranjan overrides before the phase that consumes it. List all five in STATE.md as open until he confirms.

**DG-1. Landing section navigation.**
Question: With the hub replaced by "globe + orbiting terminal cards," do the section-navigation cards (Projects, Experience, Mind Map, System Design, Dashboard, About, Contact) still exist on the landing, or move to nav only?
DEFAULT: The orbiting terminal cards ARE the section-navigation cards. Each orbiting card is one section, terminal-styled, typewriter caption, click routes to that section. The top nav stays minimal (Section 8) and the footer carries the full sitemap. Rationale: the latest doc says the landing cards "also I wanted as Terminal Cards" and then replaces the hub with orbiting terminal cards; merging them is the only reading with no redundancy.
Consumed by: Phase R2.

**DG-2. Globe behavior.**
Question: "Keep the Ascend globe as-is with hover/scroll effects, surgical only" vs "changed my mind, globe fixed-centre rotating on its own axis with cards orbiting."
DEFAULT: The reversal wins (his words: "But Now I changed My Mind"). Globe is fixed at centre, auto-rotating on its own axis. Port the Ascend globe's RENDER QUALITY (mesh, material, shader, lighting) as-is; drop the hover/scroll-driven camera choreography, since orbiting cards now own the motion. No blue ring. Globe does not occupy the full screen.
Consumed by: Phase R2.

**DG-3. Contact background.**
Question: Is Particle Sphere dropped entirely?
DEFAULT: Yes. Solaris (from `template_repos/textura_templates/solaris`) fully replaces Particle Sphere on Contact. Particle Sphere is removed from the site. Do not delete the template folder; just stop using it.
Consumed by: Phase R9.

**DG-4. Performance tradeoff for the WebGL override.**
Question: Is the step-loader plus quality-tier mitigation accepted as the tradeoff for multiple heavy WebGL on Landing and Mind Map?
DEFAULT: Yes, he pre-accepted it: "Ideally there shouldnt be latency, But if there is we will do this." Full mitigation contract in Section 5 is MANDATORY, not optional.
Consumed by: Phases R2, R3, R11.

**DG-5. Loop Copilot signature visual (new question, not in the prior handoff).**
Question: The earlier direction restored the animated Macbook Scroll on Loop Copilot. The latest doc gives project pages a Slider Spectra "View" section and says non-Saarthi pages "can just have the Slide Spectra template effect in this section." Does Macbook Scroll survive on the Loop Copilot Overview?
DEFAULT: Keep Macbook Scroll on the Loop Copilot Overview tab (it was explicitly demanded restored and never revoked), AND use Slider Spectra in the Loop Copilot View tab like every other project. If Niranjan says drop it, remove Macbook Scroll entirely.
Consumed by: Phase R5.

---

## 2. HARD RULES (every rendered surface, every phase, the chatbot too)

1. **No fabrication.** Every metric, claim, number, and architecture detail traces to a real file in `portfolio-assets/content/`. Thin items render as honest "In development" stubs. Never invented numbers, clients, capabilities, or copy.
2. **Liability firewall.** No employer name on any architecture diagram, ever. All Coforge or QE diagrams framed "Reference architecture: how I would build this." Allowed generic infra names: Bedrock, Docker, K8s, Grafana, Vault, OpenSearch, AWS, Azure AD, Confluence, and similar industry-standard primitives. Path rule: employer -> project -> system_design. Never employer -> system_design directly.
3. **Confidentiality.** No real client data in any screenshot. Loop Copilot screenshots must have Lenovo data and the email address scrubbed BEFORE they render anywhere (this is a content stub until Niranjan supplies scrubbed images; do not ship unscrubbed ones).
4. **No em-dashes** in any user-facing copy. Use colons, periods, or parentheses.
5. **No internal notes** in rendered copy: no TODOs, no authoring parentheticals, no "attribution pending", no "parked for V2". These are code comments or nothing.
6. **Zero reachable errors.** No 404, 400, 401, 500 reachable from any click path. Every node, tag, chip, card, button, and link routes to a real target or is visibly disabled. This is a hard acceptance criterion for every phase.
7. **Clear status labeling.** Shipped / Piloted / In development, consistently, everywhere a project appears. Existing framing guardrails hold: Loop Copilot integration is "within the customer's tenant trust model" (never "bypassed OAuth"); Saarthi is "piloted" not "deployed"; Rebalancer "surfaces recommendations", it does not execute trades.
8. **Banned phrases** (carry over from CLAUDE.md): "transition/transitioning", "at the intersection of", "bypassed OAuth", "fine-tuning" (use "multi-layer compliance architecture"), hedge phrases ("comfortable owning", "where needed", "when the situation calls for it").
9. **Dark only.** No light mode. Strip light-mode code from every reused template.
10. **Sound muted by default** with a visible toggle. Never autoplay. (Typing sound asset is a content stub.)
11. **Accessibility.** `prefers-reduced-motion` honored on every animated surface (freeze particles, typewriter renders final state instantly, marquees stop). Keyboard and focus states on every interactive element.
12. **SEO reality.** Real HTML text plus meta/OG tags on every route. All-canvas content is invisible to crawlers and link previews; recruiters share links.

---

## 3. WHAT CHANGED vs v1 (delta summary, so you do not rebuild the wrong things)

REMOVED:
- Terminal mode (whole mode). Replaced by smart search (Section 8).
- Container Scroll everywhere EXCEPT the Saarthi project page.
- Particle Sphere on Contact (DG-3).
- Stardust burst, bar-graph forced onto landing, blue ring around globe.
- The old "Cinematic hub with portal cards" landing concept.
- The current site-wide font styling ("third class"). Full typography overhaul (Section 6).
- The current button styling. Full button overhaul (Section 6).

CHANGED:
- Landing: globe fixed-centre + orbiting 3D terminal cards (Section 9).
- Global default background: Flow Wave Green on every dedicated page except About and Contact (Section 7).
- Performance rule: "one heavy WebGL per page" is OVERRIDDEN for Landing and Mind Map, with a mandatory mitigation contract (Section 5).
- Experience becomes its OWN page, split from About (Section 11).
- Project pages: Slider Spectra hero + tabbed sub-sections (Section 13).
- Mind map: brain intro rebuilt to reference quality, node click contract defined, dynamic data (Section 10).
- Chatbot: full UI rebuild (Section 15).

UNCHANGED (do not relitigate):
- Stack: Next.js 14 App Router, TypeScript, Tailwind, shadcn, Framer Motion, Three.js + R3F + drei, react-force-graph-3d, Vercel. Chatbot: Groq + Supabase pgvector, model-agnostic config.
- Mind map engine = react-force-graph-3d. Do not rebuild on a template.
- Palette lanes (Section 6 note), dark only, JetBrains Mono terminal voice.
- Content-as-source-of-truth: `portfolio-assets/content/*.md` drives site AND RAG.
- Liability firewall, no-fabrication, status labels.

---

## 4. TEMPLATE PORT PROTOCOL (applies to every template in Section 17)

For each template:
1. Read the ACTUAL source (`.js` / `.html` / `.tsx`) or, if prompt-only, the master prompt `.md`, completely, before writing a line.
2. Identify the essence: the materials, shaders, motion curves, depth, glow, and layout that make it look premium. List them in STATE.md per template.
3. Port essence-preserving into React/R3F (raw-Three templates get proper R3F wrapping: no `document.body.appendChild`, no leaking global listeners, cleanup in effect returns, lazy-load with `next/dynamic` `ssr:false`).
4. Surgical changes ONLY: swap text, images, links; recolor within palette lanes ONLY where the template's colors clash with the site (Flow Wave stays green, Solaris stays Solaris, brain stays its reference blue; do NOT force everything to black/green); strip demo chrome, watermarks, light mode, `localStorage`.
5. Verify side-by-side against the template's original render. If your port looks flatter, dimmer, lower-res, or less alive than the source, the port has FAILED. Fix or flag; never ship the downgrade.
6. Prompt-only templates: build from their master prompts, same essence-preserving standard.

---

## 5. PERFORMANCE OVERRIDE (Niranjan's explicit call) + MANDATORY MITIGATION CONTRACT

> "It is Okay if you violate the More than 1 3d WebGL rule, Fuck that. I want a Portfolio the way I want it. For the landing Page and MindMap lets Bypass that rule. That is something which creates a Make or Break First Impression, Show some Step Loader or some Creative Loading messages to keep the screen occupied while loading stuff in the background if needed, Ideally there shouldnt be latency, But if there is we will do this."

Rules:
- Multiple heavy WebGL elements are ALLOWED on Landing and Mind Map where this PRD specifies them. Everywhere else, one heavy effect per page still holds.
- The override is NOT a license to ship a laggy page. Latency must be masked or eliminated. In return for the override, ALL of the following are mandatory:
  1. **Step-loader** with creative, terminal-styled loading messages while heavy assets warm in the background. First visit only; cache so returning visitors skip it. Hard timeout: reveal the page at N seconds max (default 4s) even if assets are still streaming in progressively.
  2. **Aggressive lazy-load** and code-splitting of every 3D component.
  3. **Device quality tiers**: detect GPU/device class; degrade particle counts, bloom, and texture sizes on low-tier devices instead of shipping jank.
  4. **Pause off-screen**: any WebGL scene not in viewport stops rendering.
  5. **Mobile fallbacks**: simplified but still-alive versions where feasible (reduced particle counts, static-frame globe with CSS motion, tap instead of hover/drag). A dead static image is the last resort, not the plan. Never ship a broken interaction on mobile.
  6. **Reduced-motion paths** on everything.
- Budget elsewhere: Lighthouse Performance >= 90 on non-landing routes; landing and mind map are measured but gated on perceived smoothness (60fps mid-tier laptop after load) rather than the Lighthouse number. Report both at gates.

---

## 6. TYPOGRAPHY AND BUTTONS (global overhaul, top complaint)

> "The FONT is SUPER SHITTY and UGLY for all the Text especially in the Landing PAGE. Remove the usage of this font styling altogether it looks Really Really third class."

> "in an effort to keep terminal style font, the size is decreased and if recruiter looking at it is having to struggle to find the elements we are doing a mistake right there."

### 6.1 Typography
- Replace the current font styling SITE-WIDE with a clean, premium, legible system. Reference: the clean Aceternity component font styles Niranjan pointed to (modern grotesque/sans for display, crisp mono for terminal surfaces).
- Keep the terminal aesthetic ONLY inside terminal-styled surfaces (terminal cards, chatbot, code labels). Body copy, headings, nav, and buttons use the premium display/body faces at fully legible sizes.
- Legibility law: a recruiter must never struggle to read or locate an element. Minimum body 15 to 16px, UI labels 13 to 14px is the floor, not the target; headings scale up confidently. Generous line-height (1.6 body).
- Keep the Encrypted Text effect, but at a larger size and with the new premium styling: "Keep the Encrypted Text Effect but change the font size and styling so that it is cleanly visible."
- Baseline faces remain JetBrains Mono (terminal surfaces) + Geist (body) unless the Aceternity reference styles clearly demand a swap; if you swap, record the choice in STATE.md and surface it at the R2 gate.

### 6.2 Buttons (single premium system, used everywhere)
> "These buttons are super shitty... very small, very basic, bland and SUPER UGLY and it is screaming cheap."

- One button system site-wide, Aceternity Hover Border Gradient style:
  - Glowing border that lights up on hover.
  - Text glow on hover.
  - Subtle 3D look at rest.
  - Press-in (depress) effect on click.
  - Clearly visible label text at full legible size.
- Applies to: all CTAs, tab controls, FAQ chips, resume download, chatbot send, card actions.

### 6.3 Palette note
Palette lanes from `01_DESIGN_SYSTEM` still govern UI chrome (green identity anchor on near-black). But templates keep their own signature colors per the Port Protocol (Section 4). "Don't be too religious" with the palette: cohesion comes from green + dark UI chrome, not from repainting every template.

---

## 7. GLOBAL BACKGROUND MAP

> "the Flow Wave background is the Only thing that you executed properly, Keep it as Constant Background for any new page from now on, Except for Contact and About page."

| Surface | Background |
|---|---|
| Landing | Black space scene: globe + orbiting terminal cards (Section 9) |
| Mind Map | Brain intro -> blue neuron-particle starfield -> graph (Section 10) |
| Every dedicated page (Projects hub, each project page, System Design, Dashboard, Experience, Certifications, Education, and any new page) | **Flow Wave Green** (default, no exceptions besides the rows below) |
| About | Wave Galaxy + starfield |
| Chatbot | Wave Galaxy (consistent with prior spec; it is an overlay/page, not a "dedicated page" in the Flow Wave sense) |
| Contact | **Solaris** (replaces Particle Sphere, DG-3) |

Flow Wave port rule: it was executed perfectly once. Reuse THAT implementation. Do not re-derive it.

---

## 8. TOP NAV, SMART SEARCH, FOOTER (global chrome)

### 8.1 Top nav
> "the Top Nav, I didnt like it, the Font and Styling is SHIT."

- Rebuild premium. Style reference: the "Navbar Dark Shadow" preview-style navbar Niranjan pointed to (dark, elevated, soft shadow, optional hover preview treatment).
- Minimal and persistent on every route: `Logo | Search | GitHub | Contact | Resume`.
- Resume links to the stable PDF path in `public/` (keep the current filename; Niranjan swaps the file without code changes).
- Define ONCE, including its mobile version (collapse pattern, tap targets). Used identically on every page.

### 8.2 Smart search (replaces Terminal mode)
> "Search Bar is small and should have been in center and also should have been a smart one."

- Centered, prominent, Gooey-styled input (source: `template_repos/textura_templates/gooey_search`, essence-preserving).
- Client-side fuzzy search over an index of: sections, project names, experience entries, skills, certifications, key terms. Suggestive phrases as you type ("Loop Copilot system design", "Forward Deployed Engineering", "Saarthi mobile view").
- Selecting a result routes to the page, anchor, or Mind Map node (with zoom/focus). No LLM in the search path.
- Keyboard: `/` or `Cmd+K` focuses search; arrows + enter navigate results.

### 8.3 Footer
> "Look at the footers, Is that a Nav Bar, Are You fucking Serious. It is not even Visible to anyone."

- Rebuild a clean, VISIBLE footer: full sitemap (all sections and project pages), contact links, resume, GitHub, LinkedIn. Clear contrast, legible sizes, premium spacing. If any template attribution is licensed as required (check the Sketchfab iPhone model license), it lives here as one clean line.

### 8.4 Back navigation
Every dedicated page has a consistent "back to home" affordance and respects browser back.

---

## 9. LANDING PAGE (Phase R2) `[REVIEW GATE]`

> "WHAT THE FUCK IS THIS, THIS LOOKS LIKE A CHEAP SHITTY COPY of a School Doodle Project, Nowhere close to a Premium Enterprise Grade Portfolio."

### 9.1 Scene composition (single premium space scene)
- Background: black space.
- Centre: the Globe, fixed, rotating on its own axis (DG-2). Ported from the Ascend template at its full render quality (mesh, material, lighting, atmosphere). No blue ring. Not full-screen; it is the centrepiece of the composition, sized to leave room for the orbiting cards and the photo card.
- Orbiting around the globe: **3D-rotating TERMINAL-STYLED CARDS** in a carousel orbit (reference: the "jordan.dev" terminal-card 3D carousel imagery in the feedback doc). Each card:
  - Terminal styling from `template_repos/textura_templates/terminal_card` (Aceternity Terminal), essence-preserving.
  - Typewriter effect typing its caption.
  - Per DG-1 default: each card is one section (Projects, Experience, Mind Map, System Design, Dashboard, About, Contact); click routes there.
  - Orbit motion is smooth and readable; the front-facing card is fully legible; cards decelerate/focus on hover; keyboard and tap navigation between cards.
- This scene is a permitted multi-WebGL surface (Section 5). The mitigation contract applies in full: step-loader, quality tiers, pause off-screen, mobile fallback, reduced-motion.

### 9.2 3D photo card
> "The 3d Card Effect, You have Reduced it to Ashes. By Reducing it to a Rectangular box that is VERY UGLY."

- Render the real Aceternity 3D card (`template_repos/textura_templates/3d_card_photo`) AS IS. Heavy-3D exception explicitly granted here. Do NOT flatten to a 2D rectangle.
- Contents: name, title (Senior Agentic AI Engineer), photo (content stub until supplied), and a "Summary" button (new premium button style).
- FIX the photo-to-text proportion: current version is asymmetric and weird. Balanced, deliberate layout; photo and text sized in a clean ratio.
- Add an **ask_niranjan chatbot button ON the card** so users open the chatbot directly from it.
- Keep the full flip behavior from the prior spec (back face = terminal card with typewriter; flip via drag/arrows; liquid-smooth) unless it fights the new composition; if it does, surface at the gate rather than silently cutting it.

### 9.3 Text effects
- Keep Layout Text Flip and Encrypted Text for headings/captions, at the new larger, legible sizes (Section 6).

### 9.4 Explicit exclusions
- No bar-graph/dashboard preview forced onto the landing ("just because the Ascend Template added bar graph, you dont need to force one there").
- No stardust burst. No blue ring. No full-screen globe.

### 9.5 Acceptance (R2 gate)
- Scene loads behind the step-loader; hard-timeout reveal works; return visits skip the loader.
- Globe render quality is visually comparable to the Ascend source (side-by-side check).
- Orbiting terminal cards: typewriter runs, hover focus works, every card routes correctly, zero dead targets.
- 3D photo card renders with true 3D depth, correct proportions, working Summary + chatbot buttons.
- 60fps on a mid-tier laptop after load; graceful low-tier degradation; mobile fallback is alive, not dead.

---

## 10. MIND MAP (Phase R3) `[REVIEW GATE]`

> "WHAT HAVE YOU REDUCED THE BRAIN ANIMATION INTO, THIS IS THE CHEAPEST WORK YOU HAVE DONE... it looks like some white color table lamp that opened a portal."

### 10.1 Brain intro (quality is not negotiable)
Reference behavior, in order:
1. Brain centered, tilted slightly right, glossy shine, neurons visibly shining (match the reference detailing; source: `template_repos/textura_templates/brain` + `neuron_landing_page`).
2. Camera slowly moves and zooms IN, neurons dissolving, "as if it is letting you deep inside the brain."
3. Background turns blue with neuron particles scattered like stars.
4. Dissolve transition into the Mind Map on a black background, smooth.
- A true neuron-to-node particle morph is NOT required: "even if the Mindmap loads smoothly also I am okay." A clean dissolve/fade hand-off into a smooth graph load is the accepted fallback. The BRAIN RENDER QUALITY is the non-negotiable part; the transition may be simple but must not look cheap.
- The current "white table lamp opening a portal" render and the cheap transition are both defects to be replaced, not tuned.

### 10.2 Graph scene
> "back to that same shit ass Nodes and edges with negligible interactiveness to it, no 3d look, cheap ass third copy of obsidian."

- Engine stays react-force-graph-3d. Raise the GRAPHICS quality: emissive glowing nodes, subtle bloom (UnrealBloomPass via the exposed composer), real 3D depth, category color coding, no pixellation.
- Background: at minimum, brain at left + premium outer-space background. Never a bare black Obsidian-style graph.
- Hover: zoom/scale response on the hovered node, gentle node motion, and KEEP the highlight-connected-nodes-and-edges behavior (explicitly praised).
- Node description: a TRANSLUCENT CARD appearing center-left (middle-left of the viewport) for ALL nodes. Non-negotiable, applies to every node, never lost at the bottom.

### 10.3 On-click contract (zero 404s)
| Node state | Click behavior |
|---|---|
| Has a dedicated page (project, certification, education) | Route to that page, whether root or sub node |
| No dedicated page, HAS subnodes | Zoom/focus onto its subnode chain; the subnode becomes the focused node; description card still shows |
| Skill node | Route to `/about#skills` (skills have no own pages) |
| Anything else | Either give it a real target or disable the click visibly. NEVER a dead route |
- Make as many nodes clickable-and-routing as possible.
- Tag chips on project/system-design pages route BACK here: zoom and focus that node and highlight its edges (Section 12.4). This deep-link (node id in the URL/query) must be supported.

### 10.4 Dynamic data
- The graph reads from the knowledge/content layer, not a frozen JSON snapshot: when new content is ingested (new project MD, new skill, new cert), nodes and edges update. Implement as: build-time regeneration of graph data from `portfolio-assets/content/` frontmatter + the RAG ingest script updating the same source. Document the data flow in STATE.md.
- EVERY skill in `skills.md` must exist as a node.

### 10.5 Acceptance (R3 gate)
- Brain intro side-by-side comparable to the reference imagery (gloss, shine, neuron detail).
- No white-lamp artifact, no cheap portal transition.
- Description card shows for every node, center-left, translucent.
- Click contract verified for every node type; zero dead routes (automated route check across all node hrefs).
- Hover highlight preserved; hover zoom/motion added; category colors correct; firewall re-validated in data (no employer -> system_design direct edge).

---

## 11. EXPERIENCE (new dedicated page) + ABOUT (Phase R4)

> "The about section and Experience section are fucking same!!! Just tagged with different / params. The Experience deserves a Seperate Page of itself."

### 11.1 Experience page (`/experience`)
- Its own route, its own layout. Background: Flow Wave Green (it is a dedicated page).
- This is where the FDE claim is made OPENLY (resume/LinkedIn were restrictive because he lacked the official title; the portfolio has more freedom). Include an explicit **Forward Deployed Engineering section** with tags, bullets, and proof drawn from real content: customer-facing work, architecture-level work, cost optimization, cloud optimization, LLM token optimization, infrastructure optimization, low-level code optimization, customer negotiations, stakeholder interactions. All claims trace to content files; no invented proof.
- **Wikipedia-style inline links:** in all descriptions, project names and click-worthy keywords render as colored hyperlinks (visibly distinct link color) with a hover caption dialog ("Click here to explore this project in detail"), routing to the relevant project page, section, or Mind Map node.
- Experience entries render as the site card system (Section 12.1) or rich sections; each entry links to its detail.

### 11.2 About page (`/about`)
- Background: Wave Galaxy + starfield.
- Bio and the 7-year arc (Mphasis -> HPE -> Coforge), employer anchors preserved (`#coforge`, `#hpe`, `#mphasis`).
- **Experience strip inside About:** Infinite Moving Cards (source: `template_repos/textura_templates/infinite_moving_cards`) built from TERMINAL-STYLE cards. Hover pauses the marquee (reuse the template's built-in pause-on-hover property). Click routes to `/experience` (or the specific entry).
- **Skills section (`#skills`):** Infinite Moving Cards of skills. This was specced before and is MISSING in the current build; that is a bug to fix. Every skill here also exists as a Mind Map node (10.4). Skill chips/cards link to the Mind Map node focus.
- **Certifications:** terminal-styled cards. Each certification and education milestone gets a dedicated page (brief description + related projects); blurbs are content stubs until Niranjan supplies them; the pages exist with honest stub states, never lorem ipsum, never fabricated descriptions.

---

## 12. SITE-WIDE CARD SYSTEM AND INTERLINKS (Phase R1 foundation)

### 12.1 One card system
> "I wanted these Cards where we list the Projects to be Terminal styled with a flip animation having a short caption like description and it flips on hover and on Click Redirects to its Dedicated project page."

- ALL project, experience, and certification cards = TERMINAL-STYLED cards from `template_repos/textura_templates/terminal_card` (Aceternity Terminal styling; code + master prompt in the folder). This is THE card style across the site.
- Behavior: short caption/description on the front; FLIP animation on hover revealing the back; CLICK routes to the dedicated page.
- Typewriter effect inside terminal cards where content types out.
- Font inside cards obeys Section 6: terminal aesthetic, never at the cost of size/legibility.
- Container Scroll is REMOVED everywhere except the Saarthi mobile/web view (Section 13.4).

### 12.2 Prior card features that still apply (from RENOVATION_DIRECTION_v2, not revoked)
- Top bar = Org/Project + title (e.g., "COFORGE - Senior Agentic AI Engineer").
- Functional window controls where used on experience cards: maximize -> larger scrolling terminal; minimize -> collapsed drilldown; card-count indicator top-right.
- Separate MD content for normal vs maximized states.
- If any of these fight the new hover-flip contract on a given surface, prioritize the hover-flip contract (latest feedback) and note the cut in STATE.md.

### 12.3 Component consistency
Allowed interaction systems: terminal flip card, 3D photo card (landing only), Card Spotlight (System Design node details + Dashboard), Infinite Moving Cards (About skills + experience strip), Slider Spectra (project View sections), premium button. One shared design language (palette lanes, type system, motion curves). Nothing else gets invented; no component zoo.

### 12.4 Tag chips (site-wide interlink, currently a bug)
> "Why are the tags in the Pages not clickable? Didnt we discuss it must redirect to the Mindmap section and zoom and focus to that node and highlight its edges."

- Every tag chip on project and system-design pages is CLICKABLE and routes to the Mind Map, zooming/focusing that node and highlighting its edges (deep-link per 10.3). Chips use the premium hover style. Zero dead chips.

---

## 13. PROJECT PAGES (Phase R5) `[REVIEW GATE]`

Background: Flow Wave Green on the hub and every project page.

### 13.1 Projects hub
- Grid/arc of terminal flip cards (12.1), one per project, grouped: Work Experience projects vs Independent projects. Click -> dedicated page.

### 13.2 Per-project structure (tabs / sub-routed sections)
1. **Overview / Description** (the project's home): title, one-line positioning, status badge (shipped / piloted / in development / reference), problem -> approach -> outcome with real metrics only, stack row, GitHub link if available.
2. **System Design** tab: that project's diagram (interactive or static per the canonical table), firewall framing where applicable.
3. **Product Design** tab: the product angle plus a few product frameworks applied to it (content from MD files; stub honestly where thin).
4. **View** tab (pick a professional label such as "Product Walkthrough" or "Live Preview"; record the chosen label in STATE.md and use it consistently): live link if available, otherwise wireframe/screenshot showcase.
5. **GitHub** link if the repo is public.

### 13.3 View tab mechanism: Slider Spectra
> "SURGICALLY do this, DONT MAKE THE SAME MISTAKE OF Reducing it to a Basic Bland Black and Green thing. Keep this as is."

- Source: `template_repos/textura_templates/slider_spectra/slider_spectra.md` (official master prompt). Port essence-preserving.
- Required surgical changes ONLY:
  - The focused/centre card is considerably LARGER with a zoom-in effect; the others sit blurred behind it (out-of-focus depth effect).
  - The caption CHANGES per screenshot (the template's caption is static); a description renders below the caption per screenshot.
- Screenshots are individual PNG/WebP files in the project's asset folder, not compiled PDFs. All are content stubs until supplied (Loop Copilot images must be scrubbed first, Rule 3).

### 13.4 Saarthi exception: Mobile vs Web view
- Saarthi's View tab offers TWO view modes: Mobile and Web.
- Mobile view: the 3D mockup animator at `template_repos/remix-3d-mockup-animator` (strip its export-tool chrome per the old 04 spec; keep the phone + orbit; bundle Saarthi screens as the texture). Check and honor the Sketchfab iPhone model license (attribution line in footer if CC-BY).
- Container Scroll is allowed HERE ONLY, for the mobile-vs-web presentation.
- Every other project's View tab uses Slider Spectra alone.

### 13.5 Loop Copilot specifics
- Live at loopcopilot.cc: link out from the View tab.
- DG-5 default: animated Macbook Scroll on the Overview tab (real animation, real screenshot, never a static B&W frame), Slider Spectra in View.

### 13.6 Canonical project table (single source of truth)
| Project | Page | Card group | Diagram |
|---|---|---|---|
| Loop Copilot | yes | Independent | interactive |
| Saarthi | yes | Independent | static (+ mobile/web mockup) |
| Rebalancer | yes | Independent | static |
| QE Platform | yes | Work Experience | interactive (firewall-framed) |
| HPE Conversational RAG Chatbot | yes | Work Experience | semi-interactive |
| Global Census Chatbot (HPE) | yes | Work Experience | static |
| Jarvis AI | draft (hidden, no nav/graph/search exposure) | Independent | static |

HPE RAG Chatbot and Global Census Chatbot content is a stub (Section 16): pages exist with honest "content in progress" states until content arrives. Semi-interactive = interactive node-detail popovers on a static layout (no full React Flow buildout) unless content supports more.

---

## 14. SYSTEM DESIGN PAGE (Phase R6)

- Background: Flow Wave Green.
- Header framing (verbatim intent, keep): "Reference Architectures: how I would build systems like these. Pattern-level diagrams using industry-standard primitives. No proprietary names."
- Interactive diagrams (Loop Copilot first, then the QE reference architecture): custom-styled React Flow, DISTINCT icons per node type (identical icons were a named defect). Node click opens a premium **Card Spotlight** with a maximum of 4 one-line bullets on how the tool/tech was used differently (e.g., RAG pipeline: hybrid rank, reranking, semantic caching layer).
- Plane filters: Data plane / Control plane / Observability, plus where relevant Deployment, Database Schema, Agentic Orchestration Flow.
- Static diagrams (Saarthi, Rebalancer, Census): clean embedded images (Eraser AI or Excalidraw exports); image assets are content stubs until supplied.
- 1 to 2 paragraph description per project. Tags section: clickable chips -> Mind Map node zoom/focus (12.4). All buttons use the premium style.
- Firewall: every diagram and caption is "how I would build", generic primitives, zero employer/client/proprietary names. Automated string-check for employer names in this route's rendered output.

---

## 15. DASHBOARD (Phase R7) and CHATBOT (Phase R8) `[REVIEW GATE on chatbot]`

### 15.1 Dashboard
> "the Dashboard As You can see doesnt look Interactive and Is Very Bland and we are wasting the space on the bottom of these number cards."

- Background: Flow Wave Green. Cards: Card Spotlight style.
- Metric cards are CLICKABLE (route to the relevant project/section). Fill the dead space below the number cards with interactive elements: e.g., a filterable stack/skills breakdown, a projects-by-status view, clickable category tiles. Choose 2 to 3, propose at the gate; do not leave the space empty.
- Real numbers only where they exist in content; anything else is a clearly badged placeholder ("Sample data" badge visible in the UI). Firewall applies.

### 15.2 Chatbot (ask_niranjan)
> "IT IS THE WEIRDEST LOOKING OUT OF ALL. Make it look Good, Aesthetic, Symmetrical and Premium in UI style and elements and also Make it stand out."

- Full UI rebuild: premium, symmetrical, standout chat surface. Fix layering/isolation completely (no mode/page bleed-through, correct z-index stacking, focus trap while open).
- Openable from: the nav-adjacent entry, AND the button on the landing 3D photo card (9.2).
- Background: Wave Galaxy.
- Stack: JS/Next route handlers + Groq + Supabase pgvector RAG. Model-agnostic config (provider/model in config), default Groq + Llama. Secrets via env only.
- Guardrails: on-topic only, answers in Niranjan's voice from the corpus, refuses/redirects when unknown ("I haven't documented that here, you can reach me at niranjan.vsks@gmail.com"), zero fabrication, firewall respected in answers.
- FAQ ready-buttons: preset questions as chips; they feed the assistant and return consistent cached answers (cache the FAQ answers; regenerate cache on content re-ingest).
- Rate limiter on the API route. No persisted session history (in-memory last turns within the open session for follow-ups is acceptable; nothing stored).
- **BLOCKER:** `interview/*.md` persona files are EMPTY. The chatbot stays honest-but-thin until Niranjan fills them. Ship the pipeline + UI; the tone gate re-runs after content lands.

---

## 16. BLOCKED ON NIRANJAN (honest stubs, never fabricated)

Render each as a clean "In development" / "Content in progress" state or a visibly badged placeholder. List in STATE.md and keep updated.

1. `interview/*.md` voice content (chatbot persona blocker).
2. Project + wireframe screenshots, including SCRUBBED Loop Copilot images (Lenovo data + email removed).
3. HPE Conversational RAG Chatbot + Global Census Chatbot page content.
4. Photo for the landing 3D card.
5. Typing sound asset (sound stays muted-by-default regardless).
6. Saarthi / Rebalancer / HPE diagram images (static diagrams).
7. Per-node bullets for interactive diagram Card Spotlights (beyond what content files support).
8. Certifications / education blurbs.
9. AI Labs content.
10. Real dashboard numbers beyond what content files carry.

---

## 17. TEMPLATE MANIFEST (paths, type, destination)

All under `template_repos/textura_templates/` unless noted. "Source" = real code present; "Prompt" = master prompt only (build from it, essence-preserving). Verify type on disk at R0 and record in STATE.md.

| Template | Path | Used for |
|---|---|---|
| terminal_card | textura_templates/terminal_card (source + master prompt) | THE card style site-wide; landing orbit cards |
| slider_spectra | textura_templates/slider_spectra/slider_spectra.md (prompt) | Project View sections |
| solaris | textura_templates/solaris (source) | Contact background |
| infinite_moving_cards | textura_templates/infinite_moving_cards (source js) | About skills + experience marquee |
| flow-wave | textura_templates/flow-wave (source + prompt) | Default page background (reuse the good v1 port) |
| brain + neuron_landing_page (+ neural-monitor) | textura_templates/brain, neuron_landing_page | Mind Map intro |
| 3d_card_photo | textura_templates/3d_card_photo (source js) | Landing photo card |
| Layout_flipping_text | textura_templates/Layout_flipping_text | Landing headings |
| encrypted_text.md | textura_templates/encrypted_text.md (prompt) | Text reveal effect (resized per Section 6) |
| gooey_search | textura_templates/gooey_search | Smart search input |
| card_spotlight | textura_templates/card_spotlight | Diagram node details + Dashboard cards |
| Hover_button | textura_templates/Hover_button | Superseded for main buttons by the Hover Border Gradient system (Section 6.2); may serve tag chips if it matches the design language, else unused |
| ascend / helios | textura_templates/ascend (or helios) | Globe source + landing layout reference |
| Container_Scroll | textura_templates/Container_Scroll | Saarthi mobile/web view ONLY |
| remix-3d-mockup-animator | template_repos/remix-3d-mockup-animator (repo root) | Saarthi phone mockup |
| Macbook Scroll (Aceternity) | per old 04 spec | Loop Copilot Overview (DG-5) |
| Wave Galaxy | existing v1 asset/port | About + Chatbot background |

Port protocol (Section 4) applies to every row. If a listed path does not exist on disk, STOP and flag; do not substitute a lookalike silently.

---

## 18. BUILD PHASES (R0 to R12)

Update `bullseye/STATE.md` after every phase. Gates marked. Mechanical `/goal` target after every phase: build exits 0, lint clean, no TS errors, zero dead routes across nav, footer, cards, chips, and mind-map hrefs, no console errors on touched routes.

- **R0. Intake + hygiene.** Read this PRD fully. Verify every template path (Section 17) and content path on disk; record source-vs-prompt status. Reconcile STATE.md. Strip any remaining internal notes from rendered copy. Fix known repo issues (map-page location, resume path). List Decision Gate statuses.
- **R1. Global foundation.** Typography overhaul, premium button system, top nav, footer, background wiring (Flow Wave default plumbing), terminal card component (the one true card), interlink primitives (tag chip -> mind map deep link; wiki-style hyperlink component with hover caption).
- **R2. Landing.** Section 9. `[REVIEW GATE]`
- **R3. Mind Map.** Section 10. `[REVIEW GATE]`
- **R4. Experience + About.** Section 11 (plus certification/education pages as stubs).
- **R5. Projects hub + project pages.** Section 13. `[REVIEW GATE]`
- **R6. System Design.** Section 14.
- **R7. Dashboard.** Section 15.1.
- **R8. Chatbot.** Section 15.2. `[REVIEW GATE]` (tone gate re-runs after interview content lands)
- **R9. Contact.** Solaris background port, contact info, resume CTA, honest globe-free layout per latest direction (the globe lives on the landing now; Contact is Solaris + info + resume).
- **R10. Smart search.** Section 8.2, indexed over all shipped content.
- **R11. Performance + accessibility.** Section 5 contract end-to-end: quality tiers, pause off-screen, loaders, mobile fallbacks, reduced-motion, image optimization, bundle audit, leak cleanup.
- **R12. Verify + ship.** Full audit: zero reachable errors crawl (every clickable path), copy audit (no em-dashes, no banned phrases, no fabricated metrics, no internal notes), firewall string-check, status labels present, SEO/OG tags, deploy to Vercel, production smoke test, final STATE.md with remaining Niranjan stubs. `[REVIEW GATE]`

---

## 19. FINAL WORD TO THE IMPLEMENTER

Two builds failed the same way: silent downgrades. The single most important behavior change is this: **when a port is hard, stop and say so.** A flagged blocker costs a day. A silently gutted template costs the whole round, plus trust. Niranjan's exact words, keep them in view while you work:

> "I AM AGAIN DISSATISFIED WITH WHAT YOU MADE AND I NEED REVAMPING."

> "Whatever you do, Make it look Clean and Premium, Not a College project doodle."

Ship it like clockwork.

---

## 20. VERIFICATION PROTOCOL (PLAYWRIGHT) — MANDATORY, EVERY PHASE
Playwright MCP is already integrated in this repo. Use it. Two layers, both required. A phase is NOT done until both pass.
### 20.1 Layer 1: Scripted suite (mechanical, committed to repo)
Write a Playwright test suite at `tests/verify/` in R0 and extend it every phase. It runs inside the `/goal` loop. It must:
1. Crawl every route from nav, footer, cards, tag chips, and every href in the mind-map data. Assert zero 404/400/401/500.
2. Assert zero console errors and zero uncaught exceptions on every route.
3. Firewall string-check: assert no employer/client names (Coforge, HPE, Mphasis, Lenovo, Worktop) appear in the rendered HTML of `/system-design` and any diagram surface.
4. Copy audit: assert no em-dashes and no banned phrases (Section 2, rule 8) in rendered user-facing text.
5. Capture a full-page screenshot of every route into `verification/screenshots/phase-RX/` per phase. These are the review artifacts.
6. Interaction smoke checks per phase: card flips on hover, tag chip routes to mind map with node focus, search returns and routes, chatbot opens from both entry points, no dead clicks.
### 20.2 Layer 2: Visual comparison review (judgment, via Playwright MCP)
This targets the silent-downgrade failure directly. For EVERY template port:
1. Render the ORIGINAL template from `template_repos/` source (run its own demo page locally). Screenshot it.
2. Screenshot the ported version in the site at the same viewport.
3. Compare side by side. Write the differences into STATE.md as a list: material, glow, depth, resolution, motion presence, layout.
4. If the port is visibly flatter, dimmer, lower-res, or less alive than the source, the port has FAILED. Fix or flag at the gate. "Looks fine to me" in isolation is not a verdict; only the side-by-side comparison counts.
### 20.3 Motion verification
Screenshots cannot judge smoothness. For every animated surface:
- Sample frame timings via `page.evaluate` (requestAnimationFrame deltas over 3 seconds). Assert an average >= 55fps on the dev machine; log the number in STATE.md.
- Capture 3 screenshots at t=0s/1s/2s to confirm motion exists (typewriter progressed, orbit moved, marquee scrolled).
### 20.4 Headless WebGL caveat
Headless Chromium falls back to SwiftShader (software GL). Renders can look darker, lower-res, or fail while being fine on a real GPU. Run verification HEADED (or with GPU flags). Treat "broken only in headless" as a manual-verify flag, not an auto-fail. Never tune visual quality against a SwiftShader render.
### 20.5 What this does NOT replace
Human review gates (R2, R3, R5, R8, R12) still stand. This protocol reduces review rounds; it does not grant permission to skip gates. Niranjan is the taste authority. Screenshot evidence goes TO the gate, it does not close it.
