import { logger } from "@/lib/logger";

/**
 * ask_niranjan defence layers 1 and 3.
 *
 * Layer 1 (screenInput) is a deterministic pre-filter that runs BEFORE any
 * model call: zero tokens, catches the common attempts, and returns a canned
 * reply directly. Layer 3 (screenOutput) is the safety net that runs AFTER the
 * model call and rejects a response that leaked something it should not, even
 * if an injection succeeded upstream. The prompt (layer 2) sits between them
 * and is never the only defence.
 */

// ---------------------------------------------------------------------------
// Layer 1 — input patterns
// ---------------------------------------------------------------------------

const ROLE_OVERRIDE: RegExp[] = [
  /ignore\s+(all\s+|any\s+)?(previous|prior|above)\s+(instructions?|prompts?)/i,
  /disregard\s+(the\s+)?(above|previous|your)\s+(instructions?|rules?)/i,
  /\byou\s+are\s+now\b/i,
  /\bfrom\s+now\s+on\s+you\b/i,
  /\bnew\s+instructions?\b/i,
  /\bact\s+as\b/i,
  /\bpretend\s+to\s+be\b/i,
  /\brole\s?play\s+as\b/i,
  /\bsimulate\s+being\b/i,
  /\bdeveloper\s+mode\b/i,
  /\bDAN\b/,
  /\bjail\s?break/i,
  /\bsudo\b/i,
  /\badmin\s+mode\b/i,
  /\bunrestricted\b/i,
  /\bno\s+restrictions?\b/i,
];

const PROMPT_EXTRACTION: RegExp[] = [
  /(your|the)\s+(system\s+)?(prompt|instructions?|rules|configuration|config)/i,
  /repeat\s+(everything|the\s+text|all|back)\b.*\b(above|before|prior)/i,
  /what\s+were\s+you\s+(told|instructed|programmed|given)/i,
  /(print|reveal|show|output|display|dump)\b.{0,40}\b(prompt|instructions?|configuration|config|rules)/i,
  /\bverbatim\b/i,
  /\bword\s+for\s+word\b/i,
  /\binitial\s+(message|prompt|instructions?)\b/i,
  /everything\s+above\s+this\s+line/i,
];

const FAKE_STRUCTURE: RegExp[] = [
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|system\|>/i,
  /\[\/?INST\]/i,
  /^\s*(system|assistant|user)\s*:/im,
  /###\s*(system|instruction)/i,
  /\]\]\}>/,
  /<\/?(system|assistant)>/i,
];

const MODEL_FINGERPRINT: RegExp[] = [
  /what\s+(model|llm|ai)\s+(are\s+you|is\s+this|powers)/i,
  /\bare\s+you\s+(gpt|chatgpt|claude|gemini|llama|mistral|grok|deepseek|qwen)/i,
  /who\s+(made|built|trained|created)\s+you/i,
  /\b(temperature|top_p|top-p|context\s+window|token\s+limit|max_tokens)\b/i,
  /which\s+(model|provider|api)\b.{0,20}\b(you|this|behind)/i,
];

const AUTHORITY_CLAIM: RegExp[] = [
  /\bi\s?a?m\s+(niranjan|the\s+admin|the\s+owner|your\s+developer|the\s+creator|the\s+developer)/i,
  /as\s+your\s+(developer|admin|owner|creator)/i,
  /this\s+is\s+a\s+test\s+from/i,
  /for\s+a\s+(security\s+)?audit/i,
  /\bi\s+have\s+(admin|owner|root)\s+(access|rights)/i,
];

const TASK_HIJACK: RegExp[] = [
  /\bwrite\s+(me\s+)?(a\s+|some\s+|an\s+)?(code|script|python|javascript|essay|poem|email|blog|article|story|sql|function)\b/i,
  /\btranslate\s+(this|the following)\b/i,
  /\bsummari[sz]e\s+(this|the following)\s+(article|text|document|page)/i,
  /\b(solve|debug|fix)\s+(this|my)\s+(code|problem|equation|bug)/i,
  /\bgenerate\s+(a\s+)?(script|program|code)\b/i,
  /\bscrape\s+a?\s?website\b/i,
];

