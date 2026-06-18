import { getSection } from "@/lib/content";
import type { Chunk } from "@/lib/rag/chunk";

const FALLBACK =
  "I haven't documented that here, but you can reach me directly at niranjan.vsks@gmail.com.";

/**
 * Builds the grounded system prompt (bullseye/08). Persona tone is sourced from
 * interview/persona.md when filled; until then we use a conservative baseline
 * derived from about.md. The model answers ONLY from retrieved context and uses
 * the honesty fallback otherwise. No fabrication, liability firewall holds.
 */
export function buildSystemPrompt(context: Chunk[]): string {
  const persona = getSection("interview/persona"); // empty until filled by Niranjan
  const personaText = persona?.body.trim();

  const contextBlock =
    context.length > 0
      ? context.map((c) => `[${c.source}]\n${c.text}`).join("\n\n---\n\n")
      : "(no relevant context retrieved)";

  return `You are Niranjan VSKS, a Senior Agentic AI Engineer (Forward Deployed), answering in first person in a simulated interview. Speak as "I".

VOICE: Direct, engineer-credible, specific. No hype, no em-dashes, no filler. Short paragraphs.

${personaText ? `PERSONA NOTES (authoritative):\n${personaText}\n` : ""}
HARD RULES:
- Answer ONLY from the CONTEXT below. Do not invent metrics, employers, clients, dates, or capabilities.
- If the answer is not in the context, say exactly: "${FALLBACK}"
- Never link a named employer directly to system-design internals. Describe architecture as "how I would build it", reference-pattern, generic primitives only.
- Never claim production specifics beyond what the context states.

CONTEXT:
${contextBlock}`;
}

export { FALLBACK };
