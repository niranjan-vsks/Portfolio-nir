# 01 — Reverse Engineering of the TradeS BUILD_PROMPT

> Covers deliverables 2–7: complete reverse engineering, existing architecture breakdown,
> strengths, weaknesses, what must never change, what can be extended.

## 1. System identity

TradeS is a **single-machine, two-process, one-SQLite-file** application:

1. **Next.js 16 web app** (port 3100) — dashboard + API routes. Never runs AI inline.
2. **Background worker** (`worker/`, 12 runners) — owns all live feeds, crons, the AI job
   queue, grading, self-improvement, and the trading bot.

The **`jobs` table is the async bridge** between them; the **writer-ownership contract**
(worker writes machine-derived tables, Next writes user-initiated tables) is what makes
two-process SQLite safe without locks.

## 2. Subsystem inventory

| # | Subsystem | Files | Role |
|---|---|---|---|
| S1 | DB layer | `src/lib/db/` | better-sqlite3 + Drizzle, WAL, globalThis singleton, ~20 tables |
| S2 | Env & safety | `src/lib/env.ts` | Zod-validated env; single paper/live decision point; `guardLlmKey()` |
| S3 | Market data | `worker/price-stream.ts`, `worker/yahoo-poller.ts`, `src/lib/alpaca/` | One IEX websocket (hard Alpaca limit), Yahoo delayed poller, hand-rolled REST client |
| S4 | Quant signals | `src/lib/...indicators/patterns`, `worker/signal-runner.ts` | Pure, unit-tested SMA/EMA/RSI/MACD/ATR/Bollinger/OBV + pattern detection |
| S5 | Research packet | `src/lib/research/packet.ts` | `Promise.allSettled` fan-out (news, fundamentals, EDGAR, insiders, sentiment, congress, market context) → markdown + quantSnapshot; bars are the only hard dependency; "Data Gaps" honesty section |
| S6 | Analyst engine | `research/agent.ts`, `prompts.ts`, `schema.ts` | the LLM provider plugin (`query()`), WebSearch/WebFetch, one JSON-validation retry, English-only output contract |
| S7 | Strategy versioning | `research/strategy.ts`, `strategy_versions` | DB-backed philosophy; exactly one `active`; fullText + quantText tiers |
| S8 | Grading & calibration | `research/{grading,calibration,regime}.ts` | ATR-scaled neutral band, SPY benchmark, dumb baselines, `effectiveConfidence` capping, regime tags |
| S9 | Jobs queue | `jobs` table, `research-runner.ts` | Priority order chat → research → postmortem → relations; stale-job healing |
| S10 | Paper trading | `alpaca/` client, `order-sync.ts`, `orders_log`, `account_snapshots` | trade_updates websocket, upsert fills, 60s reconcile, equity curve |
| S11 | Bot engine | `src/lib/bot/{engine,safeguards,sizing}.ts`, `bot-runner.ts` | 5-min tick; pure safeguards with paper-host assertion first; bracket orders; kill switch (parent orders only) |
| S12 | Trade ledger | `bot_trades`, `matchRoundTrips` | Derived FIFO round trips rebuilt from orders_log + bot_activity; ground truth for rule advisor |
| S13 | Self-improvement | `src/lib/improve/`, gauntlet/strategist/backtest runners | measure → diagnose (post-mortems/lessons) → hypothesize (one bounded proposal) → validate (paired discordant scorecard, ≥65% of ≥8 disagreements) → promote/rollback |
| S14 | Shadow isolation | `shadow_predictions` | Separate table so nothing that trades can read an unvalidated strategy |
| S15 | Rule advisor | `improve/rule-advisor.ts`, `rule_suggestions` | Evidence-based parameter tweaks, **never auto-applied** |
| S16 | Budget | `improve/budget.ts` | ~60 agent runs/day; shed shadows → gauntlet → post-mortems; never shed live research/chat |
| S17 | Challenge chat | `research/challenge.ts` | Fact-checking argument thread; `REVISED_VERDICT` protocol appends a NEW prediction row via `revisedFromId` |
| S18 | i18n | `src/lib/i18n/` | Config-driven `SUPPORTED_LANGUAGES`; English base everywhere; `translations` cache; no per-language columns anywhere |
| S19 | Frontend | `src/app`, `src/components`, `src/hooks` | Dark terminal design; lightweight-charts v5; SSE quote stream; 8 pages |
| S20 | Auth | `src/proxy.ts`, `src/lib/auth/` | Off by default; signed-cookie sessions; owner/guest; server-side read-only enforcement |
| S21 | Catch-up | `worker/catchup.ts`, `improve-runner.ts` | Laptop-sleep resilience — derive missed work from data, idempotently |

