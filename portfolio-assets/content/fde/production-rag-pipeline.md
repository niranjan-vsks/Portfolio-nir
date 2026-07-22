---
title: Building the Production RAG Pipeline
slug: production-rag-pipeline
order: 2
caption: GraphRAG, hybrid search, and retrieval that survives production
back: "The full retrieval stack I build from scratch, from chunking and hybrid search to GraphRAG on Neo4j, and how it cut hallucination from ~15% to under 5%."
tags:
  - { label: "GraphRAG", node: "skill_graphrag" }
  - { label: "Agentic RAG", node: "skill_agentic_rag" }
  - { label: "Neo4j", node: "skill_neo4j" }
  - { label: "Hybrid Search", node: "skill_hybrid_search" }
  - { label: "Chunking Strategy", node: "skill_chunking_strategy" }
  - { label: "Entity Normalization", node: "skill_entity_normalization" }
---

Demo RAG is a weekend; production RAG is a discipline. I have built the full retrieval stack from scratch twice, in two different enterprises, and the pattern that survives is layered: get ingestion and chunking right, make search hybrid, and put a knowledge graph where cosine similarity loses structure.

## What this looks like in practice

- Engineered GraphRAG on Neo4j for the AI-Infused QE Platform with entity normalization at ingest, so "login page", "sign-in screen", and "auth UI" resolve to one entity instead of three retrieval misses.
- Layered Agentic RAG over Jira and Azure DevOps so test generation is scoped against linked stories, epics, and acceptance criteria, not just similar-looking text.
- Designed an enterprise conversational RAG pipeline end to end: chunking with overlap calibration over ~1,700 internal documents, hybrid search combining semantic and keyword signals (OpenSearch), and metadata filtering tuned for enterprise-jargon queries. Response relevance improved 30-40% in pilot; repeat escalations fell ~40%.
- Guardrails sit at both ends: input-side scope checks and output-side grounding checks, so the pipeline fails safe instead of failing confident.

## Where it shows up

The AI-Infused QE Platform (GraphRAG on Neo4j for relationship-heavy QA docs) and the enterprise conversational RAG migration (hybrid search over ~1,700 documents behind a load balancer). WealthOS deliberately inverts the pattern: event-sourced memory where retrieval would hallucinate.
