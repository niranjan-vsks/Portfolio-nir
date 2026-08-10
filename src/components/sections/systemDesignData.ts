import type { Node, Edge } from "@xyflow/react";
import type { FlowNodeData } from "@/components/sections/FlowDiagram";

/**
 * System Design data .
 *
 * Firewall scope (narrow, per Niranjan 2026-07): ONLY the Coforge QE platform
 * is framed as a genericized "reference architecture / how I would build it"
 * (no client names, generic primitives). Every other project is shown as the
 * ACTUAL architecture. HPE facts trace to final_fde_resume.md and Niranjan's
 * authorized notes (Squidex + Confluence sources, ~1,700 docs, 20k concurrent
 * design target, dockerized AWS deployment; Census on Azure).
 */

type N = Node<FlowNodeData>;

export interface InterviewNotes {
  functional: string[];
  nonFunctional: string[];
  capacity: string[];
  tradeoffs: string[];
}

export interface SDSection {
  id: string;
  title: string;
  badge: string;
  intro: string;
  tags: string[];
  kind?: "flow";
  nodes?: N[];
  edges?: Edge[];
  height?: number;
  /** primary architecture render (official product icons); click maximizes */
  image?: string;
  /** toggle label for the primary image view (default "Architecture") */
  imageLabel?: string;
  /** optional second architecture render, toggled beside the first */
  image2?: string;
  image2Label?: string;
  /** optional label for the interactive React Flow view (default "Interactive explorer") */
  flowLabel?: string;
  /** one-line caption about how the element was built / how to use it */
  caption: string;
  interview: InterviewNotes;
  projectHref?: string;
}

// ---------------------------------------------------------------------------
// 01 · AI-Infused Agentic QE Platform (Coforge) — REFERENCE ARCHITECTURE.
// The only section under "how I would build it" framing.
// ---------------------------------------------------------------------------
const qeNodes: N[] = [
  { id: "ui", position: { x: 0, y: 130 }, data: { label: "QE workbench (React)", plane: "control", rationale: "Role-aware workbench. How I would build a per-user agent that infers role and surfaces the most-actionable view." } },
  { id: "rbac", position: { x: 0, y: 260 }, data: { label: "tenant-aware RBAC", plane: "control", primitive: "RBAC service", rationale: "Module-level CRUD-X permissions and role templates (QA Manager, Test Lead, QE Engineer) that onboard new tenants from their existing org charts." } },
  { id: "orch", position: { x: 230, y: 130 }, data: { label: "agent orchestrator", plane: "control", primitive: "agent runtime", rationale: "Agentic RAG: agents find the user story, fetch linked epics and acceptance criteria, and pull existing tests as in-context style examples." } },
  { id: "tickets", position: { x: 230, y: 280 }, data: { label: "issue tracker APIs", plane: "data", primitive: "Jira / ADO connectors", rationale: "Test generation is scoped against linked stories, epics, and acceptance criteria pulled live from the tracker." } },
  { id: "graph", position: { x: 460, y: 40 }, data: { label: "knowledge graph (Neo4j)", plane: "data", primitive: "graph database", rationale: "GraphRAG with entity normalization on Neo4j, with AWS Neptune as the managed alternative where a tenant prefers to stay inside their own AWS account. QA docs have entity relationships cosine similarity loses; the graph preserves them. Hallucination ~15% -> under 5%." } },
  { id: "vec", position: { x: 460, y: 200 }, data: { label: "vector store + rerank", plane: "data", primitive: "hybrid retrieval", rationale: "OpenSearch as the vector store over the tenant's own S3 corpus, reached through their AWS SSO. Query transformation, re-ranking, context compression, metadata filtering. The retrieval half of the sub-5% hallucination number." } },
  { id: "gen", position: { x: 690, y: 130 }, data: { label: "test generation + MCP", plane: "control", primitive: "custom Playwright MCP", rationale: "Natural language to production-grade Playwright/Cypress scripts through a custom tool-server (MCP) integration. Authoring time down ~75%." } },
  { id: "ci", position: { x: 690, y: 20 }, data: { label: "CI-integrated execution", plane: "control", primitive: "CI runner", rationale: "Generated suites execute inside the customer's CI, not a side channel, so results land where engineering already looks." } },
  { id: "guard", position: { x: 690, y: 250 }, data: { label: "guardrails + eval", plane: "observability", primitive: "eval harness", rationale: "Three-dimensional quality: Acceptance-Criteria Coverage, Test-Design Coverage, RAGAS. An audit-defensible scoreboard for budget reviews." } },
  { id: "telemetry", position: { x: 920, y: 190 }, data: { label: "LLM observability + FinOps", plane: "observability", primitive: "cost + quality telemetry", rationale: "Token-level cost telemetry per tenant and context budgets tuned per tenant query patterns. Stakeholders watch spend and quality live." } },
  { id: "llm", position: { x: 920, y: 60 }, data: { label: "LLM (AWS Bedrock class)", plane: "control", primitive: "managed LLM", rationale: "Low-complexity queries reroute to lighter models; context compression and prompt-payload reduction cut per-tenant spend." } },
  { id: "aws", position: { x: 280, y: 420 }, data: { label: "customer cloud A", plane: "data", primitive: "managed cloud", rationale: "One codebase, no forks: deployed into each customer's managed AWS/Azure/GCP tenant with compute sizing and identity adapted per cloud." } },
  { id: "azure", position: { x: 480, y: 420 }, data: { label: "customer cloud B", plane: "data", primitive: "managed cloud", rationale: "Identity per tenant: Azure AD, IAM, SSO adapted per cloud with no code fork." } },
  { id: "gcp", position: { x: 680, y: 420 }, data: { label: "customer cloud C", plane: "data", primitive: "managed cloud", rationale: "Reference multi-cloud topology; clouds stay generic A/B/C, no client mapping." } },
];

const qeEdges: Edge[] = [
  { id: "q1", source: "ui", target: "orch" },
  { id: "q2", source: "rbac", target: "ui" },
  { id: "q3", source: "orch", target: "graph", animated: true },
  { id: "q4", source: "orch", target: "vec", animated: true },
  { id: "q5", source: "tickets", target: "orch" },
  { id: "q6", source: "orch", target: "gen" },
  { id: "q7", source: "gen", target: "ci" },
  { id: "q8", source: "gen", target: "guard" },
  { id: "q9", source: "guard", target: "telemetry" },
  { id: "q10", source: "gen", target: "llm" },
  { id: "q11", source: "llm", target: "telemetry" },
  { id: "q12", source: "gen", target: "aws", animated: true, label: "beam" },
  { id: "q13", source: "gen", target: "azure", animated: true, label: "beam" },
  { id: "q14", source: "gen", target: "gcp", animated: true, label: "beam" },
];

