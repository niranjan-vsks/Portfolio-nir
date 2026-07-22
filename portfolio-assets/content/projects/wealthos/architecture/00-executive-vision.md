# 00 — Executive Vision

> **Package:** Agentic Wealth Operating System (working name: **WealthOS**)
> **Foundation:** TradeS BUILD_PROMPT.md (preserved, wrapped, extended — never rewritten)
> **Status:** Architecture v1 — no implementation code exists yet by design.

## 1. What we are building

WealthOS is an **agentic operating system for a person's entire financial life**. It is not
a trading bot with extra pages. It is a platform where a council of specialized AI agents —
portfolio manager, researchers, risk officer, compliance, execution, devil's advocate —
collaborate on financial decisions under strict safety gates, learn from measured outcomes,
and act through pluggable brokers across asset classes and geographies.

**Mental models:**

- *a co-pilot for wealth management* — the user stays in control; agents do the heavy lifting.
- *Devin meets Bloomberg Terminal* — autonomous multi-step work grounded in live market data.
- *AI Chief Investment Officer* — one accountable supervisor, many specialist reports, and
  a paper trail for every decision.

## 2. What we are NOT doing

- We are **not rewriting TradeS**. Its prediction engine, grading system, calibration,
  shadow/gauntlet validation, budget shedding, bracket-order safety, and triple-lock live
  gate are validated designs. They become the first **capability module** of WealthOS.
- We are **not building financial advice**. Every surface carries the decision-support
  disclaimer, exactly as TradeS mandates.
- We are **not optimizing for scale on day one**. We optimize for correctness, auditability,
  and an architecture that scales *later* without rewrites (SQLite → Postgres, single
  worker → distributed workers, one user → tenants).

## 3. The three laws of this architecture

1. **Preserve the proven core.** TradeS internals change only when an ADR documents why the
   change is unavoidable. Extension happens at *seams*, never inside validated logic.
2. **Money always has a gate.** No agent, council, or self-improvement mechanism ever gains
   the ability to route real money without the human unlock chain. Risk agents hold veto
   power; the veto is code, not a prompt.
3. **Everything is measured or it doesn't count.** Confidence is capped by earned accuracy.
   Strategy changes pass paired discordant validation. Agents that cannot show a measured
   track record get advisory weight only.

## 4. North-star product shape

| Layer | What the user sees |
|---|---|
| **Command surface** | A conversational cockpit + dashboards: net worth, portfolio, decisions inbox, agent activity feed |
| **Council** | Decision cards: recommendation, per-agent opinions, disagreements, devil's-advocate rebuttal, risk verdict, confidence (earned vs raw) |
| **Autonomy dial** | Per-domain modes: *Observe* → *Suggest* → *Approve-to-act* → *Bounded autonomy (paper)* → *Bounded autonomy (live, triple-locked)* |
| **Learning** | Improvement reports, strategy version timelines, scorecards, rollbacks — extended from TradeS Phase 6 |
| **Plugins** | Brokers, data sources, notification channels, LLM providers — installable, swappable, sandboxed |

## 5. Commercial trajectory (context for architectural choices)

- **Stage A (now):** single-user, single-machine — TradeS's runtime model, extended.
- **Stage B:** multi-user self-hosted / small-team SaaS — Postgres, real auth, tenancy column.
- **Stage C:** commercial SaaS — per-tenant isolation, plugin marketplace, compliance surface,
  regional broker packs (India-first via INDmoney aggregation, US via Alpaca/IBKR).

Every design decision in this package is checked against: *"does this survive Stage C
without a rewrite?"* Where a Stage-A shortcut is taken deliberately, the ADR records the
escape hatch.

## 6. Reading order for this package

| Doc | Contents |
|---|---|
| `01-reverse-engineering.md` | Complete breakdown of the TradeS BUILD_PROMPT: subsystems, dependencies, assumptions, strengths, weaknesses, invariants, extension points |
| `02-target-architecture.md` | Future architecture, multi-agent council, communication protocol, event system |
| `03-memory-and-plugins.md` | Memory architecture, plugin system, MCP integration layer, broker abstraction |
| `04-engines.md` | Portfolio / Trading / Investment / Risk / Learning / Strategy-Evolution engines |
| `05-platform.md` | Data layer, API layer, UI architecture, security model, folder structure |
| `06-migration.md` | Database evolution plan, incremental migration from TradeS, technical risks |
| `07-roadmap.md` | Product roadmap, future enterprise features |
| `08-adrs.md` | Architecture Decision Records (with alternatives compared) |
| `09-prds.md` | PRDs for every subsystem |
