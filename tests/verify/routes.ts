// Routes crawled by the verification suite (PRD §20.1). Extend as phases add
// routes. Keep in sync with the App Router. /experience lands in R4.
export const ROUTES = [
  "/",
  "/map",
  "/projects",
  "/projects/loop-copilot",
  "/projects/saarthi",
  "/projects/rebalancer",
  "/projects/qe-platform",
  "/projects/hpe-rag-chatbot",
  "/projects/global-census-chatbot",
  "/system-design",
  "/dashboard",
  "/about",
  "/skills",
  "/certifications",
  "/education",
  "/credential/bitsom-pm-genai",
  "/credential/claude-architect",
  "/credential/iiitb-ml-ai",
  "/credential/btech-cse",
  "/chat",
  "/contact",
  "/work-with-me",
];

// Employer/client names that must never appear on architecture surfaces (§2 rule 2).
export const FIREWALL_NAMES = ["Coforge", "Mphasis", "Lenovo", "Worktop"];

// Banned phrases in user-facing copy (§2 rule 8) + em-dash.
export const BANNED = [
  "—",
  "at the intersection of",
  "bypassed OAuth",
  "fine-tuning",
  "comfortable owning",
  "when the situation calls for it",
];
