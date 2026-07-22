import { getAllContentDocs } from "@/lib/content";

export interface Chunk {
  id: string;
  source: string;
  text: string;
}

/**
 * Chunk the content corpus by paragraph groups. The same chunks feed both the
 * pgvector ingest (when configured) and the in-memory fallback retriever.
 */
export function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const { source, doc } of getAllContentDocs()) {
    const paras = doc.body
      .split(/\n{2,}/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter((p) => p.length > 40);
    // group ~2 paragraphs per chunk for context coherence
    for (let i = 0; i < paras.length; i += 2) {
      const text = paras.slice(i, i + 2).join("\n\n");
      chunks.push({ id: `${source}#${i}`, source, text });
    }
  }
  return chunks;
}
