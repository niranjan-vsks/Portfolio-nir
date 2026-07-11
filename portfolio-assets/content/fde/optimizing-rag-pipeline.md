---
title: Optimizing the RAG Pipeline
slug: optimizing-rag-pipeline
order: 3
caption: reranking, compression, rerouting, and the last 10% of quality
back: "The optimization loop after RAG works: reranking, context compression, query transformation and rerouting, and evaluation that proves each change earned its complexity."
tags:
  - { label: "Reranking", node: "skill_reranking" }
  - { label: "Context Compression", node: "skill_context_compression" }
  - { label: "Query Transformation", node: "skill_query_transformation" }
  - { label: "Query Rerouting", node: "skill_query_rerouting" }
  - { label: "RAGAS", node: "skill_ragas" }
---

Getting RAG working is the first half; making it accurate, fast, and affordable under real load is the half that decides whether the customer renews. My optimization loop is measured, not vibes: every technique below earned its place by moving an evaluation metric.

## What this looks like in practice

- Reranking after retrieval: the first-pass retriever recalls wide, a reranker orders for precision, and the context window only sees what survives both. Implemented in the AI-Infused QE Platform's retrieval path.
- Context compression before generation, so long documents contribute their relevant spans instead of their bulk. This is a quality technique and a cost technique at once.
- Query transformation and rerouting at the front door: malformed or underspecified queries get rewritten, and low-complexity queries route to lighter models before touching the expensive path.
- Evaluation loops close the cycle: retrieval precision measured against a held-out set in the conversational RAG pilot (response relevance up 30-40%), and RAGAS plus Acceptance Criteria Coverage and Test Design Coverage running continuously in the QE platform.

## Where it shows up

The AI-Infused QE Platform (the ~15% to under 5% hallucination drop came from this loop, not from one silver bullet) and the enterprise conversational RAG pipeline.
