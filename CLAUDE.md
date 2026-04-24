# Portfolio — Niranjan VSKS

Personal portfolio for **Niranjan VSKS**, Agentic AI Architect transitioning to AI PM.
Positioning: demonstrate systems thinking, AI product decisions, and hands-on AI engineering.
Domain: niranjanvsks.xyz | Deploy: Vercel

---

## Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.3 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Fonts | Geist Sans + Geist Mono | via next/font/google |
| Deploy | Vercel | — |
| AI | Anthropic Claude API | claude-sonnet-4-6 |
| Package manager | npm | — |

---

## Folder Structure

```
src/
  app/
    layout.tsx          # Root layout — fonts, metadata
    page.tsx            # Home page
    globals.css         # Tailwind + CSS vars
    (sections)/         # Route groups for each portfolio section
  components/           # Shared UI components (create as needed)
  lib/                  # Utilities, API clients, data helpers
public/                 # Static assets
.claude/                # Claude Code infrastructure
```

---

## Dev Commands

```bash
npm run dev       # Start dev server — localhost:3000
npm run build     # Production build
npm run start     # Serve production build
npm run lint      # ESLint (flat config, eslint.config.mjs)
npx tsc --noEmit  # Type-check without emitting
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key for chatbot copilot | Yes (when building chatbot) |

Add to `.env.local` (never commit). Document in `.env.example`.

---

## Planned Sections

1. **Decisions I Made** — Feed of product/architectural decisions with context and rationale
2. **Case Study Mind Maps** — Interactive mind maps for deep project breakdowns
3. **AI Stack Explorer** — Visual explorer of AI tools, models, and architectures
4. **Chatbot Copilot** — Anthropic API-powered assistant that knows Niranjan's work

---

## Design Tokens

```css
/* Light */
--background: #ffffff;
--foreground: #171717;

/* Dark */
--background: #0a0a0a;
--foreground: #ededed;
```

**Palette**: zinc scale (zinc-50 through zinc-950)
**Fonts**: `var(--font-geist-sans)` for body, `var(--font-geist-mono)` for code/labels
**Radius**: `rounded-full` for CTAs, `rounded-xl` for cards
**Dark mode**: `prefers-color-scheme` media query + Tailwind `dark:` classes

---

## API Contract (when routes are added)

```ts
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string, code: string } }
```

---

## Current Build Phase

**Phase 0 — Scaffold** (complete): Next.js + TypeScript + Tailwind initialized
**Phase 1 — Foundation** (next): Layout, nav, design system, section shells
**Phase 2 — Content**: Decisions feed, case study mind maps
**Phase 3 — Interactive**: AI stack explorer, chatbot copilot

---

Magic word to begin building: **BULLSEYE**
