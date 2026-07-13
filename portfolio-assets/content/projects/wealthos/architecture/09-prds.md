# 09 — Subsystem PRDs

> Deliverable 33. One PRD per subsystem: problem, users, requirements, success metrics,
> out-of-scope. Detailed API/schema shapes live in docs 02–05; these PRDs govern scope.

---

## PRD-1: Kernel — Event Bus & Scheduler

- **Problem:** Cron/poll architecture can't support agents reacting to market/portfolio/
  news events, and new consumers currently require touching existing runners.
- **Requirements:** Append-only event log; subscriptions with filters; at-least-once
  delivery with dedupe; cursor-based replay (subsumes catch-up); priority + budget-aware
  shedding; existing TradeS crons emit events without behavior change; UI event stream (SSE).
- **Success:** New consumer added with zero edits to existing runners; post-sleep replay
  completes without duplicate side effects; TradeS regression suite green throughout.
- **Out of scope:** External message brokers (Stage B+).

## PRD-2: Kernel — Agent Runtime & Registry

- **Problem:** One hard-coded analyst call; the OS needs ~20 uniform, auditable agents.
- **Requirements:** Spec-driven invocation (prompt = spec + policy version + context
  packet + track record); schema validation + one retry; model/policy/cost stamping;
  tool grants from capabilities only; failure modes retry-once/degrade/abstain;
  per-provider budget accounting.
- **Success:** The existing analyst runs unmodified as a registered agent; adding an
  agent requires no runtime code change; every output row carries model + policy version.
- **Out of scope:** Agent code plugins (agents are data — ADR-7).

## PRD-3: Council & Decision System

- **Problem:** Critical financial decisions must never come from one agent, and must be
  explainable, challengeable, and gradeable.
- **Requirements:** Stakes tiers (routine/significant/critical); isolated opinions;
  mandatory Devil's Advocate at high stakes; code-enforced Risk/Compliance vetoes;
  Decision Card with recommendation, per-agent opinions, disagreements, DA case, risk
  verdict, earned confidence, invalidation; challenge chat on any card; full transcript
  in audit log; autonomy-gate routing.
- **Success:** 100% of cards show dissent when it exists; zero executed decisions with a
  veto (structurally impossible); decision quality graded on outcomes from day one.
- **Out of scope:** Free-form agent debate; auto-execution at critical tier.

## PRD-4: Broker Abstraction & Connections

- **Problem:** Alpaca hard-coupling blocks the multi-broker, India-first mission.
- **Requirements:** `BrokerPlugin` interface (read/trade/capabilities); normalized
  instruments/orders/positions/fills; per-connection paper/live with triple lock;
  universal reconcile polling; connection health UI; Alpaca extracted with identical
  wire behavior; INDmoney (read-only, MCP) and Upstox (MCP) plugins.
- **Success:** Agents/engines contain zero broker identifiers; INDmoney positions appear
  in net worth within one sync cycle; TradeS bot trades unchanged through the wrapper.
- **Out of scope (initially):** Options/derivatives; margin.

## PRD-5: Portfolio Engine

- **Problem:** Wealth is more than a US-equity trading account; analytics must be
  first-class.
- **Requirements:** Multi-asset instrument model (IN/US stocks & ETFs, IN mutual funds,
  cash, gold, bonds, crypto, custom); multi-currency with base-currency rollup; lot
  ledger (rebuildable); aggregation across connections + manual entries; allocation /
  drift / concentration / performance-vs-benchmark analytics; market calendars; goals
  and target allocations.
- **Success:** Accurate net worth across ≥2 brokers + manual assets; drift events fire
  correctly; lot ledger reconciles to broker statements.
- **Out of scope:** Real estate/exotics (custom class covers manual entry).

## PRD-6: Trading Engine (preserved TradeS core)

- **Problem:** None — it works. The requirement is *non-regression* while re-homing.
- **Requirements:** All TradeS bot/manual-trading behavior preserved (safeguards, sizing,
  brackets, kill switch, rule versioning, advisor inbox, ledger); routes via broker
  plugin; optional council-decision rule condition; per-broker safeguard parameters.
- **Success:** Byte-comparable bot_activity/orders_log behavior pre/post wrapper on the
  same inputs; all 13 pure test suites still green.
- **Out of scope:** New order types beyond brokers' declared capabilities.

## PRD-7: Investment Engine

- **Problem:** Long-horizon investing (goals, rebalancing, SIPs) has different cadence
  and psychology than 5-minute bot ticks.
- **Requirements:** Goal → target allocation via Optimizer math; thesis lifecycle with
  periodic re-underwriting; drift-triggered rebalancing proposals through the council;
  SIP scheduling; grading of investment calls on their horizons.
- **Success:** A rebalancing proposal traces from drift event → decision card → (approved)
  batched orders, fully audited; investment calls appear in accuracy panels.
- **Out of scope:** Direct indexing; automated tax-loss harvesting execution (advisory only).

