import { buildChunks, type Chunk } from "@/lib/rag/chunk";

/**
 * Retrieval (bullseye/08). When a pgvector store + embeddings are configured,
 * swap this for a vector search (see scripts/ingest.ts). Until then this is a
 * working keyword/overlap retriever over the same chunks, so the UI runs and
 * answers stay grounded in portfolio-assets/content. Never fabricates.
 */

const STOP = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is",
  "are", "was", "were", "it", "this", "that", "i", "you", "me", "my", "how",
  "what", "when", "why", "do", "did", "does", "tell", "about", "your", "yours",
  "can", "would", "should", "have", "has", "as", "at", "by", "from", "be",
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

let cache: Chunk[] | null = null;
function chunks(): Chunk[] {
  if (!cache) cache = buildChunks();
  return cache;
}

export function retrieve(query: string, k = 5): Chunk[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const scored = chunks().map((c) => {
    const text = c.text.toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      const matches = text.split(t).length - 1;
      score += matches;
      // boost the interview corpus: highest-value persona source
      if (c.source.startsWith("interview/") && matches > 0) score += 1.5;
    }
    return { c, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => s.c);
}
