# DESIGN.md — niranjanvsks.xyz design system

## Color (committed, dark, OKLCH-equivalent hexes in `globals.css`)
- `--bg #0A0A0A` base · `--surface #111317` · `--text #E5E7EB` · `--text-dim #9CA3AF` · `--border #1F2937`.
- **Identity:** `--green #4ADE80` (terminal text, primary CTA, links, active). One job; don't dilute.
- **3D depth lane:** `--cyan #00E5FF`, `--blue-900 #1E3A8A` (WebGL scenes, syntax accents).
- Sparing: `--magenta #FF006E` (emphasis, never fill). `--violet #A78BFA` (mind-map employer nodes). `--copper #4AA8FF` (brain). `--purple #A855F7` (particle sphere). blood-red = atmosphere only.
- Contrast: body text ≥4.5:1. Green on #0A0A0A passes; keep body on `--text` not `--text-dim`.

## Type
- **Geist** (sans) for display/headings/body/nav/buttons at the legibility floor (body 16px, labels 13–14px, line-height 1.6). Headings letter-spacing ≤ -0.02em.
- **JetBrains Mono** ONLY inside terminal surfaces (terminal cards, chatbot, code labels, syntax). This is authentic (literal terminal brand), not costume.
- Encrypted Text + Layout Text Flip kept, at legible sizes.

## Components (one system, no zoo)
- **Button:** `HoverBorderGradient` (travelling green border, text glow, lift, press-in). The only button.
- **Card:** `TerminalFlipCard` (macOS chrome + multi-color bash/YAML syntax + typewriter caption; flip on hover; click routes). Used for projects, experience, certs, landing orbit.
- **3D photo card:** real Aceternity `3d_card_photo` (landing only).
- **Card Spotlight:** System Design node detail + Dashboard cards.
- **Infinite Moving Cards:** About skills + experience marquee.
- **Slider Spectra:** project View tabs. **Solaris:** Contact bg. **Flow Wave Green:** default bg for every dedicated page except About (Wave Galaxy) + Contact (Solaris).
- **Interlink:** `WikiLink` (inline hyperlink + hover caption), `TagChip` (→ `/map?node=<id>`).

## Motion
- Ambitious first-load motion is allowed (brand): step-loader, globe orbit, brain zoom-dissolve. Ease-out (quart/quint/expo), no bounce. `prefers-reduced-motion` alt on everything (crossfade/instant).

## Bans honored (impeccable absolute + brand)
No side-stripe borders · no gradient text · no glassmorphism-as-default · no hero-metric big-number template (Dashboard must break it) · no identical card grids · no tiny-uppercase eyebrows on every section · no 01/02 numbered section scaffolding · no text overflow at any breakpoint.

## Verification
Playwright MCP (visual side-by-side vs template source) + `tests/verify/` scripted suite (route crawl, copy audit, firewall). Every phase runs both; screenshots → human gate.