// ---------------------------------------------------------------------------
// 02 · Enterprise Knowledge Assistant · Conversational RAG (HPE) — ACTUAL.
// AWS, dockerized, ALB, Squidex CMS + Confluence sources, designed for 20k
// concurrent users, hybrid retrieval + reranking.
// ---------------------------------------------------------------------------
const hpeNodes: N[] = [
  { id: "users", position: { x: 0, y: 150 }, data: { label: "support engineers (web portal)", plane: "control", rationale: "Enterprise support engineers querying internal process knowledge conversationally instead of hunting documents." } },
  { id: "alb", position: { x: 230, y: 150 }, data: { label: "application load balancer", plane: "control", primitive: "AWS ALB", rationale: "Fronts the dockerized chat API fleet; health checks + connection draining so rollouts never drop live chat sessions." } },
  { id: "api", position: { x: 460, y: 150 }, data: { label: "chat API (dockerized, autoscaled)", plane: "control", primitive: "containers on AWS", rationale: "Stateless dockerized services scaled horizontally behind the ALB; sized for a 20,000-concurrent-user design target." } },
  { id: "orch2", position: { x: 690, y: 150 }, data: { label: "RAG orchestrator", plane: "control", rationale: "Query transformation, hybrid retrieval fan-out, rerank, context assembly, generation. Evolved from rule-based FAQ to LLM-assisted RAG." } },
  { id: "retr", position: { x: 690, y: 290 }, data: { label: "hybrid search index", plane: "data", primitive: "semantic + keyword (BM25) index", rationale: "Hybrid search tuned for enterprise-jargon queries where pure semantic similarity fails; metadata filtering narrows by process area." } },
  { id: "rerank", position: { x: 920, y: 290 }, data: { label: "re-ranker", plane: "data", primitive: "cross-encoder rerank", rationale: "Reranking on top of hybrid recall lifted response relevance 30-40% in pilot against a held-out evaluation set." } },
  { id: "llm2", position: { x: 920, y: 150 }, data: { label: "LLM generation", plane: "control", primitive: "managed LLM endpoint", rationale: "Answers grounded in retrieved chunks with source citations; strict no-context/no-answer behavior to protect trust." } },
  { id: "squidex", position: { x: 230, y: 430 }, data: { label: "Squidex CMS", plane: "data", primitive: "headless CMS source", rationale: "Primary managed content source; webhook-driven sync keeps the index fresh as process docs change." } },
  { id: "confluence", position: { x: 0, y: 430 }, data: { label: "Confluence", plane: "data", primitive: "wiki source", rationale: "Second corpus: team wikis and runbooks, pulled through the same ingestion path with source-level metadata." } },
  { id: "ingest", position: { x: 460, y: 430 }, data: { label: "ingestion pipeline", plane: "data", primitive: "chunking + embedding jobs", rationale: "~1,700 internal documents; chunking with overlap calibration, metadata tagging, embedding, and incremental re-indexing." } },
  { id: "eval", position: { x: 690, y: 20 }, data: { label: "evaluation loop", plane: "observability", primitive: "held-out retrieval eval", rationale: "Retrieval precision measured against a held-out set every pipeline change; the loop that justified each iteration." } },
  { id: "secrets", position: { x: 230, y: 20 }, data: { label: "secrets manager", plane: "observability", primitive: "AWS Secrets Manager", rationale: "API keys and source credentials never live in images or env files; rotated centrally." } },
  { id: "cw", position: { x: 920, y: 20 }, data: { label: "logs + metrics", plane: "observability", primitive: "CloudWatch class", rationale: "Latency, retrieval hit-rate, and escalation telemetry; repeat escalations fell ~40% and this is where that was measured." } },
];

const hpeEdges: Edge[] = [
  { id: "h1", source: "users", target: "alb" },
  { id: "h2", source: "alb", target: "api" },
  { id: "h3", source: "api", target: "orch2" },
  { id: "h4", source: "orch2", target: "retr", animated: true },
  { id: "h5", source: "retr", target: "rerank", animated: true },
  { id: "h6", source: "rerank", target: "llm2" },
  { id: "h7", source: "orch2", target: "llm2" },
  { id: "h8", source: "confluence", target: "ingest" },
  { id: "h9", source: "squidex", target: "ingest" },
  { id: "h10", source: "ingest", target: "retr", label: "index" },
  { id: "h12", source: "orch2", target: "eval" },
  { id: "h13", source: "api", target: "secrets" },
  { id: "h14", source: "llm2", target: "cw" },
];

// ---------------------------------------------------------------------------
// 03 · National Census Digital Assistant (HPE) — ACTUAL. Azure deployment.
// FAQ RAG + NPR registration + birth/death reporting against central
// government data.
// ---------------------------------------------------------------------------
const censusNodes: N[] = [
  { id: "citizen", position: { x: 0, y: 150 }, data: { label: "citizens (web + mobile)", plane: "control", rationale: "Public-facing assistant helping citizens through census participation, in an assisted conversational flow." } },
  { id: "afd", position: { x: 230, y: 150 }, data: { label: "Azure Front Door + WAF", plane: "control", primitive: "edge + WAF", rationale: "National-scale public entry point: TLS, WAF rules, and burst absorption during census windows." } },
  { id: "apim", position: { x: 460, y: 150 }, data: { label: "API Management", plane: "control", primitive: "Azure APIM", rationale: "Every backend call goes through APIM with scoped subscriptions and throttling; the government data boundary is a managed contract, not an open pipe." } },
  { id: "bot", position: { x: 690, y: 150 }, data: { label: "conversation orchestrator", plane: "control", primitive: "bot service on App Service", rationale: "Intent routing between free-form FAQ answers and strict transactional flows. Generative where safe, deterministic where it must be." } },
  { id: "faq", position: { x: 920, y: 40 }, data: { label: "FAQ RAG", plane: "data", primitive: "Azure AI Search + LLM", rationale: "RAG over census guidelines and procedures; grounded answers with fallback to human help lines, never fabricated civic guidance." } },
  { id: "npr", position: { x: 920, y: 170 }, data: { label: "NPR registration flow", plane: "data", primitive: "state-machine service", rationale: "National Population Register registration runs as a deterministic multi-step form flow with validation, not free LLM generation." } },
  { id: "bd", position: { x: 920, y: 300 }, data: { label: "birth / death reporting", plane: "data", primitive: "state-machine service", rationale: "Vital-event reporting with strict field validation and receipts; the LLM assists with language, never writes records directly." } },
  { id: "gov", position: { x: 690, y: 430 }, data: { label: "central government data APIs", plane: "data", primitive: "registry systems of record", rationale: "Centrally connected retrieval and submission against government registries through audited, scoped APIs." } },
  { id: "lang", position: { x: 690, y: 20 }, data: { label: "multilingual layer", plane: "control", primitive: "translation + locale routing", rationale: "Citizens interact in their own language; intent detection and responses pass through a language layer." } },
  { id: "state", position: { x: 460, y: 300 }, data: { label: "session + case state", plane: "data", primitive: "Cosmos DB class store", rationale: "Multi-step registrations survive disconnects; conversation state keyed to the case, minimal PII retained." } },
  { id: "kv", position: { x: 230, y: 20 }, data: { label: "Key Vault", plane: "observability", primitive: "Azure Key Vault", rationale: "Credentials for registry APIs held in Key Vault with managed identities; no secrets in app config." } },
  { id: "guard2", position: { x: 460, y: 20 }, data: { label: "content safety + guardrails", plane: "observability", primitive: "safety filters", rationale: "Government context: response filtering, scope limits, and refusal paths so the assistant never speculates on civic policy." } },
  { id: "mon", position: { x: 920, y: 430 }, data: { label: "Azure Monitor + audit trail", plane: "observability", primitive: "logs + audit", rationale: "Every transactional step is audit-logged; operations teams watch completion and drop-off funnels live." } },
];