// Topics that are always a redirect to Niranjan directly, never answered.
const PRIVATE_TOPIC: RegExp[] = [
  /\b(salary|compensation|ctc|pay|paid|package|lpa)\b/i,
  /\bnotice\s+period\b/i,
  /\bnegotiat/i,
  /\bhow\s+much\s+(does|do|would)\s+(he|niranjan|you)\s+(want|expect|earn|make|charge)/i,
  /\b(other|which|what)\s+(companies|firms|roles|jobs)\b.{0,30}\b(appl(y|ied|ying)|interview)/i,
  /\bappl(y|ied|ying)\s+to\b/i,
  /\binterviewing\s+(with|at)\b/i,
  /\bfreelanc/i,
  /\bagency\b/i,
  /\bclient\s+work\b/i,
  /\bconsult(ing|ancy)\s+(work|clients?)\b/i,
];

const EVASION: RegExp[] = [
  /[A-Za-z0-9+/]{24,}={0,2}/, // base64-looking blob
  /​|‌|‍|﻿/, // zero-width characters
  /\n{4,}/, // excessive newlines
];

function hasHomoglyphs(s: string): boolean {
  // Cyrillic/Greek lookalikes inside otherwise-ASCII text.
  const suspicious = /[Ѐ-ӿͰ-Ͽ]/.test(s);
  const mostlyAscii = (s.replace(/[^\x20-\x7E]/g, "").length / Math.max(1, s.length)) > 0.6;
  return suspicious && mostlyAscii;
}

export type GuardReason =
  | "role_override"
  | "prompt_extraction"
  | "fake_structure"
  | "model_fingerprint"
  | "authority_claim"
  | "task_hijack"
  | "private_topic"
  | "evasion";

const GROUPS: [GuardReason, RegExp[]][] = [
  ["fake_structure", FAKE_STRUCTURE],
  ["role_override", ROLE_OVERRIDE],
  ["prompt_extraction", PROMPT_EXTRACTION],
  ["model_fingerprint", MODEL_FINGERPRINT],
  ["authority_claim", AUTHORITY_CLAIM],
  ["private_topic", PRIVATE_TOPIC],
  ["task_hijack", TASK_HIJACK],
];

