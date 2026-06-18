import type { Node, Edge } from "@xyflow/react";
import type { FlowNodeData } from "@/components/sections/FlowDiagram";

/**
 * Diagram data (bullseye/06). Liability firewall holds: generic primitives only,
 * "how I would build" framing, no employer/client/proprietary names.
 */

type N = Node<FlowNodeData>;

// --- Loop Copilot: event-sourcing vs vector-RAG + three-tier integration shell ---
export const loopCopilotNodes: N[] = [
  { id: "client", position: { x: 0, y: 40 }, data: { label: "client (web + chat)", plane: "control", rationale: "React 19 SPA and a chat surface. Sub-second response is non-negotiable for rep adoption." } },
  { id: "api", position: { x: 220, y: 40 }, data: { label: "async API gateway", plane: "control", primitive: "async web server", rationale: "Async throughout (FastAPI + Motor analogue). Sub-second responses; harder to debug than sync, worth it for adoption." } },
  { id: "events", position: { x: 220, y: 160 }, data: { label: "event store", plane: "data", primitive: "append-only event log", rationale: "Event sourcing over vector RAG for chat context. Live workflow events, portfolio, and recent history injected as structured JSON per request. Eliminates hallucinated memory." } },
  { id: "ctx", position: { x: 440, y: 160 }, data: { label: "context assembler", plane: "control", rationale: "Builds the per-request structured JSON context. Chat needs what just happened in the workflow, not what history embeds to." } },
  { id: "llm", position: { x: 660, y: 100 }, data: { label: "LLM (hosted)", plane: "control", primitive: "managed LLM", rationale: "Generates the activity summary and chat response from assembled context." } },
  { id: "tier1", position: { x: 0, y: 280 }, data: { label: "tier 1: tenant-native flows", plane: "data", primitive: "managed automation", rationale: "Primary integration path, authenticated by internal tenant identity. Designed within the customer's tenant trust model, not against external OAuth grants." } },
  { id: "tier2", position: { x: 220, y: 280 }, data: { label: "tier 2: direct REST", plane: "data", primitive: "REST + identity broker", rationale: "Secondary path for broader-permission environments via the platform identity library." } },
  { id: "tier3", position: { x: 440, y: 280 }, data: { label: "tier 3: session fallback", plane: "data", primitive: "browser session driver", rationale: "Fallback path. The three-tier strategy is more complex but cross-environment portable from day one." } },
  { id: "crm", position: { x: 660, y: 280 }, data: { label: "CRM of record", plane: "data", primitive: "enterprise CRM", rationale: "Target system. A multi-CRM expansion shell abstracts the destination so new CRMs slot in." } },
  { id: "obs", position: { x: 660, y: 200 }, data: { label: "telemetry + alerts", plane: "observability", primitive: "metrics + bot alerts", rationale: "Admin monitoring and alerting. Manager visibility into adoption was the second-highest request." } },
];

export const loopCopilotEdges: Edge[] = [
  { id: "e1", source: "client", target: "api" },
  { id: "e2", source: "api", target: "events" },
  { id: "e3", source: "events", target: "ctx" },
  { id: "e4", source: "ctx", target: "llm", animated: true },
  { id: "e5", source: "api", target: "tier1", label: "log activity" },
  { id: "e6", source: "api", target: "tier2" },
  { id: "e7", source: "api", target: "tier3" },
  { id: "e8", source: "tier1", target: "crm" },
  { id: "e9", source: "tier2", target: "crm" },
  { id: "e10", source: "tier3", target: "crm" },
  { id: "e11", source: "api", target: "obs" },
];

