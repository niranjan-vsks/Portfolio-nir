/**
 * Credentials (from about.md "## Credentials" — all real, no fabrication).
 * `description` is intentionally a content slot Niranjan fills later; when empty
 * the page omits it rather than showing an invented blurb (PRD 1.2, lock #4).
 * `related` links to project pages reachable from the credential (multi-route).
 */
export interface Credential {
  slug: string;
  title: string;
  org: string;
  status?: string;
  description?: string; // filled by Niranjan; omitted when empty
  related: { label: string; href: string }[];
}

export const CERTIFICATIONS: Credential[] = [
  {
    slug: "bitsom-pm-genai",
    title: "Advanced Certification in Product Management for GenAI / Agentic AI",
    org: "BITSoM",
    related: [
      { label: "Loop Copilot", href: "/projects/loop-copilot" },
      { label: "System Design", href: "/system-design" },
    ],
  },
  {
    slug: "claude-architect",
    title: "Claude Certified Architect",
    org: "Anthropic",
    status: "in progress · expected June 2026",
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
      { label: "Rebalancer", href: "/projects/rebalancer" },
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
