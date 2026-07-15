---
title: Autonomous Codebase Intelligence System
public_name: Autonomous Codebase Intelligence System
slug: codebase-intelligence-system
status: live
group: independent
demo: none
tagline: Cold codebase to prioritized, approved tickets in the customer's own Jira
stack: [Fable 5 orchestrator, Multi-agent audit fleet, Understand Anything (OSS), Adaptive hybrid retrieval, OKF persistence, Jira MCP, Human approval gate]
tags: [Multi-Agent Systems, Agentic Orchestration, Hybrid Retrieval, GraphRAG, MCP, Human-in-the-Loop, Build vs Buy, System Design]
results_pending: true
order: 4
---

## The problem

An engineering team's real risk is spread across a codebase nobody has read end to end: hardcoded secrets, coupling that will not scale, dead code, dependency traps. A forward deployed engineer walks into that cold, with no brief, and has to say something useful fast. A comprehension tool can show you the graph. It cannot run the audit, reconcile conflicting judgments, decide what is worth a ticket, and put that ticket in front of the team in their own tracker. That last mile, from a cold codebase to a delivered, actioned outcome, is the problem this system solves.

## The system

Fable 5 runs as the orchestrator over a fleet of specialized agents. Fed a codebase it has never seen, it plans a full technical audit, spawns sub-agents to execute each domain, reconciles their findings, produces a CTO-readable report, and routes the approved findings into the customer's Jira as real, prioritized tickets. The agent proposes, a human approves, and nothing lands unreviewed.

The fleet is deliberate:

- A dependency mapper traces every import, package, and internal call into a graph.
- A security scanner surfaces hardcoded secrets, vulnerable dependencies, injection risks, and auth gaps.
- An architecture reviewer finds coupling, missing abstractions, and scaling bottlenecks.
- A dead-code detector isolates unused functions, deprecated routes, and orphaned files.
- A synthesis agent reconciles the four outputs, resolves conflicts between them with a stated judgment, and prioritizes everything into critical, high, medium, and low.
- A delivery agent maps the synthesized findings to Jira tickets, proposes them for approval, and files only what a human signs off on.

The dependency mapper runs first; the security scanner and architecture reviewer run in parallel; the dead-code detector runs last. The synthesis step then answers the unasked question: not the highest-severity finding, but the most non-obvious inference, the thing the team probably cannot see from inside that will cause the most pain in six months.

## Build versus buy

Codebase parsing, knowledge-graph construction, and graph exploration are a solved layer, so the system reuses Understand Anything, a mature open-source plugin, for ingestion and the dependency graph rather than rebuilding it. That reuse is disclosed openly and is the point: rebuilding a solved layer demonstrates no judgment. The value lives in what that layer does not do, an autonomous multi-domain audit, conflict reconciliation across agents, and a delivery layer that lands findings in the customer's tracker. That is the part a customer pays for, and that is the part built here.

## Key decisions

1. **Adaptive hybrid retrieval, routed by query type.** The codebase does not fit in context, so retrieval feeds the agents. Dense vector search handles conceptual questions ("where is auth handled"), BM25 handles exact identifiers and error strings that dense retrieval alone misses, and graph traversal over the dependency graph handles blast-radius questions ("what calls this"). The query is classified first, then routed to the strategy that fits it, and the merged candidates are reranked before they reach an agent. Code is full of exact tokens, which is why hybrid is not optional here.
2. **OKF as the persistence layer.** Findings, architectural decisions, and conflict resolutions are stored as an Open Knowledge Format bundle, one markdown file per concept. On a re-run the orchestrator reads the existing bundle first and updates the living picture, noting where new evidence contradicts a prior claim, rather than starting cold. Retrieval finds; OKF organizes and persists. They are different layers, and the format sits behind an interface so it stays swappable while the spec is young.
3. **Jira via MCP, direct API only where MCP falls short.** The whole architecture is an orchestrator selecting and calling tools, and MCP is the tool-use protocol, so agent-facing calls go through the Jira MCP. The direct REST API is a fallback used only where the MCP does not expose a needed field, such as a specific custom field or issue type. That is an engineering position, not a preference.
4. **Idempotency through stable fingerprints.** Every finding carries a deterministic fingerprint of its rule, file, and symbol, stored in the OKF bundle and on the ticket. A re-run updates the existing ticket, closes it if the finding is resolved, and creates only genuinely new ones. A re-run that files forty duplicate tickets is a demo; one that reconciles against the backlog is a system.
5. **A human approval gate before any write.** No one lets an agent write to their production tracker unreviewed. The delivery agent proposes a full ticket set with severity-to-priority mapping, evidence, and effort and risk estimates, then stops. A human approves, edits, or rejects, and only approved items are created, with least-privilege auth scoped to the projects it needs and nothing more. This gate is a first-class step, because it is the trust boundary the whole thing turns on.

## The delivery layer

This is what turns an artifact into an outcome. Severity maps explicitly to the project's own scheme: critical findings become high-priority bugs or tasks, lower severities carry the right labels, and only components and labels that exist in the target project are ever used. Each ticket reads on its own, a specific summary, the file and line, why it matters in business terms, the evidence, the confidence level, and the recommended fix, with effort and the risk of acting versus not acting. Anything the system is unsure about is flagged for a human rather than filed.

## The forward deployed statement

Walk into a codebase never seen before and deliver a CTO-readable technical audit, with the findings filed as prioritized tickets in the team's own tracker, behind a human approval gate. This is the system that does it, and the honest account of what was reused and what was built.
