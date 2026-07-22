# Architecture · Enterprise Knowledge Assistant (Conversational RAG, HPE)

The deployed production architecture, as walked on /system-design.

## Shape
Support engineers hit a web chat surface. An AWS Application Load Balancer fronts a fleet of stateless, dockerized chat API containers (autoscaled; designed for a 20,000-concurrent-user target). The API hands each query to a RAG orchestrator: query transformation, hybrid retrieval fan-out, re-ranking, context assembly, generation with source citations.

## Retrieval
- Corpus: ~1,700 internal process documents ingested from Squidex CMS (webhook-driven sync) and Confluence, chunked with overlap calibration, metadata-tagged, embedded, incrementally re-indexed.
- Hybrid index: semantic vectors + keyword (BM25) signals + metadata filtering, tuned for enterprise-jargon queries where pure cosine similarity fails.
- Cross-encoder re-ranking on top of hybrid recall: +30-40% response relevance in pilot, measured on a held-out evaluation set.

## Operations
- Response/session cache keeps hot questions off the LLM.
- Secrets in a managed secrets store; nothing in images or env files.
- Latency, retrieval hit-rate, and escalation telemetry in CloudWatch-class monitoring; repeat escalations fell ~40%.

## Tradeoffs I defend
Hybrid over pure vector (jargon), re-rank latency for relevance, and an incremental migration from the rule-based system so the escalation baseline stayed measurable.
