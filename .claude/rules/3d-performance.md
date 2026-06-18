---
name: 3d-performance
description: Performance rules for all Three.js / R3F work in portfolio-nir.
---

# 3D performance rules (portfolio-nir)

## Unified canvas (non-negotiable)
- The Cinematic hero is ONE R3F `<Canvas>`: particle field + 4 cards + dissolve-burst + ambient space elements share one scene and one particle system.
- Never instantiate multiple full-screen WebGL contexts on one route. The card template must be ported into card meshes in the shared canvas, not run 4x.
- The burst reuses the background field's particles (so a card dissolves into the same stars behind it).

## Loading & gating
- Lazy-load every 3D component (`next/dynamic`, `ssr:false`), Suspense-wrapped with a terminal-styled loader.
- Disable all 3D below 768px; render the documented fallback (terminal message + list).
- Freeze all motion (particles, ambient elements, autorotate, typewriter) under `prefers-reduced-motion`.

## Asset budget
- 3D models: GLB, Draco-compressed, < 5MB, poly count reasonable for web. Compress with gltf-transform.
- Cap `pixelRatio` (e.g. `Math.min(devicePixelRatio, 2)`).
- Ambient astronomical elements: low-poly, tiny geometry, slow, sparse. Atmosphere, not centerpieces.

## Measure & verify
- Target 60fps on a mid laptop; degrade gracefully on low-end.
- Lighthouse Performance >= 90 on `/`.
- Clean up: dispose geometries/materials and remove listeners in effect cleanups; no leaks.
- Measure before/after when optimizing (performance-optimizer skill); fix the biggest bottleneck first.
