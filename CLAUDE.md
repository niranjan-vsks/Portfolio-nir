# CLAUDE.md — portfolio-nir

This is the FDE portfolio of Niranjan VSKS (Senior Agentic AI Engineer).
You are building a cutting-edge, production-grade portfolio. Read this file fully, then read `bullseye/00_MASTER_BUILD_PROMPT.md` and execute the phased build it defines.

## Authoritative spec
The `bullseye/` folder is the single source of truth. Read all of it before building. On any conflict between a skill, a template, or your own assumption and these files, **the spec wins.**

Order to read:
1. `bullseye/00_MASTER_BUILD_PROMPT.md` (orchestration, phases, review gates)
2. `bullseye/01_DESIGN_SYSTEM.md`
3. `bullseye/02_ARCHITECTURE_STACK.md`
4. `bullseye/03_HERO_AND_MODES.md`
5. `bullseye/04_TEMPLATES_INTEGRATION.md`
6. `bullseye/05_MAP_MODE_MINDMAP.md`
7. `bullseye/06_PROJECT_AND_SYSTEM_DESIGN.md`
8. `bullseye/07_CONTENT_MODEL_AND_RAG.md`
9. `bullseye/08_CHATBOT_ask_niranjan.md`
10. `bullseye/09_CONTACT_AND_FREELANCE.md`
11. `bullseye/10_VERIFY_AND_SHIP.md`

## Global non-negotiables (apply everywhere, every phase)
1. **No fabrication.** Every metric, claim, and architecture detail must trace to `portfolio-assets/content/`. Never invent numbers, clients, or capabilities. If content is missing, leave a `TODO(niranjan)` placeholder; do not guess.
2. **No em-dashes in any user-facing copy.** Use colons, periods, or parentheses. Em-dashes read as an AI tell to this audience.
3. **Banned phrases (never write):** "transition/transitioning", "at the intersection of", "bypassed ... OAuth" (use "within the customer's tenant trust model"), "fine-tuning" (use "multi-layer compliance architecture"), and hedge phrases ("comfortable owning", "where needed", "when the situation calls for it").
4. **Dark only.** No light mode, no theme toggle. Strip any light-mode code from reused templates.
5. **Palette lanes** (see 01): each color has one job. Do not introduce colors outside the system.
6. **Liability firewall** (see 05 and 06): no surface ever links a named employer directly to system-design internals. Always employer → project → system_design. System-design copy is always "how I would build", reference-pattern framing, generic primitives only, no client/employer/proprietary names.
7. **Reuse, do not rebuild.** The `template_repos/` folders are the implementation base. Adapt them; do not regenerate from scratch.
8. **Skills supplement, spec governs.** Use `frontend-design`, `3d-web-experience`, `performance-optimizer`. Do not auto-load unrelated skills from the global skill library. Do NOT use Superdesign in the autonomous build (it needs interactive login).
9. **Performance budget** (see `.claude/rules/3d-performance.md`): Lighthouse performance >= 90 on the landing route.

## Review gates
Stop and surface for human review at every step marked `[REVIEW GATE]` in the master prompt. Do not proceed past a gate without approval.