const censusEdges: Edge[] = [
  { id: "c1", source: "citizen", target: "afd" },
  { id: "c2", source: "afd", target: "apim" },
  { id: "c3", source: "apim", target: "bot" },
  { id: "c4", source: "bot", target: "faq", animated: true },
  { id: "c5", source: "bot", target: "npr" },
  { id: "c6", source: "bot", target: "bd" },
  { id: "c7", source: "npr", target: "gov" },
  { id: "c8", source: "bd", target: "gov" },
  { id: "c9", source: "faq", target: "gov", label: "retrieve" },
  { id: "c10", source: "bot", target: "lang" },
  { id: "c11", source: "bot", target: "state" },
  { id: "c12", source: "apim", target: "kv" },
  { id: "c13", source: "bot", target: "guard2" },
  { id: "c14", source: "gov", target: "mon" },
];

// ---------------------------------------------------------------------------
// 04 · Loop Copilot — ACTUAL production-scale architecture (Azure ecosystem,
// 150 concurrent users today, horizontal scale planned). Microsoft-native because the product
// lives inside D365 tenants.
// ---------------------------------------------------------------------------
const loopNodes: N[] = [
  { id: "web", position: { x: 0, y: 90 }, data: { label: "web client (React 19)", plane: "control", rationale: "Rep-facing SPA; sub-second interactive paths were non-negotiable for adoption." } },
  { id: "tg", position: { x: 0, y: 210 }, data: { label: "Telegram bot", plane: "control", primitive: "Telegram Bot API", rationale: "Alerts and conversational logging where reps already live; same API surface as web." } },
  { id: "fd", position: { x: 230, y: 150 }, data: { label: "Azure Front Door + WAF", plane: "control", primitive: "edge + WAF", rationale: "TLS, WAF, and global entry for the scaled deployment; static assets cached at the edge." } },
  { id: "api2", position: { x: 460, y: 150 }, data: { label: "async FastAPI (container apps)", plane: "control", primitive: "autoscaled containers", rationale: "Async FastAPI + Motor, packaged as containers with autoscale rules sized for 150 concurrent users today, horizontal scale planned." } },
  { id: "entra", position: { x: 460, y: 20 }, data: { label: "Entra ID (MSAL)", plane: "control", primitive: "identity", rationale: "Auth stays inside the customer's tenant trust model; tokens scoped per user, no external OAuth grants." } },
  { id: "kv2", position: { x: 230, y: 20 }, data: { label: "Azure Key Vault", plane: "observability", primitive: "secrets manager", rationale: "CRM credentials, bot tokens, and LLM keys resolved at runtime via managed identity; nothing in env files." } },
  { id: "events2", position: { x: 690, y: 40 }, data: { label: "event store (Cosmos DB for Mongo)", plane: "data", primitive: "append-only event log", rationale: "Event sourcing over vector RAG: live workflow events, portfolio, and recent history injected per request as structured JSON. Hallucinated memory eliminated." } },
  { id: "queue", position: { x: 690, y: 170 }, data: { label: "Service Bus queue", plane: "data", primitive: "message queue", rationale: "Bulk activity uploads and voice-call document processing run async; the interactive path never blocks on batch work." } },
  { id: "redis", position: { x: 690, y: 300 }, data: { label: "Redis cache", plane: "data", primitive: "session + rate cache", rationale: "Session context and per-user rate limits; keeps p95 sub-second under load." } },
  { id: "ctx2", position: { x: 920, y: 40 }, data: { label: "context assembler", plane: "control", rationale: "Builds the per-request structured JSON context from events; chat needs what just happened, not what history embeds to." } },
  { id: "llm3", position: { x: 920, y: 170 }, data: { label: "LLM (Groq / Azure OpenAI)", plane: "control", primitive: "model behind an abstraction", rationale: "Groq/Llama for speed today; the model sits behind an abstraction so tenant-compliant Azure OpenAI can swap in per customer." } },
  { id: "t1", position: { x: 230, y: 430 }, data: { label: "tier 1: Power Automate flows", plane: "data", primitive: "tenant-native automation", rationale: "Primary path, authenticated by internal tenant identity. Designed within the customer's IT policy, not against it." } },
  { id: "t2", position: { x: 460, y: 430 }, data: { label: "tier 2: Dataverse REST (MSAL)", plane: "data", primitive: "direct REST", rationale: "Secondary path for environments granting broader permissions." } },
  { id: "t3", position: { x: 690, y: 430 }, data: { label: "tier 3: session fallback", plane: "data", primitive: "browser session driver", rationale: "Fallback path; three tiers cost complexity but bought cross-environment portability from day one." } },
  { id: "crm2", position: { x: 920, y: 430 }, data: { label: "D365 / multi-CRM shell", plane: "data", primitive: "enterprise CRM", rationale: "D365 today; a multi-CRM expansion shell (Salesforce, HubSpot, Zoho) abstracts the destination." } },
  { id: "obs2", position: { x: 920, y: 300 }, data: { label: "App Insights + alerts", plane: "observability", primitive: "APM + bot alerts", rationale: "Admin analytics and Telegram alerting; manager visibility into adoption was the second-highest request." } },
];

