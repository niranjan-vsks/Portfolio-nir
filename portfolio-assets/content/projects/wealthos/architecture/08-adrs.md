# 08 — Architecture Decision Records

> Deliverable 32. Format: Context → Options compared → Decision → Consequences.
> New ADRs are appended; none is ever edited after acceptance (append-only, like everything else).

---

## ADR-1: Preserve TradeS internals; extend only at documented seams

- **Context:** Mandate says wrap/extend, never rewrite; TradeS designs are validated.
- **Options:** (a) refactor TradeS into the new module layout; (b) keep TradeS files in
  place and wrap them behind interfaces; (c) fork and diverge.
- **Decision:** (b). Existing paths under `src/lib/{alpaca,research,bot,improve,i18n,auth}`
  and `worker/` do not move or change. New code wraps them (plugins, engines, kernel).
  Any internal change requires a new ADR + regression diff of outputs.
- **Consequences:** Some short-term duplication (e.g., repo seam only for new tables);
  in exchange, zero regression risk to the validated core and a clean audit story.

## ADR-2: Event bus = durable log in the primary DB, dispatched by the worker

- **Context:** Mission demands event-driven; TradeS reality is a sleeping laptop, one
  SQLite file, and a proven jobs-table bridge.
- **Options:** in-memory emitter; external broker (Redis/NATS/Kafka); DB-backed log.
- **Decision:** DB-backed append-only `events` + subscriptions + delivery cursors,
  dispatched in the worker. Interface-compatible with an external broker for Stage B/C.
- **Consequences:** Replay/catch-up and transactional consistency for free; write-volume
  ceiling accepted and monitored (risk T4).

## ADR-3: Council = independent typed opinions + code-enforced vetoes + calibrated aggregation

- **Context:** Critical decisions must not come from one agent; vetoes must be real.
- **Options:** (a) free-form multi-agent debate transcripts; (b) single agent with
  role-played personas; (c) isolated typed opinions aggregated by a Supervisor with
  kernel-enforced vetoes.
- **Decision:** (c). Debate (a) anchors and is ungradeable; personas (b) fake independence.
  Isolation preserves gradeability (each opinion is a row like a prediction); vetoes and
  R0/R1 limits are enforced in kernel code, never prompts.
- **Consequences:** More LLM calls (mitigated by stakes tiers); every agent gets a
  measurable track record, which powers calibration-weighted aggregation.

## ADR-4: The TradeS analyst joins the council whole — it is not decomposed

- **Context:** The prediction engine is the most validated component; splitting it into
  TA/FA/sentiment agents would be a rewrite of proven logic.
- **Decision:** Register it as the "Equity Analyst" seat; its prediction row is its
  opinion. New specialist seats are additive voices. Decomposition, if ever, must win a
  gauntlet against the intact analyst.
- **Consequences:** Some analytical overlap between seats initially; measured, not guessed.

## ADR-5: Broker Abstraction Layer with capability flags; per-connection paper/live triple lock

- **Context:** Mission: no broker coupling; agents must not know the broker. TradeS
  safety assumed Alpaca semantics (server-side brackets, paper host).
- **Options:** lowest-common-denominator interface; rich interface with declared
  capabilities; per-broker engine forks.
- **Decision:** Rich interface + capability flags (`brackets`, `paperMode`, ...). Risk
  policy consumes flags (e.g., no autonomy without server-side protective orders unless
  the human explicitly lowers the bar). The triple lock becomes per-broker-connection.
- **Consequences:** Honest safety across heterogeneous brokers; some brokers start
  read-only, which is fine (read-only is Horizon-2 value).

## ADR-6: MCP is a transport behind plugins, not an agent-facing surface

- **Context:** INDmoney/Upstox arrive as MCP; TradeS deliberately blocks ambient MCP
  (`settingSources: []`).
- **Decision:** A kernel McpBridge maps MCP tools into plugin implementations and
  capability-scoped grants. Mutating MCP tools are only reachable through Execution+Risk.
  Agents never inherit machine/ambient MCP config.
- **Consequences:** Slightly more mapping code per MCP source; injection and
  accidental-mutation surfaces stay closed (risk T6).

## ADR-7: Agents are data (specs + prompts + policies), executed by one AgentRuntime

- **Context:** 20+ agents; TradeS proved the pattern of one `runAnalysis` + DB-backed
  versioned strategy + schema-validated output + one retry.
- **Options:** class-per-agent code; config/spec-driven runtime.
- **Decision:** Spec-driven. `AgentSpec` files + per-agent policy rows; the runtime is a
  generalization of `runAnalysis`. Code-level behavior differences (Execution's broker
  calls, engines' math) live in engines/plugins, not in agent classes.
- **Consequences:** Adding an agent is configuration + schema + prompts; evolution and
  grading are uniform; the runtime is a small, heavily-tested surface.

## ADR-8: One universal evolution gate — TradeS gauntlet math, per agent, thresholds frozen

- **Context:** Self-improvement must expand without becoming a lottery (the blueprint's
  explicit warning).
- **Decision:** Every evolvable policy passes the identical gate: one bounded proposal,
  structural validation, shadow isolation, paired discordant dominance (≥65% of ≥8),
  Brier non-worsening, regime no-catastrophe, holdout, ≤4 promotions/quarter/agent,
  auto-rollback. Thresholds change only by ADR. Self-modification is limited to
  prompts/policies/parameters — never code, schemas, safeguards, vetoes, autonomy.
- **Consequences:** Evolution is slow across many agents (risk T8) — accepted; slow and
  real beats fast and noisy.

## ADR-9: SQLite now with a repository seam; Postgres at Stage B

- **Context:** Single-machine correctness today; SaaS later. TradeS's WAL +
  writer-ownership design is proven.
- **Options:** Postgres now; SQLite forever; SQLite now + planned swap.
- **Decision:** SQLite + repositories for new tables + portability-safe types
  (epoch-ms ints, JSON text) + nullable tenantId everywhere new. Swap at first
  multi-user need.
- **Consequences:** No infra burden during the correctness-critical phase; a bounded,
  rehearsable migration later (doc 06 Wave 4).

## ADR-10: English-base machine text + display-only translation cache, platform-wide

- **Context:** TradeS solved config-driven i18n definitively; the mission adds many
  interfaces and an India-first market.
- **Decision:** Adopt unchanged for all new machine text (decision cards, agent opinions,
  reports): store English, translate on demand into the shared cache. No per-language
  columns anywhere, ever (INV-10).
- **Consequences:** New languages remain a one-entry config change across the whole OS.

## ADR-11: Autonomy is a per-domain mode enforced by kernel + Compliance, defaulting to Suggest

- **Context:** Mission requires both autonomous execution and human-approval modes.
- **Decision:** Modes: Observe → Suggest → Approve-to-act → Bounded-autonomy(paper) →
  Bounded-autonomy(live, per-broker triple lock). Mode checks are kernel code at the
  Execution boundary; Compliance audits mode fitness; `critical`-tier decisions require
  human approval regardless of mode.
- **Consequences:** Autonomy is earned and revocable; the kill switch generalizes to
  "drop domain to Observe" without touching protective orders (INV-5).
