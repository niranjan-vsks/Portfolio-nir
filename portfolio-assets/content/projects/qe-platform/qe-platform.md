---
title: AI Quality Engineering Platform
public_name: AI-Infused Agentic Quality Engineering Platform
slug: qe-platform
status: production
demo: none
tagline: Agentic QA platform · from user story to deployed test
stack: [GraphRAG, Neo4j, vector store, Agentic RAG, custom Playwright MCP, AWS Bedrock LLM, FastAPI, React, tenant-aware RBAC, LLM observability]
metric: "Manual effort on covered workflows cut ~85%; hallucination ~15% -> under 5%; deployed across 17 enterprise QA teams at peak adoption"
signature_visual: static-architecture
order: 4
nda: true
---

## NDA framing (must hold)
No customer names. Architecture shown as a clean, redacted reference (no IPs, hostnames, or client names). "17 teams" is shareable but softened to "across enterprise QA teams (17 at peak adoption)." Do not headline internal codenames.

## The problem
QA at enterprise scale means thousands of test cases to author, maintain, and execute, most of it repetitive translation from user stories (Jira/ADO) into test scripts (Playwright/Cypress). Existing AI test-generation tools hallucinate against the customer's actual documentation, ship wrong test cases, and break trust.

## My role
Owned the platform end to end as senior engineer: feasibility framing, architecture, build, production rollout, and adoption across enterprise QA teams. Made the architectural calls, established the metrics framework, and drove iterative refinement on team-specific feedback.

## The outcome
Manual effort on covered test-authoring and triage workflows cut ~85%. Script authoring time down ~75% versus writing Playwright/Cypress by hand. Hallucination from ~15% to under 5% via GraphRAG and entity normalization. Deployed across 17 QA teams at peak adoption with sustained usage beyond MVP, on customer-managed AWS, Azure, and GCP.

## Key decisions
1. **GraphRAG over vanilla RAG.** Enterprise QA docs have entity relationships (epics, stories, acceptance criteria, existing tests) that cosine similarity loses. GraphRAG plus entity normalization preserves them. Cost framing: ~30-40% higher token cost per query, offset by ~50% fewer regenerations, netting a lower cost per acceptable output.
2. **Agentic RAG for ticket retrieval.** Agents orchestrate: find the user story, fetch linked epics and acceptance criteria, pull existing test cases as in-context examples to match team style and cut hallucination.
3. **Three-dimensional quality framework:** Acceptance Criteria Coverage, Test Design Coverage, and RAGAS. Ships managers an audit-defensible quality scoreboard, which makes the platform defensible at budget reviews.
4. **LLM observability + per-tenant context optimization:** token-level cost telemetry per tenant and context budgets tuned to each tenant's query patterns, cutting inference cost at scale while preserving accuracy.
5. **Tenant-aware RBAC** with module-level CRUD-X permissions and role templates (QA Manager, Test Lead, QE Engineer, Technical Lead) that onboard new customers from their existing org charts. Tradeoff: RBAC added weeks to the MVP, but bolting it on late costs far more.

## What I would do differently
Flip the personalization model: instead of a uniform interface, a per-user agent that infers role and proficiency and surfaces a personalized, most-actionable home view. Then agentify every remaining GenAI-only module so the whole workflow is autonomous, not just specific surfaces.