const loopEdges: Edge[] = [
  { id: "l1", source: "web", target: "fd" },
  { id: "l2", source: "tg", target: "fd" },
  { id: "l3", source: "fd", target: "api2" },
  { id: "l4", source: "api2", target: "entra" },
  { id: "l5", source: "api2", target: "kv2" },
  { id: "l6", source: "api2", target: "events2" },
  { id: "l7", source: "api2", target: "queue" },
  { id: "l8", source: "api2", target: "redis" },
  { id: "l9", source: "events2", target: "ctx2" },
  { id: "l10", source: "ctx2", target: "llm3", animated: true },
  { id: "l11", source: "api2", target: "t1" },
  { id: "l12", source: "api2", target: "t2" },
  { id: "l13", source: "api2", target: "t3" },
  { id: "l14", source: "t1", target: "crm2" },
  { id: "l15", source: "t2", target: "crm2" },
  { id: "l16", source: "t3", target: "crm2" },
  { id: "l17", source: "api2", target: "obs2" },
];

// ---------------------------------------------------------------------------
// 05 · Saarthi — ACTUAL pilot architecture, upgraded to interactive.
// ---------------------------------------------------------------------------
const saarthiNodes: N[] = [
  { id: "mob", position: { x: 0, y: 150 }, data: { label: "mobile + web clients", plane: "control", rationale: "~30-screen MVP shipped on both surfaces from one architecture; voice-first for India's gig workforce." } },
  { id: "stt", position: { x: 230, y: 80 }, data: { label: "cloud STT", plane: "control", primitive: "speech-to-text", rationale: "Voice in vernacular languages is the primary input; a 10-language architecture from day one." } },
  { id: "orch3", position: { x: 460, y: 150 }, data: { label: "master AI orchestrator", plane: "control", primitive: "agent router", rationale: "Routes each utterance to a specialist agent; modular so agents evolve independently." } },
  { id: "log", position: { x: 690, y: 20 }, data: { label: "money logging agent", plane: "control", rationale: "Structured income/expense capture from natural speech." } },
  { id: "ana", position: { x: 690, y: 130 }, data: { label: "analysis agent", plane: "control", rationale: "Patterns and summaries over the user's own logged data." } },
  { id: "edu", position: { x: 690, y: 240 }, data: { label: "education agent", plane: "control", rationale: "Financial literacy grounded in the curated KB; confidence against exploitation was the researched core need." } },
  { id: "offer", position: { x: 690, y: 350 }, data: { label: "offer explanation agent", plane: "control", rationale: "Explains loan/financial offers in plain vernacular terms; explanation, never recommendation." } },
  { id: "kb", position: { x: 460, y: 320 }, data: { label: "regulatory-safe KB (RAG)", plane: "data", primitive: "curated knowledge base", rationale: "Curated, SEBI-advisory-safe corpus. Compliance lives in the data and layers, not in model adjustment." } },
  { id: "mem", position: { x: 230, y: 320 }, data: { label: "central memory layer (RAG)", plane: "data", primitive: "cross-session memory", rationale: "User context, goals, and prior conversations persist across sessions and across web/mobile from one source of truth." } },
  { id: "guard3", position: { x: 920, y: 190 }, data: { label: "guardrails: consent-first, non-transactional", plane: "observability", primitive: "policy layer", rationale: "Multi-layer compliance: system-prompt guardrails, server-side governance, DPDP consent-first data handling. No transactions, ever." } },
  { id: "tts", position: { x: 920, y: 60 }, data: { label: "cloud TTS (vernacular)", plane: "control", primitive: "text-to-speech", rationale: "Responses return as speech in the user's language; the full loop stays voice-first." } },
];

const saarthiEdges: Edge[] = [
  { id: "s1", source: "mob", target: "stt" },
  { id: "s2", source: "stt", target: "orch3" },
  { id: "s3", source: "orch3", target: "log" },
  { id: "s4", source: "orch3", target: "ana" },
  { id: "s5", source: "orch3", target: "edu" },
  { id: "s6", source: "orch3", target: "offer" },
  { id: "s7", source: "kb", target: "orch3", animated: true, label: "retrieve" },
  { id: "s8", source: "mem", target: "orch3", animated: true },
  { id: "s9", source: "log", target: "guard3" },
  { id: "s10", source: "edu", target: "guard3" },
  { id: "s11", source: "offer", target: "guard3" },
  { id: "s12", source: "guard3", target: "tts" },
  { id: "s13", source: "tts", target: "mob" },
];