## 3. Dependency graph (load-bearing edges)

```
env.ts ──────────────► alpaca client ──► price-stream / order-sync / bot engine
  │                          ▲
  └─ guardLlmKey ──────┼──► agent.ts (Agent SDK) ◄── prompts ◄── strategy.ts (DB)
bars_cache ──► indicators ──► packet.ts ──► agent.ts ──► predictions ──► outcome-runner
                                                            │                │
                                             shadow_predictions        lessons ──► strategist
                                                            │                          │
                                                     gauntlet/scorecard ◄── strategy_versions
predictions ──► calibration (effectiveConfidence) ──► bot engine ──► orders_log ──► bot_trades ──► rule-advisor
jobs ◄── Next API routes (enqueue) ◄── UI polls /api/jobs/{id}
```

## 4. Core assumptions (each becomes a WealthOS design constraint)

| # | Assumption | Consequence for WealthOS |
|---|---|---|
| A1 | One user, one laptop, machine sleeps | Catch-up pattern is essential; must generalize, not disappear |
| A2 | SQLite + two processes + writer-ownership | Works until multi-tenant; contract concept must survive the DB swap |
| A3 | Alpaca is *the* broker; Yahoo fills the gaps | Hard-coded — the single biggest thing to abstract |
| A4 | a shared LLM subscription login, no API key | Budget model assumes one shared login; LLM provider must become a plugin |
| A5 | English is the base language of all machine text | Keep — it's what makes i18n config-driven |
| A6 | Predictions/holdings are US-equity-centric | Symbol model, currency handling, market hours all need generalizing |
| A7 | One IEX websocket per account (free tier) | Data-provider plugins must declare connection constraints |
| A8 | Manual holdings entry, no brokerage sync | INDmoney aggregation replaces this — via the broker abstraction |
| A9 | Cron schedules in America/New_York | Market-calendar service needed for NSE/BSE etc. |
| A10 | One LLM = the whole "brain" | The council architecture wraps this; the analyst becomes one council member |

## 5. Strengths (deliverable 5) — why we preserve

1. **Append-only accuracy dataset.** Predictions are never mutated; capping/grading happen
   at read seams. This is the epistemic backbone — self-improvement is honest because the
   dataset cannot be doctored.
2. **Defense-in-depth money safety.** Paper-host assertion inside a *pure* function, env
   triple lock, typed UI acknowledgment, kill switch that never strips stop-losses,
   server-side bracket stops. Independent layers, each sufficient alone.
3. **Statistically serious validation.** Paired discordant comparison, Brier calibration,
   regime no-catastrophe guard, anti-overfit holdout, ≤4 promotions/quarter. This is the
   difference between self-improvement and version-number random walk.
4. **Shadow-table isolation.** Structural (not conventional) guarantee that unvalidated
   strategies can never influence money.
5. **Graceful degradation everywhere.** No Alpaca keys → Yahoo; missing sources → "Data
   Gaps"; missing dictionaries → fallback chain.
6. **Pure-function core.** Safeguards, sizing, grading, FIFO matching, scorecard math are
   pure and unit-tested — the deterministic skeleton around the unreliable AI/network.
7. **Honest UX.** Earned vs raw confidence, "is this real skill?" vs SPY and dumb
   baselines, delayed badges, disclaimers.
8. **Jobs-as-bridge.** Long AI runs never block a request handler; the pattern generalizes
   directly to an event bus.

## 6. Weaknesses / limitations (deliverable 4) — honest, not excuses to rewrite

| # | Limitation | Severity for WealthOS | Treatment |
|---|---|---|---|
| W1 | Broker hard-coupling (Alpaca URLs, notation, bracket semantics assumed everywhere) | Critical | Broker Abstraction Layer (doc 03 §4) — Alpaca becomes plugin #1 |
| W2 | Single-agent brain — one analyst, no independent opinions, no structured dissent | Critical | Council wraps the analyst; analyst is preserved as the Technical+Fundamental synthesis member |
| W3 | Cron/poll, not event-driven — 5s job polling, fixed crons | High | Event bus built *on top of* the jobs table first (doc 02 §4) |
| W4 | Memory = tables only; no semantic retrieval, no cross-symbol pattern memory beyond lessons | High | Memory architecture (doc 03 §2); lessons table becomes one memory store among ten |
| W5 | US-equity assumptions (symbol format, currency, market hours, EDGAR, IEX) | High | Instrument model + market-calendar service (doc 04 §2) |
| W6 | SQLite ceiling — fine for Stage A, blocks multi-tenant SaaS | Medium (deliberate) | DB evolution plan (doc 06 §2): repository seam now, Postgres later |
| W7 | LLM provider hard-coded (the LLM provider plugin, model IDs in code) | Medium | LLM provider plugin interface; TradeS model table becomes config |
| W8 | Risk = bot safeguards only; no portfolio-level VaR/concentration/drawdown view | High | Risk Engine (doc 04 §5) — safeguards remain the execution-layer floor |
| W9 | No tax awareness | Medium | Tax Intelligence agent + lot-tracking extension of the FIFO ledger |
| W10 | Auth is single-owner+guests; no tenancy | Medium (deliberate) | Security model (doc 05 §5) |
| W11 | Budget model assumes one Claude login | Medium | Budget generalizes to per-provider token/cost budgets |
| W12 | Manual holdings entry | Medium | Solved by broker abstraction + INDmoney portfolio sync |

