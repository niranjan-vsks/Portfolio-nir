---
title: Agentic Codebase Intelligence System
public_name: Agentic Codebase Intelligence System
slug: codebase-intelligence-system
status: live
group: independent
demo: none
tagline: Cold codebase to prioritized, approved tickets in the customer's own Jira
stack: [Multi-agent orchestration, Audit agent fleet, Dependency graph, Adaptive hybrid retrieval, OKF persistence, Jira MCP, Human approval gate]
tags: [Multi-Agent Systems, Agentic Orchestration, Hybrid Retrieval, GraphRAG, MCP, Human-in-the-Loop, System Design]
results_pending: true
order: 4
---

## The problem

An engineering team's real risk hides in a codebase nobody has read end to end: hardcoded secrets, coupling that will not scale, dead code, dependency traps. A forward deployed engineer walks into that cold, with no brief, and has to say something useful fast. A comprehension tool can show you the graph. It cannot run the audit, weigh conflicting judgments, decide what earns a ticket, and put that ticket in front of the team in their own tracker. That last mile, from a cold codebase to a delivered, actioned outcome, is what I built this to solve.

## The system

I built an autonomous audit system that takes a codebase it has never seen, plans a full technical review, runs a fleet of specialized agents across it, reconciles their findings into a single prioritized picture, and files the approved ones into the customer's Jira as real tickets. Nothing lands in their tracker until a human signs off.

The fleet is deliberate:

- A dependency mapper traces every import, package, and internal call into a graph.
- A security scanner surfaces hardcoded secrets, vulnerable dependencies, injection risks, and auth gaps.
- An architecture reviewer finds coupling, missing abstractions, and scaling bottlenecks.
- A dead-code detector isolates unused functions, deprecated routes, and orphaned files.
- A synthesis pass reconciles the four outputs, resolves conflicts between them with a stated judgment, and ranks everything into critical, high, medium, and low.
- A delivery stage maps the ranked findings to Jira tickets, proposes them for approval, and files only what a human signs off on.

The dependency mapper runs first, the security scanner and architecture reviewer run in parallel, and the dead-code detector runs last. The synthesis step then answers the question nobody asked: not the highest-severity finding, but the most non-obvious inference, the thing the team cannot see from inside that will cost them the most in six months.

## Engineering decisions

1. **Integrated a proven graph layer instead of rebuilding it.** Codebase parsing and dependency-graph construction is a solved problem, so I integrated an established graph engine for ingestion and the dependency map, and spent my build where the value actually is: the autonomous multi-domain audit, the conflict reconciliation across agents, and the delivery layer that lands findings in the customer's tracker. That is the part a customer pays for, and it is the part I built.
2. **Adaptive hybrid retrieval, routed by query type.** The codebase does not fit in context, so retrieval feeds the agents. Dense vector search handles conceptual questions ("where is auth handled"), BM25 handles the exact identifiers and error strings dense retrieval alone misses, and graph traversal handles blast-radius questions ("what calls this"). The query is classified first, then routed to the strategy that fits it, and the merged candidates are reranked before an agent ever sees them. Code is full of exact tokens, which is why hybrid is not optional here.
3. **A persistent knowledge layer, so re-runs get smarter.** Findings, architectural decisions, and conflict resolutions persist as an Open Knowledge Format bundle, one file per concept. On a re-run the system reads the existing bundle first and updates the living picture, noting where new evidence contradicts a prior claim, instead of starting cold. I kept the format behind an interface so it stays swappable while the spec is young.
4. **Jira through MCP, with a direct-API fallback.** The whole system is an orchestration layer selecting and calling tools, and MCP is the tool protocol, so agent-facing calls go through the Jira MCP. The direct REST API is a fallback used only where MCP does not expose a field I need, like a specific custom field or issue type. That is an engineering position, not a preference.
5. **Idempotency through stable fingerprints.** Every finding carries a deterministic fingerprint of its rule, file, and symbol, stored with the ticket. A re-run updates the existing ticket, closes it if the finding is resolved, and creates only genuinely new ones. A re-run that files forty duplicate tickets is a demo. One that reconciles against the backlog is a system.
6. **A human approval gate before any write.** No one lets an agent write to their production tracker unreviewed. The delivery stage proposes a full ticket set with severity-to-priority mapping, evidence, and effort and risk estimates, then stops. A human approves, edits, or rejects, and only approved items are created, with least-privilege auth scoped to the projects it needs and nothing more. This gate is a first-class step, because it is the trust boundary the whole system turns on.

## The delivery layer

This is what turns an artifact into an outcome. Severity maps explicitly to the project's own scheme: critical findings become high-priority bugs or tasks, lower severities carry the right labels, and only components and labels that already exist in the target project are ever used. Each ticket reads on its own, a specific summary, the file and line, why it matters in business terms, the evidence, the confidence level, and the recommended fix, with effort and the risk of acting versus not acting. Anything the system is unsure about is flagged for a human rather than filed.

## The forward deployed statement

I can walk into a codebase I have never seen and deliver a CTO-readable technical audit, with the findings filed as prioritized tickets in the team's own tracker, behind a human approval gate. This is the system I built to do it.
