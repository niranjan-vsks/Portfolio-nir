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
Enterprise QA runs on thousands of test cases that someone has to author, maintain, and execute. Most of that is grunt translation: turning user stories in Jira/ADO into Playwright or Cypress scripts. The AI test-generation tools already on the market hallucinate against the customer's own documentation, ship wrong test cases, and burn the team's trust.

## My role
I owned the platform end to end as senior engineer, from feasibility framing through architecture, build, production rollout, and adoption across enterprise QA teams. I made the architectural calls, built the metrics framework, and drove the refinement loop off team-specific feedback.

## The outcome
Manual effort on covered test-authoring and triage workflows dropped ~85%. Script authoring ran ~75% faster than writing Playwright or Cypress by hand. GraphRAG and entity normalization pulled hallucination from ~15% to under 5%. The platform deployed across 17 QA teams at peak adoption and held usage well past MVP, running on customer-managed AWS, Azure, and GCP.

## Key decisions
1. **GraphRAG over vanilla RAG.** Enterprise QA docs have entity relationships (epics, stories, acceptance criteria, existing tests) that cosine similarity loses. GraphRAG plus entity normalization preserves them. Cost framing: ~30-40% higher token cost per query, offset by ~50% fewer regenerations, netting a lower cost per acceptable output.
2. **Agentic RAG for ticket retrieval.** Agents orchestrate: find the user story, fetch linked epics and acceptance criteria, pull existing test cases as in-context examples to match team style and cut hallucination.
3. **Three-dimensional quality framework:** Acceptance Criteria Coverage, Test Design Coverage, and RAGAS. Managers get an audit-defensible quality scoreboard, which is what kept the platform funded at budget reviews.
4. **LLM observability + per-tenant context optimization:** token-level cost telemetry per tenant and context budgets tuned to each tenant's query patterns, cutting inference cost at scale while preserving accuracy.
5. **Tenant-aware RBAC** with module-level CRUD-X permissions and role templates (QA Manager, Test Lead, QE Engineer, Technical Lead) that onboard new customers from their existing org charts. Tradeoff: RBAC added weeks to the MVP, but bolting it on late costs far more.

## What I would do differently
Flip the personalization model: instead of a uniform interface, a per-user agent that infers role and proficiency and surfaces a personalized, most-actionable home view. Then agentify every remaining GenAI-only module so the whole workflow is autonomous, not just specific surfaces.
