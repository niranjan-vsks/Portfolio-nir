# 02 — Target Architecture: Multi-Agent OS, Communication, Events

> Covers deliverables 8–11: future architecture, multi-agent architecture,
> communication protocol, event system.

## 1. Future architecture — the layer cake

```
┌─────────────────────────────────────────────────────────────────────┐
│  INTERFACES        Web cockpit │ Voice (OpenClaw) │ WhatsApp/Telegram│
│                    Slack/Discord │ Email │ Push   (all plugins)      │
├─────────────────────────────────────────────────────────────────────┤
│  API LAYER         REST + SSE + (later) webhooks — thin, no AI inline│
├─────────────────────────────────────────────────────────────────────┤
│  COUNCIL LAYER     Supervisor │ Planner │ Specialist agents │        │
│                    Devil's Advocate │ Risk (veto) │ Compliance (veto)│
├─────────────────────────────────────────────────────────────────────┤
│  ENGINES           Portfolio │ Trading (=TradeS core) │ Investment │ │
│                    Risk │ Learning │ Strategy Evolution │ Tax        │
├─────────────────────────────────────────────────────────────────────┤
│  KERNEL            Event Bus │ Agent Runtime │ Memory Manager │      │
│                    Budget │ Scheduler+Catchup │ Audit Log │ Policy   │
│                    Registry (versioned strategies per agent)         │
├─────────────────────────────────────────────────────────────────────┤
│  PLUGIN LAYER      Brokers │ Market Data │ Research Sources │ LLM    │
│                    Providers │ MCP Bridge │ Notifications │ Memory   │
│                    Providers │ Risk Engines                          │
├─────────────────────────────────────────────────────────────────────┤
│  DATA LAYER        SQLite (Stage A) → Postgres (Stage B+), append-   │
│                    only event log, repository seam                   │
└─────────────────────────────────────────────────────────────────────┘
```

**Runtime model (Stage A, preserved from TradeS):** two processes, one DB.
Next.js serves interfaces + API; the worker hosts the kernel, engines, and council.
The TradeS 12 runners keep running unchanged inside the worker; new kernel services run
alongside them. Stage B splits the worker into role-scoped workers (see doc 06).

## 2. Multi-agent architecture — the council

### 2.1 Agent specification (every agent MUST declare all of these)

```ts
interface AgentSpec {
  id: string;                        // "risk-manager"
  mission: string;                   // one-sentence purpose
  responsibilities: string[];
  inputs: ContextRequirement[];      // which packet sections / memories it needs
  outputs: zod.Schema;               // typed contract (like PredictionSchema)
  tools: ToolGrant[];                // WebSearch? broker-read? NEVER broker-write except Execution
  memory: MemoryScope[];             // which memory stores it reads/writes (doc 03 §2)
  decisionBoundaries: Boundary[];    // hard limits, e.g. "may not size positions"
  escalation: EscalationRule[];      // when to punt to Supervisor / human
  vetoPower: boolean;                // Risk + Compliance only
  policyVersioned: boolean;          // participates in strategy-evolution (doc 04 §7)
  gradeable: boolean;                // outputs graded like predictions (INV extension E8)
  models: { primary: string; cheap: string };  // resolved via LLM provider plugin
  failureRecovery: "retry-once" | "degrade" | "abstain";
}
```

Agents are **data + prompts, not classes-per-agent**: the kernel's `AgentRuntime` is one
generalization of TradeS `runAnalysis()` (E3) — build prompt from spec + policy version +
context packet + track record, invoke provider, one validation retry, stamp model +
policy version on the output row. This preserves the exact validated call pattern.

### 2.2 The roster (initial; every one is optional/enable-able)