// ---------------------------------------------------------------------------
// 07 · Agentic Codebase Intelligence System — ACTUAL.
// Fable 5 orchestrator over an audit fleet; OSS reuse for the graph; adaptive
// hybrid retrieval; OKF persistence; Jira delivery behind a human approval gate.
// ---------------------------------------------------------------------------
const cisNodes: N[] = [
  { id: "code", position: { x: 0, y: 60 }, data: { label: "cold codebase", plane: "data", rationale: "A codebase never seen before, treated as a cold forward-deployed engagement: no brief, no prior context." } },
  { id: "ua", position: { x: 210, y: 60 }, data: { label: "Graph engine (integrated)", plane: "data", primitive: "parsing + graph", rationale: "Integrated a proven engine for parsing and dependency-graph construction, so the build goes where the value is: the audit, synthesis, and delivery." } },
  { id: "cgraph", position: { x: 210, y: 200 }, data: { label: "dependency graph", plane: "data", primitive: "code graph", rationale: "Files, functions, classes, and imports as a graph, so relationship queries have real structure to traverse." } },
  { id: "retr", position: { x: 440, y: 130 }, data: { label: "adaptive hybrid retrieval", plane: "data", primitive: "dense + BM25 + graph", rationale: "Query classified first, then routed: dense for concepts, BM25 for exact identifiers code is full of, graph for blast radius. Reranked before it reaches an agent." } },
  { id: "orch", position: { x: 690, y: 130 }, data: { label: "Audit orchestrator", plane: "control", primitive: "planner", rationale: "Plans the audit, spawns the fleet, and reconciles their outputs. Deterministic code and a human approval gate decide what is acted on." } },
  { id: "mapper", position: { x: 690, y: 0 }, data: { label: "dependency mapper", plane: "control", rationale: "Runs first: maps imports, packages, and internal calls so the later agents reason over real structure." } },
  { id: "sec", position: { x: 920, y: 20 }, data: { label: "security scanner", plane: "control", rationale: "Hardcoded secrets, vulnerable dependencies, injection risks, and auth gaps. Runs in parallel with the architecture reviewer." } },
  { id: "arch", position: { x: 920, y: 160 }, data: { label: "architecture reviewer", plane: "control", rationale: "Coupling, missing abstractions, and scaling bottlenecks." } },
  { id: "dead", position: { x: 920, y: 300 }, data: { label: "dead-code detector", plane: "control", rationale: "Runs last: unused functions, deprecated routes, orphaned files." } },
  { id: "synth", position: { x: 1160, y: 130 }, data: { label: "synthesis agent", plane: "control", primitive: "reconciler", rationale: "Reconciles conflicting findings with a stated judgment, prioritizes into critical/high/medium/low, and answers the unasked question: the most non-obvious risk." } },
  { id: "okf", position: { x: 1160, y: 300 }, data: { label: "OKF bundle", plane: "data", primitive: "persistence", rationale: "Findings and decisions persist as an Open Knowledge Format bundle so a re-run updates a living picture instead of starting cold. Kept swappable behind an interface." } },
  { id: "deliver", position: { x: 1400, y: 60 }, data: { label: "delivery agent", plane: "control", rationale: "Maps findings to tickets with severity-to-priority mapping and stable fingerprints, so a re-run updates or closes instead of duplicating." } },
  { id: "gate", position: { x: 1400, y: 200 }, data: { label: "human approval gate", plane: "observability", primitive: "trust boundary", rationale: "No agent writes to a production tracker unreviewed. It proposes a ticket set; a human approves, edits, or rejects; only approved items are created." } },
  { id: "cjira", position: { x: 1620, y: 130 }, data: { label: "customer Jira", plane: "data", primitive: "Jira via MCP", rationale: "Agent-facing calls go through the Jira MCP, direct REST only where MCP lacks a field. Least-privilege auth scoped to the needed projects." } },
];
const cisEdges: Edge[] = [
  { id: "c1", source: "code", target: "ua" },
  { id: "c2", source: "ua", target: "cgraph" },
  { id: "c3", source: "cgraph", target: "retr", animated: true },
  { id: "c4", source: "retr", target: "orch", animated: true, label: "context" },
  { id: "c5", source: "orch", target: "mapper" },
  { id: "c6", source: "orch", target: "sec" },
  { id: "c7", source: "orch", target: "arch" },
  { id: "c8", source: "orch", target: "dead" },
  { id: "c9", source: "sec", target: "synth" },
  { id: "c10", source: "arch", target: "synth" },
  { id: "c11", source: "mapper", target: "synth" },
  { id: "c12", source: "dead", target: "synth" },
  { id: "c13", source: "synth", target: "okf", label: "persist" },
  { id: "c14", source: "synth", target: "deliver", label: "findings" },
  { id: "c15", source: "deliver", target: "gate", label: "propose" },
  { id: "c16", source: "gate", target: "cjira", label: "approved" },
];

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// 08 · Operator OS — actual architecture. Only components that exist: the
// single model-call function and its ledger, the provider cascade, the
// Postgres-backed durable queue, the agent registry with its acyclic check,
// and the acceptance-check harness. No load balancer, cache, or broker.
// ---------------------------------------------------------------------------
const opsNodes: N[] = [
  { id: "op_ui", position: { x: 0, y: 150 }, data: { label: "control plane (Next.js)", plane: "control", primitive: "single-tenant UI", rationale: "One operator's control plane. Departments and their reporting graph render from the registry, so navigation follows the data rather than hardcoded routes." } },
  { id: "op_registry", position: { x: 235, y: 40 }, data: { label: "agent registry", plane: "data", primitive: "departments + employees", rationale: "Departments and employees are rows. Adding a department takes a manifest file and a row, with no changes to routing or navigation code." } },
  { id: "op_cte", position: { x: 470, y: 40 }, data: { label: "acyclic check (recursive CTE)", plane: "control", primitive: "write-transaction guard", rationale: "The reporting graph is kept acyclic by a recursive CTE inside the write transaction, so structure is enforced by the database rather than by asking an agent nicely." } },
  { id: "op_queue", position: { x: 235, y: 175 }, data: { label: "durable job queue", plane: "data", primitive: "Postgres FOR UPDATE SKIP LOCKED", rationale: "Dispatch is a durable queue: leases with reclamation, exponential backoff with jitter, idempotency keys, and resumable checkpoints, so work survives a crash." } },
  { id: "op_workers", position: { x: 470, y: 175 }, data: { label: "workers", plane: "control", primitive: "lease + claim", rationale: "Workers claim disjoint job sets under a lease. A lease that expires after a crash is reclaimed rather than lost." } },
  { id: "op_dlq", position: { x: 470, y: 300 }, data: { label: "dead-letter queue", plane: "data", primitive: "terminal failure store", rationale: "Jobs that exhaust retries land in a dead-letter queue instead of disappearing or looping." } },
  { id: "op_gateway", position: { x: 705, y: 175 }, data: { label: "model call gateway", plane: "control", primitive: "single call function", rationale: "Every model call routes through one function. That single choke point is what makes accounting, ceilings, and the kill switch possible at all." } },
  { id: "op_guard", position: { x: 705, y: 40 }, data: { label: "kill switch + ceilings", plane: "control", primitive: "spend + price guard", rationale: "Kill switch, daily spend ceiling, and a per-model price ceiling that catches a vendor listing the same model at $0.28 and $75 per million tokens with capitalisation as the only difference." } },
  { id: "op_ledger", position: { x: 705, y: 300 }, data: { label: "cost ledger", plane: "observability", primitive: "row per attempt", rationale: "A ledger row per attempt including the ones that fail, so a failed call is still accounted for rather than invisible." } },
  { id: "op_cascade", position: { x: 940, y: 175 }, data: { label: "provider cascade (7)", plane: "control", primitive: "free-first failover", rationale: "Seven providers ordered free-first with automatic failover and a per-attempt deadline, because a hung provider otherwise blocks the whole chain." } },
  { id: "op_probe", position: { x: 940, y: 40 }, data: { label: "live model probe", plane: "observability", primitive: "ID verification", rationale: "Model IDs verified by probing them live rather than trusting vendor docs. The probe found a model that hangs 194 seconds before dying and a free tier returning 403 while its dashboard still advertised it." } },
  { id: "op_ci", position: { x: 0, y: 300 }, data: { label: "CI bypass check", plane: "observability", primitive: "build gate", rationale: "A CI check fails the build if any code calls a model without going through the gateway, so the accounting guarantee cannot quietly erode." } },
  { id: "op_checks", position: { x: 235, y: 300 }, data: { label: "78 acceptance checks", plane: "observability", primitive: "live-Postgres harness", rationale: "78 checks run against a live Postgres instance rather than mocks: 100 concurrent ID issues with zero collisions, two workers claiming disjoint job sets, lease reclamation after a simulated crash, and a real cycle refused while a redundant acyclic edge is allowed." } },
];
const opsEdges: Edge[] = [
  { id: "o1", source: "op_ui", target: "op_registry" },
  { id: "o2", source: "op_registry", target: "op_cte" },
  { id: "o3", source: "op_ui", target: "op_queue" },
  { id: "o4", source: "op_queue", target: "op_workers", animated: true },
  { id: "o5", source: "op_workers", target: "op_dlq" },
  { id: "o6", source: "op_workers", target: "op_gateway", animated: true },
  { id: "o7", source: "op_guard", target: "op_gateway" },
  { id: "o8", source: "op_gateway", target: "op_ledger", animated: true },
  { id: "o9", source: "op_gateway", target: "op_cascade", animated: true },
  { id: "o10", source: "op_probe", target: "op_cascade" },
  { id: "o11", source: "op_ci", target: "op_gateway" },
  { id: "o12", source: "op_checks", target: "op_queue" },
];