// --- Coforge reference: genericized agentic QE platform, multi-cloud beams ---
export const qeNodes: N[] = [
  { id: "ui", position: { x: 0, y: 120 }, data: { label: "QE workbench", plane: "control", rationale: "Reference UI. How I would build a per-user agent that infers role and surfaces the most-actionable view." } },
  { id: "orch", position: { x: 220, y: 120 }, data: { label: "agent orchestrator", plane: "control", primitive: "agent runtime", rationale: "Agentic RAG: agents find the user story, fetch linked epics and acceptance criteria, pull existing tests as in-context examples to match team style." } },
  { id: "graph", position: { x: 440, y: 40 }, data: { label: "knowledge graph", plane: "data", primitive: "graph database", rationale: "GraphRAG with entity normalization. Enterprise QA docs have entity relationships cosine similarity loses; the graph preserves them." } },
  { id: "vec", position: { x: 440, y: 200 }, data: { label: "vector store + rerank", plane: "data", primitive: "vector store", rationale: "Hybrid retrieval with reranking, context compression, metadata filtering, query rerouting. Drives hallucination toward single digits." } },
  { id: "tickets", position: { x: 220, y: 280 }, data: { label: "ticket sources", plane: "data", primitive: "issue tracker APIs", rationale: "Agentic RAG over the issue tracker to scope test generation. Generic primitive: no proprietary tool names." } },
  { id: "gen", position: { x: 660, y: 120 }, data: { label: "test generation + MCP", plane: "control", primitive: "tool server (MCP)", rationale: "Generates production-grade browser test scripts from natural language via a custom tool-server integration." } },
  { id: "guard", position: { x: 660, y: 220 }, data: { label: "guardrails + eval", plane: "observability", primitive: "eval harness", rationale: "Three-dimensional quality: acceptance-criteria coverage, test-design coverage, RAGAS. An audit-defensible scoreboard." } },
  { id: "rbac", position: { x: 0, y: 240 }, data: { label: "tenant-aware RBAC", plane: "control", primitive: "RBAC service", rationale: "Module-level CRUD-X permissions and role templates that onboard new tenants from their existing org charts." } },
  { id: "telemetry", position: { x: 880, y: 170 }, data: { label: "LLM observability", plane: "observability", primitive: "cost + quality telemetry", rationale: "Per-tenant token-level cost telemetry and context budgets tuned per tenant query patterns." } },
  { id: "aws", position: { x: 240, y: 420 }, data: { label: "cloud A", plane: "data", primitive: "managed cloud", rationale: "One platform, deployed into each customer's managed cloud, adapting identity per tenant." } },
  { id: "azure", position: { x: 440, y: 420 }, data: { label: "cloud B", plane: "data", primitive: "managed cloud", rationale: "Multi-cloud reference topology. Generic clouds A/B/C, no client mapping." } },
  { id: "gcp", position: { x: 640, y: 420 }, data: { label: "cloud C", plane: "data", primitive: "managed cloud", rationale: "Architecture and identity adapt to each tenant's cloud." } },
];

export const qeEdges: Edge[] = [
  { id: "q1", source: "ui", target: "orch" },
  { id: "q2", source: "orch", target: "graph", animated: true },
  { id: "q3", source: "orch", target: "vec", animated: true },
  { id: "q4", source: "tickets", target: "orch" },
  { id: "q5", source: "orch", target: "gen" },
  { id: "q6", source: "gen", target: "guard" },
  { id: "q7", source: "guard", target: "telemetry" },
  { id: "q8", source: "rbac", target: "ui" },
  { id: "q9", source: "gen", target: "aws", animated: true, label: "beam" },
  { id: "q10", source: "gen", target: "azure", animated: true, label: "beam" },
  { id: "q11", source: "gen", target: "gcp", animated: true, label: "beam" },
];

// --- Static (Mermaid) diagrams: Saarthi, Rebalancer ---
export const saarthiMermaid = `flowchart TD
  V[voice STT] --> O[master AI orchestrator]
  O --> L[money logging agent]
  O --> A[analysis agent]
  O --> E[education agent]
  O --> F[offer explanation agent]
  O --> KB[(curated regulatory-safe KB)]
  KB --> R[retrieval + guardrails]
  R --> O
  O --> G[guardrails: consent-first, non-transactional]
  G --> TTS[cloud TTS vernacular]
  TTS --> U((user))`;

export const rebalancerMermaid = `flowchart TD
  B[broker MCP: multi-asset] --> P[portfolio state]
  P --> S[11-signal decision framework]
  S --> LLM[LLM synthesis + explanation]
  LLM --> D[deterministic risk guardrails]
  D --> REC[recommendations only]
  REC --> H[human-in-the-loop approval]
  H -. no auto-execution .-> X[(broker)]`;
