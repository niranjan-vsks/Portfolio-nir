# Architecture · AI-Infused Agentic QE Platform (reference)

The one section on /system-design framed as a genericized reference pattern: how I would build it, generic primitives, no client names. All facts trace to the resume.

## Shape
A role-aware QE workbench (React) behind tenant-aware RBAC (module-level CRUD-X, role templates) talks to an agent orchestrator. Agentic RAG scopes every generation against the issue tracker: the user story, linked epics, acceptance criteria, and existing tests as style examples.

## Retrieval: the sub-5% hallucination stack
GraphRAG on a knowledge graph (Neo4j class) with entity normalization preserves the entity relationships cosine similarity loses, alongside a vector store with query transformation, re-ranking, context compression, and metadata filtering. Hallucination went from ~15% to under 5%.

## Generation and execution
Natural language becomes production-grade Playwright/Cypress scripts through a custom Playwright MCP tool server; suites execute CI-integrated. Test authoring time down ~75%; manual QA effort down 85-90%.

## Quality and cost planes
- Guardrails + eval harness: Acceptance-Criteria Coverage, Test-Design Coverage, RAGAS. Audit-defensible at budget reviews.
- LLM observability + FinOps: token-level per-tenant cost telemetry, context budgets per tenant, low-complexity queries rerouted to lighter models.

## Multi-cloud beam
One codebase, no forks, deployed into customer-managed clouds A/B/C with compute sizing and identity (AD, IAM, SSO) adapted per tenant. 17 enterprise QA teams at peak adoption.

## Tradeoffs I defend
GraphRAG's ~30-40% higher token cost nets cheaper acceptable output (~50% fewer regenerations); RBAC in the MVP cost weeks and saved a rebuild; agentic retrieval latency traded for trust-holding accuracy.
