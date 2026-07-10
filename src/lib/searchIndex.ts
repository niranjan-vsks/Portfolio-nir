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
  { label: "Forward Deployed Engineering", href: "/experience#fde", group: "section", keywords: ["fde", "customer-facing", "solutions architecture", "cost optimization"] },
  { label: "Skills", href: "/skills", group: "section", keywords: ["stack", "technologies", "agentic", "rag", "python"] },
  { label: "Certifications", href: "/certifications", group: "section", keywords: ["certs", "bitsom", "anthropic", "claude architect"] },
  { label: "Education", href: "/education", group: "section", keywords: ["degree", "iiit", "btech", "ml diploma"] },
  { label: "Contact", href: "/contact", group: "section", keywords: ["email", "linkedin", "github", "hire", "reach"] },
  { label: "ask_niranjan", href: "/chat", group: "section", keywords: ["chat", "chatbot", "ask", "interview", "questions"] },
  { label: "Résumé (PDF)", href: "/NiranjanVSKS_FDE.pdf", group: "action", keywords: ["cv", "resume", "download", "pdf"] },

  { label: "Loop Copilot", href: "/projects/loop-copilot", group: "project", keywords: ["crm", "d365", "dynamics", "copilot", "live", "fortune 500"] },
  { label: "Saarthi", href: "/projects/saarthi", group: "project", keywords: ["voice", "financial", "gig workforce", "vernacular"] },
  { label: "Rebalancer", href: "/projects/rebalancer", group: "project", keywords: ["portfolio", "trading", "agent", "recommendations"] },
  { label: "QE Platform", href: "/projects/qe-platform", group: "project", keywords: ["quality engineering", "graphrag", "testing", "playwright", "agentic qa"] },
  { label: "Conversational RAG Chatbot (HPE)", href: "/projects/hpe-rag-chatbot", group: "project", keywords: ["hpe", "rag", "chatbot", "escalations"] },
  { label: "Global Census Chatbot (HPE)", href: "/projects/global-census-chatbot", group: "project", keywords: ["hpe", "census", "chatbot"] },
];

export const SUGGESTIONS = [
  "Loop Copilot",
  "system design",
  "agentic RAG",
  "experience",
  "ask niranjan",
];
