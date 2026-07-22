# 04 — The Engines

> Covers deliverables 16–21: Portfolio, Trading, Investment, Risk, Learning,
> Strategy Evolution. Engines are deterministic services in the worker; agents provide
> judgment *around* them, never inside their math (the TradeS pure-function discipline).

## 1. Engine ground rules

- Deterministic cores are pure and unit-tested (indicators/safeguards/grading precedent).
- Engines communicate via events + typed reads of memory stores; never via agent prompts.
- Every engine output that resembles a "call" is gradeable (E8) and feeds Learning.

## 2. Portfolio Engine (deliverable 16)

Portfolio analytics become first-class (per the mission), independent of trading.

- **Instrument model:** normalized `Instrument` (doc 03 §4) covering Indian & US stocks,
  Indian & US ETFs, Indian mutual funds, cash, gold, bonds, crypto, `custom` for future
  classes. Mutual funds get NAV-based pricing (daily); gold/bonds get provider-plugin
  pricing; unknown pricing degrades to "stale" badges (the delayed-quote pattern).
- **Multi-currency:** positions valued in listing currency; portfolio rolled up in the
  user's base currency with an FX rate provider plugin; both figures always stored.
- **Lots, not just positions:** extend the FIFO round-trip matcher (S12) into a general
  lot ledger (acquisitions, disposals, corporate actions) — this is what Tax Intelligence
  and accurate P/L both need. `bot_trades` remains as-is; the lot ledger is a superset
  built beside it.
- **Aggregation:** portfolio = union over broker connections (INDmoney supplies many
  underlying accounts) + manual entries (the TradeS holdings table survives as the
  "manual broker" — zero migration pain).
- **Analytics:** allocation by class/sector/geography/currency, drift vs targets,
  concentration, correlation matrix, benchmark-relative performance (extending the SPY
  benchmark habit to configurable benchmarks — NIFTY 50, etc.), income tracking.
- **Market calendars:** a calendar service (exchange → sessions/holidays/timezone)
  replaces hard-coded ET crons for non-US instruments (A9). Existing ET crons stay for
  the US module.

## 3. Trading Engine (deliverable 17)

**This IS TradeS, preserved.** The bot engine, safeguards, sizing, bracket orders,
kill switch, rule versioning, rule advisor, order-sync, and derived ledger continue
verbatim as the "Active Trading" module, initially scoped to US equities via the Alpaca
plugin. Changes are additive only:

- Orders route through the Broker Abstraction (`alpaca` plugin wraps the existing client;
  identical wire behavior).
- Rules may additionally reference **council decisions** (not just single predictions) as
  a condition source — a new optional condition field, zod-validated like the rest.
- Per-broker safeguard parameters (caps, cooldowns) — the safeguard function stays pure;
  it just receives the connection's config.
- New markets (e.g., Upstox intraday) are new *instances* of the trading engine bound to
  a different broker plugin + calendar — the engine code does not fork.

## 4. Investment Engine (deliverable 18)

Long-horizon investing, distinct from active trading:

