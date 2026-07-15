---
title: Enterprise Knowledge Assistant
public_name: Enterprise Knowledge Assistant · Conversational RAG (HPE)
slug: hpe-rag-chatbot
status: production
group: work
tagline: Conversational RAG over enterprise process knowledge for support engineers
stack: [Production RAG, hybrid search, re-ranking, Squidex CMS, Confluence, Docker, AWS, load balancing, evaluation loops]
metric: "Repeat escalations down ~40%; response relevance up 30-40% in pilot"
order: 5
---

## Overview
I led an enterprise conversational AI assistant for support engineers across HPE. It retrieves grounded answers from roughly 1,700 internal process documents sourced from a Squidex content management system and Confluence, and cut repeat escalations by ~40%. Over the project it moved from rule-based FAQ retrieval to an LLM-assisted, retrieval-augmented architecture, and shipped as a dockerized deployment behind a load balancer, sized for a 20,000-concurrent-user target.

## The problem
Support engineers burned time hunting for process documentation, and the rule-based FAQ system fell over on anything outside its predefined set. Escalations repeated because the answers were hard to find, not because they were missing.

## My role
I built the case for the redesign off customer usage analysis, architected the migration from rule-based FAQ to LLM-assisted RAG, designed the retrieval pipeline end to end, and owned the rollout.

## Key decisions
1. **Hybrid search over pure vector retrieval.** Enterprise-jargon queries break cosine similarity; combining semantic and keyword signals with metadata filtering rescued them.
2. **Chunking with overlap calibration.** Retrieval quality was tuned at the chunk boundary level, not just the embedding level.
3. **Re-ranking on top of hybrid recall.** One extra hop of latency, traded for a 30-40% response relevance lift measured in pilot.
4. **Evaluation loops on a held-out set.** Retrieval precision was measured against a fixed evaluation set on every pipeline change, so improvements were provable rather than anecdotal.
5. **Incremental migration, not a rewrite.** Evolving the live rule-based system kept the escalation baseline measurable and de-risked the cutover.

## The outcome
Repeat escalations down ~40%. Response relevance up 30-40% in pilot against a held-out evaluation set. Deployed as dockerized services behind a load balancer with continuous ingestion from Squidex and Confluence.
