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

// Tokens from a source path (e.g. "projects/loop-copilot.md" -> loop, copilot).
function sourceTokens(source: string): string[] {
  return source
    .replace(/\.md$/, "")
    .split(/[/\-_]/)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 2);
}

export function retrieve(query: string, k = 5): Chunk[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qSet = new Set(qTokens);

  const scored = chunks().map((c) => {
    const text = c.text.toLowerCase();
    let score = 0;
    for (const t of qTokens) {
      const matches = text.split(t).length - 1;
      score += matches;
      // boost the interview corpus: highest-value persona source
      if (c.source.startsWith("interview/") && matches > 0) score += 1.5;
    }
    // Strong source affinity: if the query names a project/section by its file
    // slug, prioritize that file. Prevents cross-project contamination (e.g.
    // "Loop Copilot" pulling Saarthi chunks because both say "copilot").
    const srcMatches = sourceTokens(c.source).filter((t) => qSet.has(t)).length;
    if (srcMatches > 0) score += srcMatches * 6;
    return { c, score };
  });

  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  // If any chunk has a clear source-affinity winner, keep the top source's
  // chunks first so the answer stays grounded in the right project.
  return ranked.slice(0, k).map((s) => s.c);
}
