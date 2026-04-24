---
paths:
  - "src/**/*.tsx"
  - "src/**/*.jsx"
  - "src/app/**/*.tsx"
  - "src/components/**/*.tsx"
---

## Component Patterns

- Functional components only — no class components
- Props typed inline with TypeScript interfaces above the component
- Default export for pages, named exports for shared components

## Styling

- Tailwind CSS 4 utility classes — no inline styles, no CSS modules
- Color palette: zinc scale (zinc-50 through zinc-950)
- Dark mode: `dark:` prefix classes, driven by `prefers-color-scheme`
- Spacing: Tailwind scale only (no arbitrary values unless truly necessary)
- Borders: `rounded-full` for buttons/pills, `rounded-xl` for cards
- Shadows: Tailwind shadow utilities

## Fonts

- Body: `font-sans` → `var(--font-geist-sans)`
- Code/labels/mono accents: `font-mono` → `var(--font-geist-mono)`

## State Management

- React `useState` / `useReducer` for local state
- No global state library until complexity demands it

## Next.js Conventions

- App Router — all pages in `src/app/`
- Server Components by default; add `"use client"` only when needed
- API routes in `src/app/api/[route]/route.ts`
- Use `next/image` for all images
- Use `next/font/google` for font loading

## Naming

- Components: PascalCase (e.g., `DecisionCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useDecisions.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Route folders: kebab-case (e.g., `ai-stack-explorer/`)

## No-Nos

- No hardcoded color hex values in JSX — use Tailwind tokens
- No `console.log` in committed code
- No `any` TypeScript type without a comment explaining why
