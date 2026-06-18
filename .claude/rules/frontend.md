---
name: frontend
description: Frontend conventions for portfolio-nir. Applies to all UI work.
---

# Frontend rules (portfolio-nir)

## Design system (authoritative: bullseye/01)
- Dark only. No light mode, no theme toggle. Strip light-mode classes from any reused template.
- Palette lanes — each color has ONE job, never cross:
  - `#0A0A0A` base · `#4ADE80` green = identity (terminal/UI/active/CTAs/links)
  - `#00E5FF` cyan + blue family = 3D/depth scenes only
  - `#FF006E` magenta = sparing emphasis only (never a fill)
  - `#A78BFA` violet = Map-mode employer nodes only
  - blood red `#5C0A0A`–`#7A0F0F` = atmospheric depth only (never UI)
- Fonts: JetBrains Mono (UI/terminal/labels), Geist (body).
- shadcn primitives must be restyled to tokens; never ship default shadcn look.

## Reused templates
- Recolor everything to the tokens. Replace template fonts. Remove watermarks/demo chrome/light-mode.
- Any rainbow/HSL-cycling effect → constrain to a green↔cyan range.

## Copy
- No em-dashes in user-facing text. No banned phrases (see CLAUDE.md). No fabricated metrics; trace everything to portfolio-assets/content.

## Components
- Read page copy from the content loader (bullseye/07), never hardcode.
- Functions under ~50 lines; clean error handling on async; no console.log in shipped code.
- Accessibility: keyboard nav, focus states, alt text, honor prefers-reduced-motion.