| Agent | Veto | Gradeable | Notes |
|---|---|---|---|
| **Supervisor (CIO)** | – | yes (decision quality) | Aggregates opinions, drafts the Decision Card; cannot execute |
| **Planner** | – | – | Decomposes goals into agent tasks/events |
| **Portfolio Manager** | – | yes | Owns allocation targets, drift, rebalancing proposals |
| **Investment Research** | – | yes | Long-horizon theses (extends TradeS analyst horizon) |
| **Quant Research** | – | yes | The TradeS quant pipeline personified; signals + patterns |
| **Technical Analysis** | – | yes | TradeS analyst's technical half, as an independent voice |
| **Fundamental Analysis** | – | yes | Earnings, filings, quality — TradeS packet sources |
| **Macro Economics** | – | yes | Regime, rates, FX; extends TradeS regime tagging |
| **News Intelligence** | – | yes | Event-driven; subscribes to news events |
| **Sentiment Intelligence** | – | yes | TradeS social sources, personified |
| **Risk Manager** | **YES** | yes (warning accuracy) | Portfolio rings + the TradeS pure safeguards as innermost ring |
| **Compliance** | **YES** | – | Jurisdiction rules, restricted lists, autonomy-mode enforcement |
| **Execution** | – | – | ONLY agent with broker-write tools; deterministic, minimal LLM |
| **Portfolio Optimizer** | – | yes | Allocation math (deterministic core + agent narration) |
| **Tax Intelligence** | – | yes | Lot-aware harvesting/wash-sale/jurisdiction hints; advisory only |
| **Devil's Advocate** | – | yes (rebuttal hit-rate) | Actively tries to falsify the thesis; required on high-stakes decisions |
| **Trade Reviewer / Performance Auditor** | – | – | TradeS post-mortem generalized to all agents |
| **Learning Agent** | – | – | TradeS strategist, generalized (doc 04 §6) |
| **Strategy Evolution** | – | – | TradeS gauntlet/controller, generalized (doc 04 §7) |
| **Memory Manager** | – | – | Consolidation, decay, retrieval (doc 03 §2) |
| **Reflection Agent** | – | – | Periodic "what are we systematically wrong about" reports |

**Key preservation move:** the existing TradeS analyst is NOT decomposed. It continues to
produce `predictions` exactly as today and is registered in the council as the
**"Equity Analyst"** member whose opinion is its prediction row. New specialist agents add
voices *around* it. Decomposing it into TA/FA/Sentiment voices is a later, gauntlet-
validated evolution — never a rewrite.

### 2.3 Council decision procedure (high-stakes decisions)

1. **Trigger** — event (drift, signal, user ask, scheduled review) creates a `decision` row.
2. **Framing** — Supervisor + Planner define the question, stakes tier, and required quorum.
3. **Independent analysis** — selected specialists each receive the same `ContextPacket`
   and answer **in isolation** (no cross-talk — prevents anchoring; mirrors the paired-sim
   discipline). Each returns its typed opinion + confidence.
4. **Adversarial round** — Devil's Advocate receives all opinions and must produce the
   strongest falsification case; specialists may issue one rebuttal.
5. **Risk & Compliance review** — deterministic checks first (pure functions, INV-4), then
   agent judgment. Either veto is terminal for this decision (recorded with reason).
6. **Aggregation** — Supervisor produces the **Decision Card**:
   `{ recommendation, reasoning, earnedConfidence, perAgentOpinions[], disagreements[],
   devilsAdvocateCase, riskVerdict, evidence[], invalidation }`.
   Confidence is capped by each agent's measured track record (calibration, INV-6) and by
   a disagreement penalty (high dissent ⇒ lower cap).
7. **Autonomy gate** — the domain's autonomy mode decides: file as suggestion, request
   human approval, or hand to Execution (paper unless triple-locked live).
8. **Audit** — every step above is a row in the audit log; the card is challengeable via
   the challenge-chat mechanism (E11).

**Stakes tiers** control cost: `routine` (Supervisor + 2 specialists, cheap models),
`significant` (5+ specialists + DA), `critical` (full council + mandatory human approval
regardless of autonomy mode). The TradeS budget shedder (E9) sheds low-tier councils first.

