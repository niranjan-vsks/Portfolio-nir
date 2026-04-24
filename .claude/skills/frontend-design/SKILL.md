---
name: frontend-design
description: Apply exact design standards for this portfolio project. Use automatically when building any UI component, page, or layout.
user-invocable: true
---

## Design Identity

This is the portfolio of Niranjan VSKS — Agentic AI Architect transitioning to AI PM.
The aesthetic should signal: technical depth + product clarity + systems thinking.
Not a typical dev portfolio. Feels like a product, not a resume.

## Color Tokens

```css
/* Base */
--background-light: #ffffff;
--background-dark: #0a0a0a;
--foreground-light: #171717;
--foreground-dark: #ededed;

/* Zinc scale (primary palette) */
zinc-50:  #fafafa   /* light backgrounds, hover states */
zinc-100: #f4f4f5   /* card backgrounds light */
zinc-200: #e4e4e7   /* borders light */
zinc-400: #a1a1aa   /* muted text */
zinc-600: #52525b   /* secondary text */
zinc-800: #27272a   /* card backgrounds dark */
zinc-900: #18181b   /* surfaces dark */
zinc-950: #09090b   /* deep dark */
```

Accent color: to be defined by Niranjan. Placeholder: `#6366f1` (indigo-500).
Update this file once accent is confirmed.

## Typography

| Role | Class | Font |
|---|---|---|
| Display / Hero | `text-4xl font-semibold tracking-tight` | Geist Sans |
| Section heading | `text-2xl font-semibold` | Geist Sans |
| Body | `text-base leading-7` | Geist Sans |
| Label / Tag | `text-xs font-medium tracking-wide uppercase` | Geist Mono |
| Code | `font-mono text-sm` | Geist Mono |

## Spacing Scale

Follow Tailwind 4 spacing: 4px base unit.
Cards: `p-6` (24px). Section padding: `py-16 px-6`. Max content width: `max-w-3xl`.

## Component Patterns

**Cards**
```tsx
<div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
```

**Buttons — Primary**
```tsx
<button className="rounded-full bg-zinc-950 dark:bg-zinc-50 px-5 py-2.5 text-sm font-medium text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
```

**Buttons — Ghost**
```tsx
<button className="rounded-full border border-zinc-200 dark:border-zinc-800 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
```

**Tags / Pills**
```tsx
<span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-mono text-zinc-600 dark:text-zinc-400">
```

## Dark Mode

Always implement both. Use `dark:` prefix for every color utility.
System preference driven — no manual toggle unless Niranjan requests it.

## Interaction

- Hover transitions: `transition-colors` (150ms default)
- Focus states: visible ring — `focus-visible:ring-2 focus-visible:ring-zinc-950`
- No gratuitous animations. Motion only when it communicates something.

## Section Layout Pattern

```tsx
<section className="w-full max-w-3xl mx-auto px-6 py-16">
  <h2 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50 mb-8">
    Section Title
  </h2>
  {/* content */}
</section>
```
