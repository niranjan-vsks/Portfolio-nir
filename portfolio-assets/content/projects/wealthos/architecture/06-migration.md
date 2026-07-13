# 06 — Database Evolution, Migration Strategy, Technical Risks

> Covers deliverables 27–29.

## 1. Migration philosophy

**Strangler-fig around a system we refuse to strangle.** TradeS keeps running end-to-end
at every step. Each migration phase is additive; the only in-place changes are
backward-compatible column additions. A user of the original TradeS UI should notice
nothing until they opt into new surfaces.

## 2. Database evolution plan (deliverable 27)

### Wave 1 — additive columns (backward compatible; existing code ignores them)

- `strategy_versions` + `agentId` (default `"equity-analyst"`), `lessons` + `agentId`.
- All new tables get nullable `tenantId` from day one.
- `predictions.horizonDays` max raised (zod change only; column already int).

### Wave 2 — new tables (no existing table touched)

- Kernel: `events`, `event_subscriptions`, `event_deliveries`, `agent_messages`,
  `decisions`, `decision_opinions`, `audit_log`, `budgets`.
- Plugins: `plugin_configs`, `broker_connections`, `broker_accounts`.
- Portfolio: `instruments`, `positions_ext`, `lots`, `transactions`, `fx_rates`,
  `goals`, `target_allocations`, `market_calendars`.
- Investment: `investment_theses`.
- Risk: `risk_limits`, `risk_events`.
- Memory: `memory_embeddings`, `reflections`, `preferences`.
- Council policy: `agent_specs` (or config files — ADR-7), `autonomy_modes`.

### Wave 3 — data backfill (idempotent scripts, TradeS backfill precedent)

- `holdings` → manual-broker `broker_accounts` + `positions_ext` + `lots`.
- `orders_log`/`bot_trades` → `transactions` + `lots` (FIFO matcher reused).
- Symbols → `instruments` rows (US equity defaults).

### Wave 4 — Stage B engine swap (SQLite → Postgres)

- Trigger: multi-user or hosted deployment. Path: repositories + db handle swap;
  Drizzle dialect change; integer-ms timestamps and JSON-text columns chosen for
  portability. Writer-ownership contract becomes advisory (Postgres handles concurrency)
  but is kept as documentation of intent. WAL-specific pragmas dropped.
- Embeddings move to pgvector; the `MemoryProvider` interface absorbs the change.

## 3. Incremental migration strategy (deliverable 28) — build order

Mirrors the TradeS phase discipline: every phase ends usable.

| Phase | Deliverable | Risk gate |
|---|---|---|
| **M0** | Build/verify TradeS itself per its own Phases 1–6 (if not already running) | Its own accuracy panel is trustworthy |
| **M1 Kernel seams** | Event log + dispatcher beside the runners; existing crons emit events; audit log; ownership registry test | Zero behavior change to TradeS paths (regression: predictions/bot ticks byte-identical) |
| **M2 Plugin extraction** | Wrap (not move) alpaca/yahoo/research sources/LLM behind plugin interfaces; plugin health UI | Wire-behavior identical; packet output diff-tested |
| **M3 Broker abstraction + portfolio** | `BrokerPlugin`, INDmoney MCP (read-only), instruments, lots, multi-currency, Net Worth page | Read-only — no execution risk; manual holdings still work |
| **M4 Council v1 (advisory)** | Agent runtime, 5-agent council (Supervisor, Quant, Fundamental, Risk, DA) producing decision cards in *Observe/Suggest* mode only; Decisions Inbox | No execution path from decisions yet; cards graded from day one |
| **M5 Risk Engine rings** | R1 portfolio limits + R2 scenarios (pure, tested); veto-in-code wiring | R0 safeguards untouched; new rings only add refusals |
| **M6 Council → execution** | Approve-to-act mode: approved decisions route to Execution → existing bot order path (paper) | Full unlock chain enforced; TradeS bot rules continue independently |
| **M7 Learning generalization** | Per-agent grading, lessons.agentId, per-agent calibration, Reflection reports | Existing strategist/gauntlet untouched; analyst lineage continues |
| **M8 Evolution generalization** | Per-agent policy gauntlet; council-weight evolution | Same thresholds (INV-9); one agent at a time |
| **M9 Multi-asset & India** | Upstox plugin, NSE calendar, mutual funds/gold, INR base currency, SIPs | Trading autonomy off for new markets until safeguards parameterized + tested |
| **M10 Interfaces & Stage B** | Notification plugins, approval-by-message, Postgres swap, roles/tenancy | Security review gate |

## 4. Technical risks (deliverable 29)

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| T1 | **Council cost blow-up** — N agents × decisions on one Claude login | High | High | Stakes tiers; cheap models for routine seats; budget v2 shedding; hard daily caps; decisions batched |
| T2 | **Correlated agents** — council members share sources/models, so "independent opinions" aren't; false confidence from agreement | High | High | Disagreement-penalty on confidence; DA is mandatory at high stakes; measure inter-agent correlation and surface it; vary evidence slices per seat |
| T3 | **Aggregation is a new single point of failure** — Supervisor prompt errors | Medium | High | Aggregation weights are versioned + gauntlet-evolved; decision quality is graded; veto/limits are code, so worst case is a bad *suggestion* |
| T4 | **SQLite write contention** as event volume grows | Medium | Medium | Single-dispatcher writes, batched; volume monitoring; Wave-4 Postgres path ready |
| T5 | **MCP broker instability/API drift** (INDmoney/Upstox young ecosystems) | High | Medium | Read-only default; reconcile-poll healing (INV-15); plugin health + graceful "Data Gaps" degradation |
| T6 | **Prompt injection via research/MCP content** reaching decision text | Medium | High | Content-as-data rule; schema validation on all outputs; no mutating tool grants outside Execution; injection red-team suite in tests |
| T7 | **Grading ambiguity for new call types** (macro, risk warnings) | Medium | Medium | Only gradeable-with-pure-function outputs count toward calibration; others stay advisory-weight |
| T8 | **Per-agent gauntlets starve on sample size** (≥60/≥20 pairs × N agents) | High | Medium | Evolve one agent at a time; prioritize by lesson-cluster severity; accept slow evolution (correctness over speed — the TradeS ethos) |
| T9 | **India market data quality/licensing** for NSE/BSE/MF NAVs | Medium | Medium | Data-provider plugin per source; delayed badges; never trade on stale data (freshness safeguard generalized) |
| T10 | **Scope gravity** — the platform's breadth erodes the "preserve the core" rule | Medium | High | INV list + ownership test + ADR requirement; M-phase gates; this document |
| T11 | **Regulatory exposure** at Stage C (advice vs decision-support, per jurisdiction) | Medium | Critical | Compliance agent + disclaimers now; legal review gate before Stage C; autonomy defaults conservative |
| T12 | **Laptop-sleep + event bus interaction** (replay storms after long sleep) | Medium | Low | Cursor-based replay with budget-aware pacing; catch-up gates preserved |
