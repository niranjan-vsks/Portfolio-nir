# 04 — TEMPLATES INTEGRATION

For each folder, read the actual `index.html` / `.js` source (placeholders like package.json/README are noise). Reuse the core mechanic, apply the tweaks, port to React/R3F (`02`), recolor (`01`). The "Remix / Vary / Vary Colors" chrome from screenshots is Omma's site wrapper, NOT in the code; there is nothing to strip there.

## `template_repos/remix-vanta-digital-atelier` → hero particle field
- Use its particle rendering inside the unified hero canvas (`03`). Replaces the old stardust.
- Recolor bluish → `--cyan`/`--blue-*`. This system also feeds the card-dissolve burst.

## `template_repos/remix-interactive-3d-card-with` → project cards
- Port tilt + flip + edge-glow into 4 card meshes in the shared canvas (NOT 4 separate scenes).
- **Tweaks:** kill the rainbow HSL glow cycle (`hue = time*0.1`) → constrain to green↔cyan; recolor the blue/magenta materials to palette; remove the injected demo overlay `<div>`s ("3D Interactive Card", "Move mouse to rotate"); replace the canvas-drawn placeholder text ("ETHEREAL") with per-project data.
- **Add the frosted-image behavior:** the template's faces are opaque `MeshStandardMaterial` and have no image capability. Make the front face translucent/frosted (`transparent:true`, low opacity) and add an inner plane holding the project image, brightened/sharpened on hover.

## `template_repos/remix-minimalist-3d-business-card` → Contact page card
- Lock ONE environment (`void`); strip the 6-theme switcher and background-sphere chrome.
- Recolor the gold emblem (`0xc9a84c`) → `--green`/`--cyan` (no gold).
- Set real text via its FontLoader meshes: name, "Senior Agentic AI Engineer", email, site. Normalize font to JetBrains Mono.

## `template_repos/remix-3d-mockup-animator` → Saarthi project page (phone)
- This is a video-export tool; strip ALL of it: timeline, keyframes, Orbit/Zoom demos, Export, resolution toggles, "Upload Media", and the `localStorage` media library.
- Keep: the iPhone model + slow auto-orbit. Bundle Saarthi's real screens as the screen texture (from `public/`), not user-uploaded.
- **License:** the iPhone model is a Sketchfab model (credited ibrahim.Bhl). Confirm its license; if CC-BY, keep a one-line attribution in the site footer/credits. Do not silently strip attribution.
- Remove the "iPhone 17 / 3D Model Viewer" demo header.

## `template_repos/remix-blue-marble-globe` → Contact page globe
- Source: provided `main.js`. Already desaturated/blue (on-palette) — keep that shader.
- Remove the always-on "Drag to orbit · Scroll to zoom" hint; show it on **hover** instead. Keep the "Rotation: X° · Time: Xs" readout. Drop the 🌍 emoji + "Earth" label. Font → JetBrains Mono.

## Macbook Scroll (Aceternity) → Loop Copilot project page (web showcase)
- The laptop counterpart to Saarthi's phone. Use on Loop Copilot only.
- **Tweaks:** remove the `AceternityLogo` badge; replace the placeholder title and the `/linear.webp` src with a real Loop Copilot screenshot; strip the light-mode duality (`text-neutral-800 dark:text-white` → dark-only). It needs shadcn + Tailwind v4 + the tabler icons it imports.

## Mind map (react-force-graph-3d) → Map mode
Already React. See `05`. Visual glow from the Omma "3D Mind Map" template is ported in as a bloom pass (`05`), used as visual reference only.

## Global per-template checklist
Recolor to palette · strip demo chrome + any watermarks/light-mode · wrap raw-Three into React/R3F with proper cleanup · lazy-load · disable < 768px · no `localStorage` in artifacts/components.
