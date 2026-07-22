# 05 — Platform: Data Layer, API, UI, Security, Folder Structure

> Covers deliverables 22–26.

## 1. Data layer (deliverable 22)

- **Stage A: SQLite + Drizzle, exactly as TradeS** (WAL, busy_timeout 5000, NORMAL sync,
  globalThis singleton, epoch-ms integers, JSON text columns). All ~20 TradeS tables are
  kept **byte-compatible**; new tables are added beside them (full list in doc 06 §2).
- **Writer-ownership contract v2:** the schema-top comment becomes a machine-readable
  registry (`table → owningProcess`) checked by a unit test, so the contract survives the
  team growing (INV-13).
- **Repository seam:** all *new* code reads/writes through thin repository modules
  (`src/lib/repo/*`). Existing TradeS modules are NOT refactored to use it (no rewrite);
  the seam exists so the Postgres migration (doc 06) only touches repositories + the db
  handle, never engines/agents.
- **Append-only classes of data:** events, agent messages, decisions, audit, predictions
  and all gradeable outputs, policy versions, lessons (INV-1).
- **Derived data is rebuildable:** bot_trades precedent extends to the lot ledger and any
  aggregation cache — always reconstructable from source-of-truth logs (INV-15).

## 2. API layer (deliverable 23)

- **Shape:** Next.js route handlers; REST + SSE (the TradeS quote stream generalizes to a
  `/api/events/stream` platform channel — E10). No AI inline, ever (INV-12): mutating AI
  endpoints enqueue and return an id; clients poll or listen on SSE.
- **Surface groups:** `portfolio`, `instruments`, `decisions` (council cards, approvals,
  challenges), `agents` (roster, track records, policies), `trading` (TradeS routes,
  preserved paths), `plugins` (connect/configure/health), `events`, `memory` (search),
  `settings`, `auth`, `translate` (unchanged).
- **Versioning:** `/api/v1/...` for all new routes; existing TradeS routes stay at their
  current paths until Stage B (no breakage of the preserved UI).
- **Contracts:** every route's request/response is a zod schema shared with the client —
  the same discipline as agent output contracts.
- **Stage C additions (designed-for, not built):** API keys/OAuth for third parties,
  outbound webhooks (the event bus already has the fan-out shape), rate limiting.

## 3. UI architecture (deliverable 24)

- **Preserve** the TradeS pages (Dashboard, Stock, Predictions, Trade, Bot, Strategy,
  How-to) and its dark-terminal design system — they become the "Trading" area of the OS.
- **New cockpit areas:**
  - **Home / Net Worth:** cross-broker aggregate, allocation, drift, goals.
  - **Decisions Inbox:** decision cards (recommendation, per-agent opinions with earned
    confidence, disagreements, DA rebuttal, risk verdict), Approve/Reject/Challenge.
    Challenge reuses the challenge-chat machinery (E11).
  - **Council / Agents:** roster, per-agent track record & calibration, policy timeline
    with scorecards (the Strategy page pattern, per agent), activity feed.
  - **Autonomy panel:** per-domain autonomy dial with the live triple-lock UI (typed
    acknowledgment preserved per broker connection).
  - **Plugins:** connect brokers/data/notifications, health, capability display.
- **Interfaces beyond web** (voice/WhatsApp/Telegram/Slack/Discord/email/push) are
  notification+interface plugins speaking to the same API — the core never changes per
  channel (per the mission). Each channel maps decision cards to its medium (e.g.,
  approve-by-reply with signed action tokens).
- **i18n:** the config-driven `SUPPORTED_LANGUAGES` + translation-cache design applies
  platform-wide, unchanged (INV-10).

## 4. Security model (deliverable 25)

Threat-model-first; layers ordered inner→outer:

1. **Money safety (inner):** INV-2/3/4/5/7 — per-broker triple locks, pure safeguard
   rings, veto-in-code, structural shadow isolation, human-gated rule changes. Nothing in
   layers 2–6 can weaken layer 1.
2. **Agent containment:** capability-scoped tool grants from specs; only Execution holds
   order capabilities; no ambient MCP/settings inheritance (`settingSources: []`
   preserved); prompt-injection posture — all external content (news, web fetches, MCP
   responses) is *data*, never merged into system prompts; agent outputs are
   schema-validated before any consumer reads them.
3. **Credentials:** plugin configs validated by zod, stored encrypted at rest (Stage A:
   OS-level file perms + `.env.local` gitignored as today; Stage B+: KMS/secret store),
   never logged, never ambient (INV-11).
4. **AuthN/Z:** TradeS auth preserved (off by default, signed cookies, scrypt). Stage B
   adds roles (`owner`, `advisor`, `viewer`) and per-domain permissions; guests remain
   server-side read-only. Approval actions require a fresh session re-check.
5. **Audit:** append-only audit log spans agent messages, decisions, orders, plugin
   config changes, autonomy changes, human approvals — full replayability is the
   compliance story for Stage C.
6. **Tenancy (Stage B+):** `tenantId` on every new table from day one (nullable at Stage
   A, cheap insurance); per-tenant budgets and plugin configs; row-level scoping at the
   repository seam.

## 5. Folder structure (deliverable 26)

Additive around the TradeS layout — existing paths do not move (no rewrite):

```
src/
  app/                    # Next.js — existing TradeS pages preserved; new cockpit routes added
  components/             # existing + cockpit components
  hooks/
  lib/
    db/                   # schema.ts (existing tables untouched; new tables appended), ownership registry
    env.ts                # unchanged; plugin configs live in plugin layer, not here
    alpaca/               # PRESERVED verbatim; wrapped by plugins/brokers/alpaca
    research/             # PRESERVED verbatim (packet, agent, prompts, schema, strategy,
                          #   calibration, grading, regime, challenge, postmortem)
    bot/                  # PRESERVED verbatim (engine, safeguards, sizing)
    improve/              # PRESERVED verbatim (strategist, controller, scorecard, rule-advisor, budget)
    i18n/                 # PRESERVED
    auth/                 # PRESERVED
    kernel/               # NEW: event bus, agent runtime, budget v2, scheduler, audit, policy registry
    agents/               # NEW: agent specs (data files) + output schemas per agent
    council/              # NEW: decision procedure, aggregation, veto enforcement
    engines/              # NEW: portfolio/, investment/, risk/ (wraps bot safeguards as R0),
                          #      learning/ (wraps improve/), tax/
    plugins/              # NEW: brokers/{alpaca,indmoney-mcp,upstox-mcp}/, market-data/,
                          #      research-sources/, llm/{llm-provider}/, notifications/,
                          #      memory/, mcp-bridge/
    repo/                 # NEW: repository seam for all new tables
worker/
  index.ts                # boot: dotenv → guardLlmKey → runners + kernel services
  (12 TradeS runners)     # PRESERVED verbatim
  dispatcher.ts           # NEW: event delivery loop
  council-runner.ts       # NEW: consumes decision events
  memory-runner.ts        # NEW: consolidation/embedding
scripts/                  # migrate.ts + one-off CLIs (preserved + new)
tests/                    # existing 13 pure suites preserved + new pure suites
docs/architecture/        # this package
```
