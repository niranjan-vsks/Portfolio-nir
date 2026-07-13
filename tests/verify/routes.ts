// Routes crawled by the verification suite (PRD §20.1). Extend as phases add
// routes. Keep in sync with the App Router. Updated R12 (2026-07-12).
export const ROUTES = [
  "/",
  "/map",
  "/projects",
  "/projects/loop-copilot",
  "/projects/saarthi",
  "/projects/wealthos",
  "/projects/qe-platform",
  "/projects/hpe-rag-chatbot",
  "/projects/global-census-chatbot",
  "/system-design",
  "/dashboard",
  "/about",
  "/experience",
  "/forward-deployed",
  "/forward-deployed/architecting-ai-solution",
  "/forward-deployed/production-rag-pipeline",
  "/forward-deployed/optimizing-rag-pipeline",
  "/forward-deployed/llm-observability",
  "/forward-deployed/token-optimization",
  "/forward-deployed/cost-optimization",
  "/forward-deployed/finetuning-rlhf-lora",
  "/forward-deployed/guardrails-ai-safety",
  "/forward-deployed/llmops",
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

// Employer/client names that must never appear on architecture surfaces
// (§2 rule 2). Applies to /system-design AND every /forward-deployed page.
export const FIREWALL_NAMES = ["Coforge", "Mphasis", "Lenovo", "Worktop"];
export const FIREWALL_ROUTES = [
  "/system-design",
  ...ROUTES.filter((r) => r.startsWith("/forward-deployed")),
];

// Banned phrases in user-facing copy (§2 rule 8) + em-dash.
// "fine-tuning" was dropped from this list 2026-07-12: Niranjan explicitly
// commissioned the Fine-tuning · RLHF & LoRA capability page (AGain/Right_Now).
export const BANNED = [
  "—",
  "at the intersection of",
  "bypassed OAuth",
  "comfortable owning",
  "when the situation calls for it",
];
