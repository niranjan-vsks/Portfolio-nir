# 02 — ARCHITECTURE & STACK

## Routes (App Router)
```
/                      Cinematic mode (landing). Default entry.
/map                   Map mode (mind map). Lazy, ssr:false.
/terminal              Terminal mode.
/projects/[slug]       loop-copilot | saarthi | rebalancer | qe-platform
/system-design         Reference architectures (2 interactive + 2 static)
/about                 Bio + experience (employer anchors #coforge, #hpe, #mphasis)
/skills/[slug]         Thin skill-filter view (or redirect to # if deferred — see 05)
/contact               Globe + contact + resume download
/work-with-me          Optional, noindex (see 09)
```

## Folder conventions
```
src/
  app/                 routes
  components/
    3d/                R3F components (hero scene, particles, cards, globe, mockup)
    mindmap/           MindMap3D.tsx (provided)
    sections/          page sections
    ui/                restyled shadcn primitives
  lib/
    content.ts         loads + parses portfolio-assets/content/*.md
    rag/               embedding + retrieval for the chatbot
content/data/          mindmap-data.json (provided)
portfolio-assets/
  content/             section MD files (site + RAG source of truth)
public/                NIRANJAN_VSKS_Resume.pdf, project screenshots, 3D models
template_repos/        remix-* source folders (read-only reference)
```

## THE UNIFIED-CANVAS RULE (most important architectural constraint)
The Cinematic hero is **one** R3F `<Canvas>`. Inside it: the particle field, the 4 project cards, the dissolve-burst, and the ambient astronomical elements all live in the same scene and share the same particle system.

Do NOT:
- Instantiate the interactive-card template as 4 separate full-screen Three.js scenes (4 WebGL contexts = perf failure).
- Give the burst its own particle system separate from the background field (the burst must dissolve a card into the *same* stars behind it).

Do:
- Port the card template's tilt/flip/glow *mechanic* into card meshes inside the shared canvas.
- Drive the burst by re-using the background field's particles.

## Raw-Three → React rule
The mind map is already React (react-force-graph-3d). The other templates (`remix-interactive-3d-card-with`, `remix-minimalist-3d-business-card`, `remix-3d-mockup-animator`, `remix-vanta-digital-atelier`, `remix-blue-marble-globe`) are raw Three.js / vanilla JS. Port each into a React/R3F component:
- No `document.body.appendChild`, no global `window` listeners that leak. Use R3F hooks (`useFrame`, `useThree`) and clean up in `useEffect` returns.
- Lazy-load every 3D component (`next/dynamic`, `ssr:false`) and Suspense-wrap with a terminal-styled loader.
- Disable 3D below 768px (see `.claude/rules/3d-performance.md`); show the documented fallback.

## Content as source of truth
`portfolio-assets/content/*.md` drives both the rendered site and the chatbot RAG. Never hardcode page copy in components; read it from content. See `07`.