## PRD-8: Risk Engine

- **Problem:** Risk today = per-order safeguards; the OS needs portfolio-level rings and
  an accountable veto.
- **Requirements:** R0 (existing safeguards, untouched) → R1 portfolio limits (pure) →
  R2 VaR/stress (deterministic) → R3 Risk agent (veto, graded warnings) → R4 Compliance
  (veto, jurisdiction/autonomy). Inner rings non-overridable; global + per-broker halt;
  `risk.threshold-crossed` events.
- **Success:** No order reaches a broker without passing R0–R1 in code; vetoed decisions
  provably cannot execute; risk warnings acquire a measured hit rate.
- **Out of scope:** Realtime intraday VaR (end-of-tick granularity suffices at Stage A).

## PRD-9: Learning Engine

- **Problem:** Only the analyst learns today; every gradeable agent should.
- **Requirements:** Per-output-type pure grading functions; per-agent lessons (rootCause
  taxonomy extended); per-agent calibration (`effectiveConfidence` tracks); expanded
  signals (missed opportunities, risk false-positives/negatives, calibration drift,
  behavioral bias); periodic Reflection reports; budget-shedable, never sheds
  human-facing work.
- **Success:** Every council seat displays earned-vs-raw confidence with sample counts;
  Reflection reports cite only measured evidence.
- **Out of scope:** Learning that mutates anything without the evolution gate (PRD-10).

## PRD-10: Strategy Evolution Engine

- **Problem:** Extend TradeS self-improvement to all agents without loosening rigor.
- **Requirements:** Per-agent policy lineage; the frozen gauntlet gate (ADR-8); shadow
  isolation per agent; council-weight evolution as Supervisor policy; version everything;
  auto-rollback; human-only changes for code/schemas/safeguards/vetoes/autonomy.
- **Success:** Zero promotions that fail any gate criterion (verified by tests on the
  scorecard math); rollbacks fire automatically in simulation drills.
- **Out of scope:** Multi-change proposals; agent-initiated schema/tool changes.

## PRD-11: Memory System

- **Problem:** Tables-only memory can't answer "have we seen this pattern before?"
- **Requirements:** Ten stores over existing + new tables (doc 03 §2); sidecar embedding
  index (source tables never altered); Memory Manager consolidation/decay on the shed
  budget; provider interface (SQLite first); retrieval APIs for agents scoped by spec.
- **Success:** "Similar past mistakes" retrieval measurably improves post-mortem citations;
  memory ops never delay user-facing work.
- **Out of scope:** External vector DB (Stage C provider).

## PRD-12: Plugin System & MCP Bridge

- **Problem:** Everything third-party must be swappable, health-checked, and safe.
- **Requirements:** Manifest + capabilities + constraints + zod config; lifecycle with
  health checks; graceful degradation to "Data Gaps"; capability-scoped tool grants;
  MCP as transport with mutating tools locked behind Execution+Risk; no ambient config
  inheritance.
- **Success:** Killing any plugin degrades its sections without crashing any engine;
  no test can reach a mutating MCP tool except via Execution.
- **Out of scope:** Third-party plugin sandboxing/marketplace (Stage C).

## PRD-13: Interfaces & Notifications

- **Problem:** The OS must reach users on their channels without core changes.
- **Requirements:** Web cockpit (preserved TradeS pages + Home/Decisions/Council/
  Autonomy/Plugins areas); notification plugin interface with urgency routing;
  approval-by-message with signed, expiring action tokens; voice (OpenClaw) as an API
  client; platform-wide i18n per ADR-10.
- **Success:** A decision card can be approved from web and (later) chat channels with
  identical audit trails; adding a channel touches only its plugin.
- **Out of scope (initially):** Native mobile apps (responsive web + push first).

## PRD-14: Security, Audit & Tenancy

- **Problem:** Money + autonomy + (eventually) tenants demand defense in depth and a
  perfect paper trail.
- **Requirements:** The INV list enforced by tests where possible (ownership registry,
  veto reachability, append-only checks); encrypted credential storage; append-only
  audit spanning messages/decisions/orders/config/autonomy/approvals; roles at Stage B;
  nullable tenantId on all new tables now; decision replay.
- **Success:** Any executed order reconstructs to its full causal chain in one query
  path; security review passes before any live-money autonomy ships.
- **Out of scope:** SOC2 tooling (Stage C).

## PRD-15: Tax Intelligence (advisory)

- **Problem:** Real wealth decisions are after-tax decisions.
- **Requirements:** Lot-aware realized/unrealized gain classification (jurisdiction
  rules as data: India STCG/LTCG, US short/long + wash-sale flags); harvesting
  *suggestions* via decision cards; annual summaries; strictly advisory — never blocks
  or auto-executes.
- **Success:** Tax lots reconcile with the Portfolio Engine ledger; suggestions cite
  concrete lots and rule references.
- **Out of scope:** Tax filing; professional advice (explicit disclaimer).