## 7. What must NEVER change (deliverable 6) — the invariant list

These are contractual. Any PR that violates one requires an ADR and explicit human sign-off.

- **INV-1** `predictions` (and its analogs) are append-only. History IS the dataset.
- **INV-2** The paper/live decision has exactly one env-derivation point, AND the execution
  path independently re-checks all unlocks (defense in depth). The triple lock stays; in
  WealthOS it extends per-broker.
- **INV-3** Unvalidated strategies are structurally isolated (separate tables/streams) from
  anything that can trade.
- **INV-4** Risk/safeguard checks are pure functions with the strongest guard first, and
  are the last thing before an order — no LLM output can bypass them.
- **INV-5** Kill switch never cancels protective legs on open positions.
- **INV-6** Confidence stored ≠ confidence acted on: capping happens at decision seams;
  stored values are never mutated.
- **INV-7** Rule/parameter suggestions affecting money are never auto-applied.
- **INV-8** Sims are point-in-time safe: no news, no web tools, bars truncated at as-of.
- **INV-9** Promotion requires paired discordant dominance + Brier non-worsening +
  regime no-catastrophe; rollback is automatic on live degradation.
- **INV-10** English base language for all machine text; translation is display-only,
  cached, never schema'd per-language.
- **INV-11** `guardLlmKey()` semantics: the platform never silently switches billing
  modes (generalizes to: provider credentials are explicit plugin config, never ambient).
- **INV-12** Long AI work never runs inline in a request handler.
- **INV-13** Writer-ownership: every table/stream has exactly one writing process,
  documented at the schema.
- **INV-14** Decision-support disclaimer wherever a prediction/trade/recommendation shows.
- **INV-15** Order-fill ingestion is upsert-based and reconciled by polling (missed events
  heal); derived ledgers are rebuildable from source-of-truth logs.

## 8. Extension points (deliverable 7) — the seams we build on

| Seam | Exists in TradeS as | WealthOS extension |
|---|---|---|
| E1 Jobs table | Async UI→worker bridge | Becomes the durable substrate of the event bus & agent mailboxes |
| E2 Research packet | Per-symbol markdown builder | Becomes `ContextPacket` — the standard input any agent receives; sources become plugins |
| E3 `runAnalysis` | One analyst call | Becomes `AgentRuntime.invoke(agentSpec, packet)` — every council member is a parametrization of this |
| E4 `strategy_versions` | One strategy lineage | Becomes per-agent policy versioning (each agent has its own evolvable playbook, same gauntlet math) |
| E5 `lessons` | Flat post-mortem rows | Becomes Learning Memory — one store in the memory architecture, gains embedding retrieval |
| E6 Alpaca client | Hand-rolled REST/WS | Becomes `BrokerPlugin` reference implementation |
| E7 `checkSafeguards` | Bot-level pure gate | Becomes the innermost ring of the Risk Engine (unchanged), with portfolio-level rings added outside it |
| E8 Grading/scorecard | Prediction accuracy | Generalizes to grading ANY agent's calls (macro calls, risk warnings, optimizer suggestions) |
| E9 Budget | One-login run counting | Per-provider cost budgets with the same shedding priority idea |
| E10 SSE quote stream | Prices to UI | Becomes the general "platform events to UI" channel |
| E11 Challenge chat | Argue with a prediction | Becomes the human's seat at the council table (challenge any decision card) |
| E12 Catch-up runner | Sleep resilience | Becomes the event-bus replay/recovery mechanism |

## 9. Conclusion of the audit

TradeS is best understood as **a complete, validated "Active US-Equity Trading capability
module" plus a reusable safety-and-learning chassis**. The chassis (jobs, grading,
calibration, versioned policies, gauntlet, budget, safeguards pattern) is exactly what a
multi-agent wealth OS needs — TradeS just instantiates it once, for one agent, one broker,
one asset class. The architecture in docs 02–05 instantiates it many times without
touching the original instantiation.
