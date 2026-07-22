/**
 * RAG ingestion (bullseye/07 + 08). Chunks portfolio-assets/content/ and, when
 * a pgvector store + embeddings provider are configured, upserts embeddings.
 *
 * Run: npx tsx scripts/ingest.ts
 *
 * Without SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY this prints the chunk plan
 * only (no-op), so it is safe to run before secrets are set. The live chatbot
 * uses the in-memory keyword retriever until this is wired to a real store.
 *
 * TODO(niranjan):
 *   1. set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and an embeddings key in .env.local
 *   2. create the pgvector table:
 *        create extension if not exists vector;
 *        create table content_chunks (
 *          id text primary key,
 *          source text,
 *          text text,
 *          embedding vector(1536)
 *        );
 *   3. fill in the embed() + upsert() calls below for your provider
 *   4. swap src/lib/rag/retrieve.ts to query this table by cosine distance
 */
import { buildChunks } from "../src/lib/rag/chunk";

async function main() {
  const chunks = buildChunks();
  console.log(`Built ${chunks.length} chunks from portfolio-assets/content/`);

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log(
      "No pgvector store configured. Dry run only. Set SUPABASE_URL + " +
        "SUPABASE_SERVICE_ROLE_KEY to ingest. (bullseye/08)",
    );
    for (const c of chunks.slice(0, 5)) {
      console.log(`  - ${c.id} (${c.text.length} chars)`);
    }
    return;
  }

  // TODO(niranjan): embed + upsert. Example shape:
  // for (const c of chunks) {
  //   const embedding = await embed(c.text);
  //   await upsert(url, key, { id: c.id, source: c.source, text: c.text, embedding });
  // }
  console.log("Store configured. Wire embed()/upsert() to complete ingestion.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