## 3. Communication protocol (deliverable 10)

Agents never call each other directly. All communication is **typed messages over the
durable bus** (which is the jobs table, extended — E1):

```ts
interface AgentMessage {
  id: string; ts: number;
  kind: "task" | "opinion" | "rebuttal" | "veto" | "escalation" | "report";
  decisionId?: string;            // council correlation id
  from: AgentId | "system" | "human";
  to: AgentId | "council" | "supervisor";
  schemaRef: string;              // zod schema name for payload
  payload: unknown;               // validated against schemaRef
  policyVersion?: string;         // sender's active policy version (auditability)
  model?: string;                 // stamped like TradeS predictions
  budgetCost?: number;
}
```

Rules:
- Payloads are **schema-validated on write** (extends the TradeS extract-and-validate +
  one-retry pattern to every agent).
- Messages are **append-only** — the council transcript IS the audit record (INV-1 spirit).
- **Vetoes are messages with teeth:** the kernel (not the Supervisor's prompt) enforces
  that a decision with a veto message can never reach Execution. Code, not prompt.
- Escalations route to the human inbox with full context; unanswered escalations expire
  to the safe default (no action).

## 4. Event system (deliverable 11)

### 4.1 Design decision: extend the jobs table, don't replace it

Compared alternatives:
- **(a) In-memory EventEmitter** — lost on restart; breaks the laptop-sleep reality (A1). Rejected.
- **(b) External broker (Redis/NATS/Kafka)** — new infra dependency, kills single-machine
  simplicity, TradeS budget/catch-up patterns don't map. Rejected for Stage A; the
  interface below allows swapping it in at Stage B/C.
- **(c) Durable event log in the same DB + dispatcher in the worker** — same transactional
  domain as all state, replayable, catch-up (E12) becomes "replay from last cursor",
  writer-ownership contract extends naturally. **Chosen.**

```
events (append-only):    id, ts, type, source, payload(JSON), dedupeKey?
event_subscriptions:     subscriberId (agent/engine/runner), eventType, filter(JSON), enabled
event_deliveries:        eventId, subscriberId, status(queued|done|error|skipped), attempts, cursor
```

The dispatcher runs in the worker beside the existing runners. TradeS crons are
**preserved and become event emitters**: bot-runner's 5-min cron emits `market.tick.bot`;
outcome-runner emits `prediction.graded`; etc. Existing runner logic keeps its schedule;
new consumers subscribe without touching it.

### 4.2 Event taxonomy (initial)

| Domain | Events |
|---|---|
| Market | `market.open`, `market.close` (per exchange calendar), `price.spike`, `volatility.regime-change` |
| News/Macro | `news.breaking`, `macro.announcement` (Fed/RBI), `corporate.action`, `dividend.received` |
| Portfolio | `portfolio.drift-exceeded`, `portfolio.large-change`, `position.opened/closed` |
| Trading | `trade.executed`, `order.rejected`, `risk.threshold-crossed`, `bot.halted` |
| Learning | `prediction.graded`, `prediction.failed`, `lesson.created`, `strategy.promoted/rolled-back` |
| Human | `user.message`, `approval.granted/denied`, `autonomy.changed` |
| System | `plugin.connected/failed`, `budget.exhausted`, `catchup.completed` |

### 4.3 Delivery semantics

- **At-least-once** with `dedupeKey` idempotency (matches TradeS idempotent post-mortems).
- **Priority inherits the TradeS queue discipline:** human-facing first (chat/approvals),
  then live analysis, then learning work — and budget shedding drops the tail first.
- **Replay = catch-up:** on boot, the dispatcher advances each subscriber from its cursor;
  `runCatchup(force)` is reimplemented as a full-window replay, never bypassing
  prerequisite gates (preserving the existing rule).