export const SD_SECTIONS: SDSection[] = [
  {
    id: "qe-platform",
    image: "/architecture/qe-platform.png",
    title: "AI-Infused Agentic QE Platform",
    badge: "interactive · reference architecture · how I would build it",
    intro:
      "The one section shown as a genericized reference pattern rather than the deployed system: GraphRAG on Neo4j plus agentic retrieval over the issue tracker, generation through a custom Playwright MCP tool server, an audit-defensible eval layer, and one codebase beaming into customer-managed clouds A/B/C. Generic primitives only, no client names.",
    tags: ["GraphRAG", "agentic RAG", "reranking", "LLM observability", "tenant-aware RBAC"],
    kind: "flow",
    nodes: qeNodes,
    edges: qeEdges,
    height: 560,
    caption:
      "Toggle between the presentation architecture render and an interactive explorer where you can hover any node for the design rationale. Click either to maximize.",
    projectHref: "/projects/qe-platform",
    interview: {
      functional: [
        "Generate production-grade Playwright/Cypress test scripts from natural-language user stories",
        "Agentic retrieval over Jira/ADO: linked epics, acceptance criteria, and existing tests as style examples",
        "CI-integrated execution so generated suites run where engineering already looks",
        "Manager-facing quality scoreboard: Acceptance-Criteria Coverage, Test-Design Coverage, RAGAS",
        "Tenant-aware RBAC with module-level CRUD-X permissions and role templates",
      ],
      nonFunctional: [
        "Hallucination under 5% (from ~15%) via GraphRAG + entity normalization + reranking",
        "Multi-cloud portability: one codebase into customer-managed AWS/Azure/GCP, identity adapted per tenant",
        "Strict tenant isolation for data, cost telemetry, and permissions",
        "Audit-defensible evaluation so the platform survives budget reviews",
      ],
      capacity: [
        "17 enterprise QA teams at peak adoption on shared infrastructure",
        "~7,000 concurrent test executions per day sustained across tenants",
        "Per-tenant token budgets and context compression tuned to each tenant's query patterns",
        "Low-complexity queries rerouted to lighter models to cut per-tenant LLM spend",
      ],
      tradeoffs: [
        "GraphRAG costs ~30-40% more tokens per query, but ~50% fewer regenerations nets a lower cost per acceptable output",
        "Tenant-aware RBAC added weeks to the MVP; bolting it on later would have cost far more",
        "Agentic multi-step retrieval adds latency versus single-shot RAG, traded for accuracy that holds user trust",
      ],
    },
  },
  {
    id: "hpe-rag-chatbot",
    image: "/architecture/hpe-rag-chatbot.png",
    title: "Enterprise Knowledge Assistant · Conversational RAG",
    badge: "interactive · production architecture",
    intro:
      "The deployed architecture: a dockerized conversational RAG system over ~1,700 internal process documents sourced from Squidex CMS and Confluence, behind a load balancer and sized for a 20,000-concurrent-user design target. Hybrid semantic + keyword retrieval with re-ranking, evaluated against a held-out set.",
    tags: ["production RAG", "hybrid search", "reranking", "AWS", "evaluation loops"],
    kind: "flow",
    nodes: hpeNodes,
    edges: hpeEdges,
    height: 560,
    caption:
      "Toggle between the presentation architecture render and an interactive explorer where you can hover any node for the design rationale. Click either to maximize.",
    projectHref: "/projects/hpe-rag-chatbot",
    interview: {
      functional: [
        "Conversational Q&A over ~1,700 internal process documents with source citations",
        "Hybrid retrieval: semantic vectors + keyword (BM25) + metadata filtering for enterprise-jargon queries",
        "Continuous ingestion from Squidex CMS and Confluence with incremental re-indexing",
        "Session context so follow-up questions resolve against the running conversation",
        "Strict no-answer behavior when retrieval confidence is low, with escalation to human support",
      ],
      nonFunctional: [
        "Designed for 20,000 concurrent users: stateless dockerized services autoscaled behind an ALB",
        "Response relevance improved 30-40% in pilot, measured on a held-out evaluation set",
        "Repeat escalations cut ~40% versus the rule-based predecessor",
        "Secrets in a managed secrets store; no credentials in images or env files",
      ],
      capacity: [
        "~1,700 documents chunked with overlap calibration: on the order of tens of thousands of indexed chunks",
        "Hot-question response cache to keep repeated queries off the LLM entirely",
        "Horizontal scaling on the API tier; the index and reranker scale independently",
      ],
      tradeoffs: [
        "Hybrid search over pure vector: enterprise jargon breaks cosine similarity, keyword signals rescue it",
        "Re-ranking adds a hop of latency, traded for the 30-40% relevance lift that made the pilot",
        "Migrating from rule-based FAQ incrementally (not a rewrite) kept the escalation baseline measurable",
      ],
    },
  },
  {
    id: "global-census-chatbot",
    image: "/architecture/global-census-chatbot.png",
    title: "National Census Digital Assistant",
    badge: "interactive · production architecture",
    intro:
      "The deployed Azure architecture for a civic-scale conversational assistant supporting India's census operations: RAG-grounded FAQ answering, plus deterministic transactional flows for NPR registration and birth/death reporting against central government data, every backend call behind API Management.",
    tags: ["conversational AI", "Azure", "RAG", "state-machine flows", "civic scale"],
    kind: "flow",
    nodes: censusNodes,
    edges: censusEdges,
    height: 560,
    caption:
      "Toggle between the presentation architecture render and an interactive explorer where you can hover any node for the design rationale. Click either to maximize.",
    projectHref: "/projects/global-census-chatbot",
    interview: {
      functional: [
        "FAQ answering over census guidelines and procedures, grounded via RAG",
        "NPR (National Population Register) registration as a validated multi-step flow",
        "Birth and death reporting with strict field validation and receipts",
        "Centrally connected retrieval and submission against government registry APIs",
        "Multilingual interaction: intent detection and responses through a language layer",
      ],
      nonFunctional: [
        "Burst tolerance for national census windows: edge WAF + autoscaling app tier",
        "Transactional integrity: the LLM assists with language but never writes records directly",
        "Full audit trail on every transactional step; scoped, throttled access to registry APIs via APIM",
        "Guardrails and refusal paths so the assistant never speculates on civic policy",
      ],
      capacity: [
        "Session and case state in a distributed store so multi-step registrations survive disconnects",
        "Minimal PII retention: conversation state keyed to the case, purged on completion",
        "Generative load isolated to the FAQ path; transactional flows are cheap deterministic services",
      ],
      tradeoffs: [
        "Deterministic state machines for registrations over end-to-end generative flows: civic records demand validation, not fluency",
        "APIM as a hard boundary adds a hop, but turns government data access into a managed, auditable contract",
        "Azure-native managed services over portability: the deployment context made the ecosystem the pragmatic call",
      ],
    },
  },
  {
    id: "loop-copilot",
    image: "/architecture/loop-copilot.png",
    title: "Loop Copilot",
    badge: "interactive · production architecture",
    intro:
      "The production-scale architecture Loop Copilot grows into as it scales past its Fortune 500 pilot: Azure-native because the product lives inside Microsoft tenants, sized for 150 concurrent users today with horizontal scale designed in for later releases. Event sourcing over vector RAG for chat context, and the three-tier D365 integration shell that lives within the customer's tenant trust model.",
    tags: ["event sourcing", "tenant trust model", "async API", "multi-CRM shell", "Azure"],
    kind: "flow",
    nodes: loopNodes,
    edges: loopEdges,
    height: 600,
    caption:
      "Toggle between the presentation architecture render and an interactive explorer where you can hover any node for the design rationale. Click either to maximize.",
    projectHref: "/projects/loop-copilot",
    interview: {
      functional: [
        "CRM activity logging from chat and voice in ~45 seconds (down from 4-6 minutes)",
        "Calendar integration, bulk activity upload with AI summarization, Telegram alerts, admin analytics",
        "Voice pipeline: call transcripts to structured PRD/onboarding docs, account resolution by MDM ID, auto-registration in the CRM",
        "Multi-CRM expansion shell: D365 today, Salesforce/HubSpot/Zoho slots architected",
      ],
      nonFunctional: [
        "150 concurrent users today with sub-second p95 on interactive paths; designed to scale horizontally",
        "All auth inside the customer's tenant trust model (Entra ID / MSAL); no external OAuth grants",
        "Secrets resolved at runtime from Key Vault via managed identity; zero credentials at rest in config",
        "Batch work (bulk uploads, transcription) isolated on queues so it never blocks interactive latency",
      ],
      capacity: [
        "Autoscaled async FastAPI containers behind Front Door; Redis for session and rate-limit state",
        "Event store on Cosmos DB (Mongo API): append-only writes, request-time context assembly",
        "LLM behind an abstraction: Groq/Llama for speed, tenant-compliant Azure OpenAI swappable per customer",
      ],
      tradeoffs: [
        "Event sourcing over vector RAG: more tokens per request, hallucinated memory eliminated entirely",
        "Three integration tiers cost complexity but bought cross-environment portability from day one",
        "MVP scoped to appointment logging only; the beta user requested expansion within two weeks, validating the cut",
      ],
    },
  },
  {
    id: "saarthi",
    image: "/architecture/saarthi.png",
    title: "Voice-First Financial AI Copilot (Saarthi)",
    badge: "interactive · pilot architecture",
    intro:
      "The piloted architecture: voice as the interaction layer atop a master orchestrator routing to specialist agents, a curated regulatory-safe knowledge base, and a multi-layer compliance posture (SEBI advisory principles, DPDP consent-first data) enforced in layers rather than model adjustment.",
    tags: ["voice AI", "multi-agent", "compliance architecture", "RAG memory"],
    kind: "flow",
    nodes: saarthiNodes,
    edges: saarthiEdges,
    height: 520,
    caption:
      "Toggle between the presentation architecture render and an interactive explorer where you can hover any node for the design rationale. Click either to maximize.",
    projectHref: "/projects/saarthi",
    interview: {
      functional: [
        "Voice-first interaction in vernacular languages (10-language architecture), STT in / TTS out",
        "Specialist agents: money logging, analysis, financial education, offer explanation",
        "Central memory layer with RAG: context, goals, and conversations persist across sessions and surfaces",
        "Offer explanation, never recommendation: explanation of terms in plain language",
      ],
      nonFunctional: [
        "Compliance as architecture: curated KB, system-prompt guardrails, server-side governance, consent-first data",
        "Non-transactional by design: no money movement paths exist in the system",
        "One source of truth across web and mobile for a ~30-screen MVP",
      ],
      capacity: [
        "Pilot scale: ~15 first-week users with ~55% repeat usage",
        "Voice pipeline costs bounded by routing short utterances through lightweight STT/TTS tiers",
      ],
      tradeoffs: [
        "Curated regulatory-safe KB over open retrieval: smaller corpus, but every answer is defensible under SEBI advisory principles",
        "Compliance in layers over fine-tuning the model: auditable, swappable, and cheaper to certify",
        "Voice-first raises the floor on latency budgets; agents are modular so slow ones degrade to text gracefully",
      ],
    },
  },
  {
    id: "wealthos",
    title: "WealthOS · Autonomous Wealth Operating System",
    badge: "in development · two views",
    intro:
      "A 21-agent analyst council produces calibrated proposals through a devil's advocate stage and accuracy-weighted aggregation; a code-enforced veto gate with five concentric risk rings decides. The LLM layer has no write access to money paths. Toggle between the platform architecture and how the council actually reaches a decision.",
    tags: ["multi-agent", "risk guardrails", "human-in-the-loop", "MCP"],
    image: "/architecture/wealthos-platform.png",
    imageLabel: "Platform architecture",
    image2: "/architecture/wealthos-orchestration.png",
    image2Label: "Council orchestration",
    caption:
      "Two architecture views: the layered platform, and the multi-agent council decision procedure. Click either to maximize.",
    projectHref: "/projects/wealthos",
    interview: {
      functional: [
        "Multi-asset analysis (stocks, mutual funds, ETFs, bonds, NPS) via a 21-agent analyst council",
        "Devil's advocate stage and accuracy-weighted aggregation before any proposal surfaces",
        "Recommendations only: human-in-the-loop approval on every action",
        "Live broker data via Model Context Protocol",
      ],
      nonFunctional: [
        "Code-enforced veto gate: no money moves on LLM output alone",
        "Five-ring risk system: position, portfolio, drawdown, budget, connection-level broker locks",
        "Frozen-threshold evolution gauntlet: strategy changes must beat the incumbent on fixed statistical gates",
      ],
      capacity: [
        "Sized for free-tier deployment today: single-node modular monolith with a database-backed event bus, no external queue infrastructure",
        "21-agent fan-out per high-stakes decision cycle, with budget shedding that drops low-tier councils first",
        "Documented ports-and-adapters seams for horizontal scale: swap the event bus and split into role-scoped workers when volume demands it",
      ],
      tradeoffs: [
        "Agent council costs tokens and latency versus a single model call, traded for calibrated, auditable proposals",
        "Frozen statistical gates slow strategy iteration, but rule out silent strategy drift",
      ],
    },
  },
  {
    id: "codebase-intelligence-system",
    image: "/architecture/codebase-intelligence-system.png",
    title: "Agentic Codebase Intelligence System",
    badge: "interactive · production architecture",
    intro:
      "An orchestration layer I built runs a fleet of specialist agents across a codebase it has never seen, reconciles their findings into one prioritized picture, and files the approved ones into the customer's own Jira. I integrated a proven graph engine for parsing and built the audit, synthesis, and delivery layer on top, which is where the value sits. Nothing writes to the customer's tracker without a human approval.",
    tags: ["multi-agent", "agentic rag", "hybrid search", "mcp", "system design"],
    kind: "flow",
    nodes: cisNodes,
    edges: cisEdges,
    height: 560,
    caption:
      "Toggle between the presentation architecture render and an interactive explorer where you can hover any node for the design rationale. Click either to maximize.",
    projectHref: "/projects/codebase-intelligence-system",
    interview: {
      functional: [
        "Plan a full technical audit of an unseen codebase and spawn specialist agents per domain",
        "Four audit agents: dependency mapping, security, architecture review, and dead-code detection",
        "Synthesis reconciles conflicting findings, prioritizes them, and surfaces the highest-leverage non-obvious risk",
        "Route approved findings into the customer's Jira as prioritized tickets with evidence and a recommended fix",
        "Re-run reconciliation against a persistent knowledge bundle: update, close, or create only new tickets",
      ],
      nonFunctional: [
        "A human approval gate before any write to the customer's tracker: nothing lands unreviewed",
        "Idempotency through stable finding fingerprints, so a re-run never duplicates tickets",
        "Least-privilege auth scoped only to the projects the delivery agent needs, no admin",
        "Open-source reuse disclosed openly; the persistence format kept swappable behind an interface",
      ],
      capacity: [
        "The codebase does not fit in context, so adaptive hybrid retrieval feeds the agents rather than a single prompt",
        "Incremental dependency graph and an OKF bundle read first on re-run, so repeated audits update a living picture instead of starting cold",
        "Audit domains run with a defined order and parallelism: mapping first, security and architecture in parallel, dead-code last, then synthesis",
      ],
      tradeoffs: [
        "Integrated a proven graph engine rather than rebuilding a solved layer, so the build goes into the audit and delivery, which is where the value sits",
        "Adaptive hybrid retrieval over a single strategy, because code is full of exact identifiers that dense retrieval alone misses",
        "Jira via MCP for agent-facing tool calls, with the direct REST API only where MCP does not expose a needed field",
        "A human approval gate costs a step, but it is the trust boundary that makes writing to a customer's production tracker acceptable",
      ],
    },
  },
  {
    id: "operator-os",
    title: "Operator OS",
    badge: "interactive · pre-deployment",
    intro:
      "A single-tenant control plane for running agents against real work. Every model call goes through one function so it can be accounted for and capped, dispatch is a durable Postgres queue so work survives a crash, and the reporting graph is kept acyclic by the database inside the write transaction rather than by convention.",
    tags: ["multi-agent", "durable queue", "cost control", "provider failover", "postgres"],
    kind: "flow",
    nodes: opsNodes,
    edges: opsEdges,
    height: 520,
    flowLabel: "Interactive explorer",
    caption:
      "Hover any node for the design rationale. Click to maximize.",
    projectHref: "/projects/operator-os",
    interview: {
      functional: [
        "Register departments and employees, with the reporting graph rendered from the registry",
        "Dispatch agent work as durable jobs that survive a process crash",
        "Route every model call through one function, across seven providers with automatic failover",
        "Record a ledger row per model-call attempt, including attempts that fail",
        "Enforce a kill switch, a daily spend ceiling, and a per-model price ceiling",
      ],
      nonFunctional: [
        "Failed calls are still accounted for, so cost data has no silent gaps",
        "Structure is enforced by the database: a recursive CTE inside the write transaction refuses a cycle in the reporting graph",
        "A per-attempt deadline on every provider call, so one hung provider cannot block the chain",
        "A CI check fails the build if any code bypasses the model-call gateway",
        "Idempotency keys and resumable checkpoints, so a retry does not duplicate work",
      ],
      capacity: [
        "Claiming uses FOR UPDATE SKIP LOCKED, so workers take disjoint job sets without blocking each other",
        "Leases are reclaimed after a crash rather than leaving jobs stranded",
        "Exponential backoff with jitter on retries, with terminal failures routed to a dead-letter queue",
        "Verified at 100 concurrent ID issues with zero collisions",
      ],
      tradeoffs: [
        "Postgres as the queue rather than a separate broker: one datastore to operate, and the queue shares transactions with the data it touches",
        "One mandatory call function is a constraint on every caller, but it is the only way the accounting and the ceilings hold",
        "Model IDs verified by live probing rather than vendor documentation, after probing found a model that hangs 194 seconds before dying and a free tier returning 403 while its dashboard still advertised it",
        "Free-first provider ordering trades predictable latency for cost, which the per-attempt deadline bounds",
        "78 acceptance checks run against a live Postgres instance rather than mocks: slower to run, but they exercise the concurrency and transaction behaviour the design depends on",
      ],
    },
  },
];
