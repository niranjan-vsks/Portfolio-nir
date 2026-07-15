/**
 * Fixed search index for the top-nav Gooey search (PRD 6.6, decision #10):
 * client-side fuzzy over sections/projects/keywords, no LLM. Add an entry =
 * make it findable.
 */
export interface SearchEntry {
  label: string;
  href: string;
  group: string;
  keywords: string[];
}

export const SEARCH_INDEX: SearchEntry[] = [
  { label: "Home", href: "/", group: "section", keywords: ["hub", "landing", "globe", "start"] },
  { label: "Mind Map", href: "/map", group: "section", keywords: ["graph", "brain", "network", "explore", "nodes"] },
  { label: "Projects", href: "/projects", group: "section", keywords: ["work", "products", "independent"] },
  { label: "System Design", href: "/system-design", group: "section", keywords: ["architecture", "diagram", "reference", "how i would build", "rag pipeline"] },
  { label: "Dashboard", href: "/dashboard", group: "section", keywords: ["metrics", "numbers", "impact", "signal"] },
  { label: "About", href: "/about", group: "section", keywords: ["bio", "story", "experience", "arc"] },
  { label: "Experience", href: "/experience", group: "section", keywords: ["coforge", "hpe", "mphasis", "work history"] },
  { label: "Forward Deployed Engineering", href: "/forward-deployed", group: "section", keywords: ["fde", "customer-facing", "solutions architecture", "cost optimization", "rag", "llmops", "observability"] },
  { label: "Skills", href: "/skills", group: "section", keywords: ["stack", "technologies", "agentic", "rag", "python"] },
  { label: "Certifications", href: "/certifications", group: "section", keywords: ["certs", "bitsom", "anthropic", "claude architect"] },
  { label: "Education", href: "/education", group: "section", keywords: ["degree", "iiit", "btech", "ml diploma"] },
  { label: "Contact", href: "/contact", group: "section", keywords: ["email", "linkedin", "github", "hire", "reach"] },
  { label: "ask_niranjan", href: "/chat", group: "section", keywords: ["chat", "chatbot", "ask", "interview", "questions"] },
  { label: "Résumé (PDF)", href: "/Niranjan_VSKS_FDE_P1.pdf", group: "action", keywords: ["cv", "resume", "download", "pdf"] },

  { label: "Loop Copilot", href: "/projects/loop-copilot", group: "project", keywords: ["crm", "d365", "dynamics", "copilot", "live", "fortune 500"] },
  { label: "Saarthi", href: "/projects/saarthi", group: "project", keywords: ["voice", "financial", "gig workforce", "vernacular"] },
  { label: "WealthOS", href: "/projects/wealthos", group: "project", keywords: ["wealthos", "autonomous wealth", "portfolio", "trading", "multi-agent", "veto gate"] },
  { label: "Autonomous Codebase Intelligence System", href: "/projects/codebase-intelligence-system", group: "project", keywords: ["codebase", "audit", "multi-agent", "jira", "mcp", "hybrid retrieval", "okf", "orchestrator", "fde"] },
  { label: "QE Platform", href: "/projects/qe-platform", group: "project", keywords: ["quality engineering", "graphrag", "testing", "playwright", "agentic qa"] },
  { label: "Enterprise Knowledge Assistant (HPE RAG)", href: "/projects/hpe-rag-chatbot", group: "project", keywords: ["hpe", "rag", "chatbot", "escalations", "knowledge assistant", "squidex", "confluence"] },
  { label: "National Census Digital Assistant (HPE)", href: "/projects/global-census-chatbot", group: "project", keywords: ["hpe", "census", "chatbot", "npr", "government"] },
];

// FDE capability pages (R10: everything findable)
SEARCH_INDEX.push(
  { label: "Architecting the AI Solution", href: "/forward-deployed/architecting-ai-solution", group: "fde", keywords: ["architecture", "multi-cloud", "identity", "sso"] },
  { label: "Building the Production RAG Pipeline", href: "/forward-deployed/production-rag-pipeline", group: "fde", keywords: ["graphrag", "hybrid search", "neo4j", "chunking"] },
  { label: "Optimizing the RAG Pipeline", href: "/forward-deployed/optimizing-rag-pipeline", group: "fde", keywords: ["reranking", "compression", "rerouting", "ragas"] },
  { label: "LLM Observability Layer", href: "/forward-deployed/llm-observability", group: "fde", keywords: ["telemetry", "cost", "evaluation", "finops"] },
  { label: "Token Optimization", href: "/forward-deployed/token-optimization", group: "fde", keywords: ["context compression", "prompt", "model routing"] },
  { label: "Cost Optimization", href: "/forward-deployed/cost-optimization", group: "fde", keywords: ["finops", "cloud sizing", "spend"] },
  { label: "Fine-tuning · RLHF & LoRA", href: "/forward-deployed/finetuning-rlhf-lora", group: "fde", keywords: ["finetuning", "lora", "rlhf", "adapters"] },
  { label: "Guardrails & AI Safety", href: "/forward-deployed/guardrails-ai-safety", group: "fde", keywords: ["guardrails", "ai safety", "refusal", "veto gate", "compliance"] },
  { label: "LLMOps", href: "/forward-deployed/llmops", group: "fde", keywords: ["ci/cd", "guardrails", "rbac", "mcp", "kubernetes", "docker"] },
  // experience entries (anchors on /experience)
  { label: "Coforge · Senior Engineer, GenAI & Agentic AI", href: "/experience#coforge", group: "experience", keywords: ["coforge", "qe platform", "2024"] },
  { label: "HPE · Data Scientist, GenAI & Conversational AI", href: "/experience#hpe", group: "experience", keywords: ["hpe", "rag", "conversational", "2022"] },
  { label: "Mphasis · ML & Data Science", href: "/experience#mphasis", group: "experience", keywords: ["mphasis", "fraud", "risk scoring", "2019"] },
);

// key skill terms -> zoomed mind-map nodes (kept in sync with mindmap-data.json)
const SKILL_TERMS: [string, string][] = [
  ["GraphRAG", "skill_graphrag"],
  ["Agentic RAG", "skill_agentic_rag"],
  ["Multi-Agent Orchestration", "skill_multi_agent"],
  ["LangGraph", "skill_langgraph"],
  ["LangChain", "skill_langchain"],
  ["Neo4j", "skill_neo4j"],
  ["Hybrid Search", "skill_hybrid_search"],
  ["Reranking", "skill_reranking"],
  ["Context Compression", "skill_context_compression"],
  ["MCP Servers", "skill_mcp_servers"],
  ["LLM Observability", "skill_llm_observability"],
  ["RAGAS", "skill_ragas"],
  ["Multi-Tenant RBAC", "skill_multi_tenant_rbac"],
  ["SSO & OAuth", "skill_sso_oauth"],
  ["Risk Scoring", "skill_risk_scoring"],
];
for (const [label, node] of SKILL_TERMS) {
  SEARCH_INDEX.push({
    label,
    href: `/map?node=${encodeURIComponent(node)}`,
    group: "skill",
    keywords: ["skill", "mind map", label.toLowerCase()],
  });
}

export const SUGGESTIONS = [
  "Loop Copilot system design",
  "Forward Deployed Engineering",
  "agentic RAG",
  "GraphRAG",
  "experience",
  "ask niranjan",
];
