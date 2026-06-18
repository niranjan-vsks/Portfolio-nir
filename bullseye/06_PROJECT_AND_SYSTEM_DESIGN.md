# 06 — PROJECT PAGES & SYSTEM DESIGN

All copy/metrics come from `portfolio-assets/content/projects/*.md` and `system-design/*.md`. No fabrication. No banned phrases. No em-dashes.

## Project pages (`/projects/[slug]`)
Four: `loop-copilot`, `saarthi`, `rebalancer`, `qe-platform`.

Common structure per page:
1. Title + one-line positioning + status badge (live / piloted / in development / reference).
2. Problem → approach → outcome (real metrics only).
3. Stack row.
4. A signature visual (see below).
5. Link: `> view_system_design` → `/system-design` (anchored to that project's diagram where interactive).

Signature visuals:
- **saarthi** → phone mockup (`remix-3d-mockup-animator`, `04`). It was conceived mobile, shipped as a web MVP; show the screens in the phone.
- **loop-copilot** → Macbook Scroll (`04`), the web-app counterpart. Live at loopcopilot.cc; link out.
- **rebalancer** → static architecture image / Mermaid; status "in development"; surfaces recommendations, does NOT execute trades.
- **qe-platform** → generic, no client name; multi-cloud framing; links to its reference architecture.

Framing guardrails (carry from resume): Loop Copilot integration is "within the customer's tenant trust model" (never "bypassed OAuth"); Saarthi is "piloted" (not "deployed"); Rebalancer "surfaces recommendations" (no "45+ holdings", no "executes trades").

## System Design page (`/system-design`)
The FDE counterpart to PM framework cards. Header copy (use verbatim intent):
> "Reference Architectures: how I would build systems like these. Pattern-level diagrams using industry-standard primitives (Docker, AWS, message queues, vector stores, secrets managers). No proprietary names."

### Interactivity split (locked)
- **INTERACTIVE (build Loop Copilot FIRST, then Coforge):**
  - **Loop Copilot** — fully yours, zero NDA. Show event-sourcing vs vector-RAG decision, the three-tier integration pattern, the multi-CRM expansion shell. Use **React Flow** (clickable nodes, hover rationale, layer toggle: data plane / control plane / observability).
  - **Coforge reference architecture** — genericized agentic QE platform. NO Coforge/Worktop/client names, NO proprietary tools; only generic primitives. Use React Flow + **Aceternity "Animated Beam"** for the multi-cloud topology (one platform, beams to AWS/Azure/GCP). Frame strictly as "how I would build", reference pattern, not a deployed system.
- **STATIC (Mermaid):** Saarthi, Rebalancer. Clean diagrams, not interactive. (V2 may upgrade these with latency techniques.)

### Diagram content per interactive project
Architecture diagram + RAG pipeline breakdown (query → retrieval → rerank → context assembly → guardrails → LLM → output) + deployment topology. FR/NFR as typographic cards, not node graphs.

### Liability firewall (must hold here)
Reachable from project nodes, never directly from an employer name. Every diagram and caption uses "how I would build" / reference-pattern language. Generic primitives only. This protects you while still demonstrating senior architecture judgment.
