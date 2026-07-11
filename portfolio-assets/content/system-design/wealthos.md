---
title: WealthOS Reference Architecture
slug: wealthos
project: wealthos
diagram: static
interactive: false
tags: [Event Bus, Veto Gate, Multi-Agent Council, Memory Stores, Evolution Gauntlet, MCP, Telegram]
order: 4
---

Pattern-level architecture, industry-standard primitives only.

**Decision plane.** 21 typed analyst agents run isolated analyses in parallel. A devil's advocate stage attacks the emerging consensus. Aggregation is calibration-weighted: agents that have been right get louder, agents that have been wrong get quieter. The output is a proposal, never an action.

**The gate.** Every proposal crosses a code-enforced veto gate: five concentric risk rings (position, portfolio, drawdown, budget, broker-connection locks). Any ring can kill the action. The gate is deterministic code with 100 percent test coverage as a merge requirement; the LLM layer has no write access to money paths.

**Event spine.** A durable, database-backed event log (extending a proven jobs-table pattern) carries every decision, grade, and trade. Replayable, auditable, and free of external queue infrastructure at current scale, with a documented swap seam when scale demands it.

**Memory.** Ten typed memory stores (decisions, grades, calibration history, market context, user constraints, and others) feed both the council and a learning loop that grades every past decision against outcomes.

**Evolution gauntlet.** Strategy mutations run as challengers against the incumbent across frozen statistical thresholds. Promotion is earned, never assumed.

**Edges.** Broker integrations are plugins over Model Context Protocol with per-connection triple locks, read-first by default. Telegram is a first-class conversational surface for instructions and live reports. Web (Next.js) and a planned mobile client share one API contract.
