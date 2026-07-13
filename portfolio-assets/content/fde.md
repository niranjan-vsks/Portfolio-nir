---
title: Forward Deployed Engineering
slug: fde
tags:
  - customer-facing engineering
  - solutions architecture
  - customer discovery
  - stakeholder alignment
  - multi-tenant architecture
  - cloud optimization
  - LLM token & cost engineering
  - infrastructure optimization
  - identity & SSO architecture
  - production deployment
---

The role I actually do: ship into enterprise environments end to end, from cold-start discovery through architecture, implementation, and production deployment inside customer-managed clouds. Comfortable as the sole engineer on a zero-to-one build or embedded inside a customer's engineering team.

## Customer-facing work

- Took an agentic quality-engineering platform from feasibility framing through production rollout to 17 enterprise QA teams at peak adoption.
- Built the case for an enterprise conversational RAG redesign through customer usage analysis showing the rule-based system failing outside its predefined set, then owned the rollout end to end.
- Took Loop Copilot from customer discovery through V2 inside a Fortune 500 sales org, where the pilot drove a V2 expansion request within two weeks.

## Architecture-level work

- Deployed one codebase across customer-managed AWS, Azure, and GCP, adapting architecture, compute sizing, and identity (Azure AD, IAM, SSO) to each tenant's cloud with no forks.
- Engineered advanced RAG from scratch: GraphRAG on Neo4j with entity normalization, reranking, context compression, metadata filtering, query rerouting, and guardrails.
- Secured multi-tenant isolation with tenant-aware RBAC: module-level CRUD-X permissions and role templates that onboard new enterprise customers without rebuilding the permission model.

## Cost, cloud, and token optimization

- Cut per-tenant LLM spend through token and cost engineering: context compression, prompt-payload reduction, and rerouting low-complexity queries to lighter models.
- Built the LLM observability and FinOps layer beneath it: per-tenant cost telemetry plus quality evaluation (Acceptance Criteria Coverage, Test Design Coverage, RAGAS).
- Adapted compute sizing per tenant cloud so the same platform runs efficiently in each customer's environment.

## Stakeholder interactions

- Customer stakeholders use the cost and quality telemetry live to track spend and output quality.
- Designed the D365 integration inside the customer's tenant trust model: Power Automate flows authenticated by internal tenant identity, with direct Dataverse REST via MSAL held in reserve for environments that grant broader permissions.
- Drove production hallucination from ~15% to under 5% via GraphRAG and entity normalization, the accuracy bar enterprise QA teams held the platform to.
