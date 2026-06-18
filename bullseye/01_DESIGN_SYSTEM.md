# 01 — DESIGN SYSTEM

Dark, terminal-cockpit aesthetic with a 3D cosmos out the window. Engineer-credible, not flashy. Distinctive, not templated.

## Palette (each color has ONE lane — do not cross lanes)

| Token | Hex | Lane (only use here) |
|---|---|---|
| `--bg` | `#0A0A0A` | Base background everywhere |
| `--green` | `#4ADE80` | IDENTITY: terminal text, UI accents, active states, primary CTAs, links. This is the through-line that makes the site cohesive. |
| `--cyan` | `#00E5FF` | 3D/particle scenes, depth highlights, secondary accents |
| `--blue-*` | `#1E3A8A`→`#3B82F6` | 3D scene depth (the bluish Vanta field lives here) |
| `--magenta` | `#FF006E` | Sparing: critical/hover emphasis only. Never a fill. |
| `--violet` | `#A78BFA` | Employer nodes in Map mode ONLY |
| `--blood-red` | `#5C0A0A`→`#7A0F0F` | Atmospheric depth only (distant nebula glow, scene falloff). Never a UI/accent color. |
| `--text` | `#E5E7EB` | Body text |
| `--text-dim` | `#9CA3AF` | Secondary text |

Rule: if a color is about to be used outside its lane, stop. Cohesion comes from green+dark being everywhere and the blues/cyan being reserved for the 3D depth.

## Typography
- **JetBrains Mono** — all terminal text, UI chrome, code, labels, nav, buttons, the typewriter intro. This is the dominant voice.
- **Geist** (or Inter fallback) — long-form body copy on project/about pages.
- Scale: terminal/UI 13-14px; body 15-16px; headings via a modular scale (1.25). Generous line-height (1.6) on body.

## Motion principles
- Purposeful, not decorative. Entrances ease-out ~300-500ms.
- Respect `prefers-reduced-motion` everywhere: disable particle motion, typewriter auto-runs to end, ambient space elements freeze.
- The typewriter effect (terminal intro) stays: text types out with a blinking `_` cursor.

## Recolor rule for ALL reused templates
Every template in `template_repos/` ships with its own colors/fonts. Strip them. Re-map to the tokens above:
- Template blues/purples → `--cyan`/`--blue-*`.
- Any gold/warm metallic → `--green` or `--cyan`.
- Any rainbow/HSL-cycling effect → constrain to a green↔cyan hue range.
- Template fonts → JetBrains Mono (UI) / Geist (body).
- Remove every light-mode class and theme toggle.

## Layout
- Max content width ~1100px on text pages; full-bleed on 3D modes.
- Consistent 8px spacing grid.
- shadcn/ui primitives, restyled to tokens (do not ship default shadcn look).
