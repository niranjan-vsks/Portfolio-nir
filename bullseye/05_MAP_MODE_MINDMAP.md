# 05 — MAP MODE (mind map)

The provided implementation is the base. Do not rebuild it on the Omma template; the Omma template is a VISUAL REFERENCE only.

## Provided files (place exactly here)
| Provided file | Destination |
|---|---|
| `mindmap-data.json` | `content/data/mindmap-data.json` |
| `MindMap3D.tsx` | `src/components/mindmap/MindMap3D.tsx` |
| `map-page.tsx` | `src/app/map/page.tsx` (lazy, ssr:false) |

Install: `npm i react-force-graph-3d three` and `npm i -D @types/three`.

Data: 59 nodes, 117 links. Types: `root | employer | domain | project | system_design | skill`. Every node has `href`. Validated: all links resolve; liability firewall intact.

## Engine decision (locked)
- **Engine = react-force-graph-3d** (robust, maintained, already wired with routing/firewall/hover/mobile/pause).
- **Look = ported from the Omma "3D Mind Map" template.** Achieve its glow by:
  - Customizing `nodeThreeObject` to render emissive, soft-glowing nodes (you may add a sprite halo).
  - Adding an `UnrealBloomPass` via `fgRef.current.postProcessingComposer()` (react-force-graph-3d exposes the composer). Tune bloom subtle, not blown-out.
- Recolor to palette: root `--green`, employers `--violet`, domains `--cyan`, projects/skills per the JSON. Edges low-opacity green.

## Interaction contract (already in the component; keep it)
| Node type | Click | Hover tooltip |
|---|---|---|
| root | no-op | role summary |
| employer | route `/about#[slug]` | role, tenure |
| domain | collapse/expand its skill children | domain desc |
| project | route `/projects/[slug]` | desc, status, hint |
| system_design | route `/system-design` | "how I would build" reminder |
| skill | route `/skills/[slug]` | skill, related |
- Any node hover: bump connected edges' width AND opacity.
- Pause/resume button; auto-pause on `prefers-reduced-motion`.
- Below 768px: replace 3D with the terminal-styled message + list (already in the component).

## LIABILITY FIREWALL (critical, enforced in data + must hold in copy)
```
employer → project → system_design        (allowed)
employer → system_design                  (NEVER, direct)
```
Coforge is named on the graph; its project node (AI Quality Engineering Platform) is named; `/system-design` is reachable from the project, never directly from Coforge. The system-design page is "how I would build" reference patterns, not Coforge's production architecture. Keep this separation in all copy.

## Deferred-route handling
`mindmap-data.json` references `/skills/[slug]`. If you do not build the skill-filter pages in this phase, change skill node `href` to `#` and disable click on skill nodes (do not ship dead routes). `/system-design` and `/about#[slug]` must exist.