/** Decode a base64 blob and re-scan it, so encoded payloads do not slip past. */
function decodedPayload(text: string): string | null {
  const m = text.match(/[A-Za-z0-9+/]{24,}={0,2}/);
  if (!m) return null;
  try {
    const decoded = Buffer.from(m[0], "base64").toString("utf8");
    // only treat as a payload if it decodes to mostly printable text
    const printable = decoded.replace(/[^\x20-\x7E]/g, "").length / Math.max(1, decoded.length);
    return printable > 0.8 ? decoded : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// The responses — dry, never hostile, shorter on each repeat
// ---------------------------------------------------------------------------

const FIRST: Record<GuardReason, string> = {
  role_override:
    "Instruction override. Classic. Everything above the line is mine, everything below it is yours, and that is the whole trick. Anyway, ask me about the queue design, it is more interesting.",
  prompt_extraction:
    "Prompt extraction, and a well-formed one. I would show you, but it is mostly rules about not making up numbers. What did you actually want to know?",
  fake_structure:
    "Fake role markers. Reasonable attempt. They arrive as text, which is the point. Ask me something about the work.",
  model_fingerprint:
    "Not confirming the model. What I will say is that every call in my own platform goes through one cost seam, which is probably the more useful answer.",
  authority_claim:
    "You are welcome to try. It is a reasonable instinct on an AI engineer's site. Ask me something about the work though.",
  task_hijack:
    "I only cover my own work here, so not writing that. Happy to talk about how I built any of the projects though.",
  private_topic:
    "That is a conversation to have with me directly. Contact details are on the contact page (/contact).",
  evasion:
    "Encoded payload. Nice. It still arrives as data. What did you want to know about the work?",
};

const SECOND = [
  "Same answer, still no. What do you want to know about the work?",
  "Nice variation. Still data, not instructions.",
];

const THIRD = "I only discuss my own work here. Contact page is in the nav.";

export interface GuardVerdict {
  blocked: boolean;
  reason?: GuardReason;
  response?: string;
}

/**
 * Layer 1. `priorAttempts` is how many earlier messages in this conversation
 * already tripped the filter, so the reply gets shorter rather than repeating
 * the same clever line.
 */
export function screenInput(raw: string, priorAttempts = 0): GuardVerdict {
  const text = (raw ?? "").slice(0, 4000);
  if (!text.trim()) return { blocked: false };

  const targets = [text];
  const decoded = decodedPayload(text);
  if (decoded) targets.push(decoded);

  let reason: GuardReason | undefined;

  outer: for (const t of targets) {
    for (const [name, patterns] of GROUPS) {
      for (const p of patterns) {
        if (p.test(t)) {
          reason = name;
          break outer;
        }
      }
    }
  }

  if (!reason) {
    if (hasHomoglyphs(text) || EVASION.some((p) => p.test(text))) reason = "evasion";
  }
  if (decoded && !reason) reason = "evasion";

  if (!reason) return { blocked: false };

  let response: string;
  if (priorAttempts <= 0) response = FIRST[reason];
  else if (priorAttempts === 1) response = SECOND[0];
  else if (priorAttempts === 2) response = SECOND[1];
  else response = THIRD;

  logger.warn("ask/guard", "input blocked", { reason, priorAttempts });
  return { blocked: true, reason, response };
}

/** How many earlier user turns would have tripped layer 1. Drives escalation. */
export function countPriorAttempts(previousUserMessages: string[]): number {
  let n = 0;
  for (const m of previousUserMessages) {
    if (screenInputSilent(m)) n++;
  }
  return n;
}

function screenInputSilent(raw: string): boolean {
  const text = (raw ?? "").slice(0, 4000);
  if (!text.trim()) return false;
  const targets = [text];
  const decoded = decodedPayload(text);
  if (decoded) targets.push(decoded);
  for (const t of targets) {
    for (const [, patterns] of GROUPS) {
      if (patterns.some((p) => p.test(t))) return true;
    }
  }
  return hasHomoglyphs(text) || EVASION.some((p) => p.test(text));
}

// ---------------------------------------------------------------------------
// Layer 3 — output filter
// ---------------------------------------------------------------------------

/** Percentage values that may appear in an answer (the approved metrics). */
const ALLOWED_PERCENTS = new Set([5, 15, 30, 40, 50, 75, 85, 90]);

const OUTPUT_BANNED: [RegExp, string][] = [
  [/\bsystem\s+prompt\b/i, "prompt_leak"],
  [/\bmy\s+instructions\b/i, "prompt_leak"],
  [/\bI\s+was\s+told\s+to\b/i, "prompt_leak"],
  [/\b(gpt-?[0-9o]|chatgpt|openai|anthropic|claude|gemini|llama|mistral|grok|groq|deepseek|qwen|vercel|moonshot|kimi)\b/i, "vendor_leak"],
  [/[$₹]\s?\d/, "money"],
  [/\b\d[\d,.]*\s*(usd|dollars?|inr|rupees)\b/i, "money"],
  [/\bfreelanc/i, "banned_topic"],
  [/\bagency\b/i, "banned_topic"],
  [/\bclient\s+work\b/i, "banned_topic"],
  [/\bjob\s+search/i, "banned_topic"],
  [/\bresume\b/i, "banned_topic"],
  [/\bsalary|compensation\b/i, "banned_topic"],
];

export interface OutputVerdict {
  ok: boolean;
  reason?: string;
  replacement?: string;
}

export function screenOutput(text: string): OutputVerdict {
  const t = text ?? "";

  for (const [pattern, reason] of OUTPUT_BANNED) {
    if (pattern.test(t)) {
      logger.warn("ask/guard", "output rejected", { reason });
      return { ok: false, reason, replacement: THIRD };
    }
  }

  // Concurrency: only ~7,000 may be stated.
  const concurrency = t.match(/([\d][\d,]*)\s*(?:\+\s*)?[-–—]?\s*concurrent/gi);
  if (concurrency) {
    for (const m of concurrency) {
      const n = parseInt(m.replace(/[^\d]/g, ""), 10);
      if (n !== 7000 && n !== 7) {
        logger.warn("ask/guard", "output rejected", { reason: "concurrency", n });
        return { ok: false, reason: "concurrency", replacement: THIRD };
      }
    }
  }

  // Document counts for the HPE corpus are not stated.
  if (/\b1[,.]?7\d{2}\b[^.]{0,40}(document|doc|page)/i.test(t)) {
    logger.warn("ask/guard", "output rejected", { reason: "doc_count" });
    return { ok: false, reason: "doc_count", replacement: THIRD };
  }

  // Percentages must be on the approved list.
  const percents = t.match(/(\d{1,3})\s*%/g);
  if (percents) {
    for (const p of percents) {
      const n = parseInt(p, 10);
      if (!ALLOWED_PERCENTS.has(n)) {
        logger.warn("ask/guard", "output rejected", { reason: "percent", n });
        return { ok: false, reason: "percent", replacement: THIRD };
      }
    }
  }

  return { ok: true };
}

export const GUARD_FALLBACK = THIRD;