- **Goals & policy:** user-defined goals (retirement, house, education) with target
  allocations and constraints stored in Preference Memory; the Portfolio Manager agent
  owns translating goals → target allocation (via the Optimizer's deterministic math).
- **Thesis lifecycle:** long-term theses are `predictions` with long horizons (the schema
  already supports 1–365 days; extend max horizon — an additive migration) plus a new
  `investment_theses` table for multi-year positions with periodic re-underwriting events.
- **Rebalancing:** drift events → council `routine` decision → suggestion or (approved
  autonomy) execution as a batched order plan through Execution + Risk.
- **SIP/recurring:** scheduled contribution plans emit events; Compliance enforces
  jurisdiction rules (e.g., mutual fund cutoffs).
- All investment calls are graded on their horizon exactly like predictions (same
  outcome-runner math, ATR band widened per asset-class volatility profile).

## 5. Risk Engine (deliverable 19)

Concentric rings; inner rings are pure functions and cannot be overridden by outer ones.

| Ring | Nature | Contents |
|---|---|---|
| **R0 Execution safeguards** | Pure, per-order (the existing `checkSafeguards`, unchanged — INV-4) | paper/live host assertion first, freshness, caps, cooldowns, circuit breaker |
| **R1 Portfolio limits** | Pure, per-decision | max position %, sector/issuer concentration, asset-class bands, currency exposure, leverage=0 default, drawdown budget |
| **R2 Scenario/VaR** | Deterministic analytics | historical VaR, stress scenarios (2008/2020/rate-shock), correlation spikes; publishes `risk.threshold-crossed` events |
| **R3 Risk Manager agent** | Judgment + veto | interprets R1/R2 outputs, contextual warnings, exercises the council veto; its warnings are graded (did vetoed ideas in fact go bad?) |
| **R4 Compliance agent** | Judgment + veto | jurisdiction rules, restricted instruments, autonomy-mode enforcement, disclaimer coverage |

Kernel rule: **a veto or an R0/R1 failure is terminal in code** — no prompt, agent, or
human-except-explicit-override path around it (INV-4 generalized). The kill switch
generalizes to per-broker and global halt, still never cancelling protective legs (INV-5).

## 6. Learning Engine (deliverable 20)

TradeS's measure→diagnose loop, generalized to every gradeable agent:

- **Grading:** the outcome-runner pattern applies to any agent output with a falsifiable
  claim + horizon (macro regime calls, risk warnings, optimizer expectations). Each
  gradeable output type declares its grading function (pure).
- **Post-mortems:** the cheap-model, one-lesson, idempotent post-mortem applies per agent;
  `lessons` gains `agentId`. Root-cause enum extends (adds e.g. `veto-error`,
  `aggregation-error`, `stale-memory`).
- **Expanded learning signals** (per the mission): missed opportunities (watchlist moves
  with no call), false positives/negatives on risk warnings, regime-change detection lag,
  confidence-calibration drift (Brier tracked per agent per regime), behavioral patterns
  (e.g., systematic bullish bias — surfaced by the Reflection Agent).
- **Improvement reports:** the Reflection Agent produces a structured periodic report
  (per agent: accuracy, calibration, top lesson clusters, proposed focus) — human-readable,
  stored in Reflection Memory, linked from the Strategy page's successor.
- **Calibration:** `effectiveConfidence` extends to per-agent tracks; the council
  aggregation consumes it (an agent that has earned nothing moves nothing).

## 7. Strategy Evolution Engine (deliverable 21)

TradeS Phase 6, generalized — the same strict gate for every evolvable policy:

- **Per-agent policy lineage:** `strategy_versions` generalizes to
  `(agentId, version, parent, fullText, status, scorecard, …)` — the existing rows become
  agentId="equity-analyst" (backward-compatible migration, doc 06).
- **The gauntlet is universal:** one bounded proposal at a time per agent; structural
  validation (bounded length change, unchanged tiers byte-identical); paired discordant
  dominance (≥65% of ≥8 disagreements); Brier non-worsening; regime no-catastrophe;
  anti-overfit holdout; ≤4 promotions/quarter *per agent*; auto-rollback on live
  degradation. **None of these thresholds loosen** without an ADR (INV-9).
- **Shadow isolation is universal:** each agent's testing policy writes to shadow streams
  that nothing money-touching reads (INV-3).
- **Council-level evolution:** aggregation weights and quorum rules are themselves a
  versioned policy of the Supervisor — evolved through the same gauntlet, never hand-tuned
  in prod.
- **Hard ceiling on self-modification:** agents can evolve *prompts/policies/parameters*
  only. Code, schemas, safeguard thresholds, veto wiring, and autonomy modes are
  human-only changes (the mission's "never allow unrestricted self-modification").
- **Budget:** evolution work is the first to shed (existing priority: shadows → gauntlet
  → post-mortems), now per-provider (E9). Human-facing work is never shed.
