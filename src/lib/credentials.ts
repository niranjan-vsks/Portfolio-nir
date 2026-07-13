/**
 * Credentials (all real, no fabrication). Descriptions trace to the actual
 * certificate (public/certifications/*) and Niranjan's own account of the
 * program. `related` links to project pages reachable from the credential.
 */
export interface Credential {
  slug: string;
  title: string;
  org: string;
  status?: string;
  description?: string; // short one-liner (cards, SEO)
  paragraphs?: string[]; // long-form body on the credential page
  highlights?: { title: string; body: string }[];
  image?: { src: string; alt: string }; // certificate render
  related: { label: string; href: string }[];
}

export const CERTIFICATIONS: Credential[] = [
  {
    slug: "bitsom-pm-genai",
    title: "Product Management with Generative & Agentic AI",
    org: "BITS School of Management (BITSoM) · Centre for Executive and Professional Development",
    status: "completed · 30 Jul 2025 to 25 Jan 2026",
    description:
      "Six-month executive program on taking GenAI and agentic AI products from opportunity framing to shipped, measurable applications.",
    paragraphs: [
      "A six-month executive program at BITS School of Management focused on the full product lifecycle for GenAI and agentic AI: market and user discovery, problem framing, PRDs and road-mapping, prioritization, pricing and go-to-market, and post-launch measurement. The coursework treats AI products as systems, covering model selection tradeoffs, evaluation, safety and guardrails, and the economics of inference alongside classical product craft.",
      "The program is build-heavy. Every framework was applied to a real product that had to ship: my team designed, validated, and delivered a voice-first financial copilot (Saarthi) end to end, taking it well past prototype into a pilot-ready production application. That build discipline is what I carry into forward deployed work: sitting between the customer's business problem and the engineering, writing the spec, defending the tradeoffs, and shipping the thing.",
      "What it adds on top of my engineering track record is structured product judgment: JTBD-driven discovery, MoSCoW and RICE prioritization, success-metric trees tied to activation and retention rather than vanity counts, and SWOT-grounded positioning. It is the difference between building what was asked and building what moves the customer's metric.",
    ],
    highlights: [
      {
        title: "Product craft",
        body: "Discovery, JTBD, PRDs, MoSCoW / RICE prioritization, success metrics, GTM and pricing for AI products.",
      },
      {
        title: "AI-native curriculum",
        body: "Agentic architectures, evaluation and guardrails, inference economics, and model tradeoffs treated as product decisions.",
      },
      {
        title: "Shipped, not simulated",
        body: "Frameworks applied to a real build: a voice-first financial copilot delivered as a full application, not a demo.",
      },
    ],
    image: {
      src: "/certifications/bitsom-pm-genai.png",
      alt: "BITSoM certificate: Product Management with Generative & Agentic AI, awarded to Niranjan Vsks",
    },
    related: [
      { label: "Voice-First Financial Copilot (Saarthi)", href: "/projects/saarthi" },
      { label: "Loop Copilot", href: "/projects/loop-copilot" },
      { label: "System Design", href: "/system-design" },
    ],
  },
  {
    slug: "claude-architect",
    title: "Claude Certified Architect",
    org: "Anthropic",
    status: "registered · exam scheduled",
    description:
      "Registered for Anthropic's Claude Certified Architect examination; the credential will be published here on completion.",
    paragraphs: [
      "I am registered for the Anthropic Claude Certified Architect examination, which assesses the design of production Claude systems: agentic workflows, tool use, context and memory management, evaluation, and deployment architecture. Once the certification is complete, the credential will be uploaded here.",
    ],
    related: [
      { label: "Independent Projects", href: "/projects" },
      { label: "Mind Map", href: "/map" },
    ],
  },
];

export const EDUCATION: Credential[] = [
  {
    slug: "iiitb-ml-ai",
    title: "PG Diploma in Machine Learning and AI",
    org: "IIIT Bangalore",
    related: [
      { label: "WealthOS", href: "/projects/wealthos" },
      { label: "QE Platform", href: "/projects/qe-platform" },
    ],
  },
  {
    slug: "btech-cse",
    title: "B.Tech, Computer Science and Engineering",
    org: "",
    related: [{ label: "All projects", href: "/projects" }],
  },
];

export function findCredential(slug: string): Credential | undefined {
  return [...CERTIFICATIONS, ...EDUCATION].find((c) => c.slug === slug);
}
