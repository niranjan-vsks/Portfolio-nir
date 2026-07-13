# 07 — Product Roadmap & Future Enterprise Features

> Covers deliverables 30–31.

## 1. Product roadmap (deliverable 30)

Milestones map 1:1 to the migration phases in doc 06 §3 (M0–M10). User-visible framing:

### Horizon 1 — "Trustworthy trader" (M0–M2)
- TradeS fully operational: predictions, accuracy panel, paper bot, self-improvement.
- Kernel seams + plugin extraction (invisible to the user, foundational to everything).
- **Exit criterion:** the accuracy panel beats SPY-drift and dumb baselines over a
  meaningful sample — the original blueprint's own bar for trust.

### Horizon 2 — "See everything you own" (M3)
- INDmoney read-only connection; unified net worth across brokers; multi-currency;
  allocation/drift/concentration analytics; goals.
- First moment WealthOS is valuable to a non-trader.

### Horizon 3 — "The council convenes" (M4–M6)
- Advisory council with decision cards, disagreements, devil's advocate, risk verdicts.
- Decisions Inbox + challenge; per-agent track records visible from day one.
- Approve-to-act autonomy into the *paper* execution path; portfolio risk rings live.

### Horizon 4 — "It learns as a team" (M7–M8)
- Per-agent grading/calibration/lessons; Reflection reports ("what are we wrong about").
- Per-agent policy evolution through the gauntlet; council-weight evolution.

### Horizon 5 — "Whole-wealth, India-first" (M9)
- Upstox trading plugin; NSE/BSE calendars; mutual funds, gold, bonds; INR base;
  SIP automation; Tax Intelligence (advisory) on the lot ledger.

### Horizon 6 — "Everywhere you are" (M10)
- WhatsApp/Telegram/Slack/email/push notification plugins; approval-by-message with
  signed tokens; voice interface (OpenClaw) as a client of the same API.
- Stage B: Postgres, roles, hosted deployment.

## 2. Future enterprise features (deliverable 31)

Designed-for now (seams exist), built at Stage C:

- **Multi-tenancy:** tenantId already on all new tables; per-tenant plugin configs,
  budgets, and autonomy policies; tenant-scoped repositories.
- **Team roles & workflows:** owner / advisor / analyst / viewer; multi-human approval
  chains for large orders (quorum approvals on decision cards).
- **Compliance surface:** exportable append-only audit trail; decision replay ("show me
  everything that led to this trade"); retention policies; jurisdiction packs as
  Compliance-agent policy plugins; suitability questionnaires feeding Preference Memory.
- **Plugin marketplace:** signed third-party plugins, out-of-process sandboxing,
  capability review process, revenue share. The manifest/capability model in doc 03 §3
  is the contract that makes this possible.
- **Model governance:** per-tenant LLM provider selection, cost dashboards,
  model-version pinning per agent, eval suites gating model upgrades (the gauntlet idea
  applied to model swaps).
- **White-label / advisor edition:** an RIA manages many client tenants; per-client
  councils with shared research memory but isolated portfolio/preference memory.
- **Enterprise SSO & secrets:** SAML/OIDC, KMS-backed credential storage, IP allowlists.
- **SLOs & observability:** event-bus lag, agent latency/cost, grading backlog, plugin
  health — all measurable because everything already flows through the kernel.
- **Regional broker packs:** Zerodha, IBKR, Robinhood, Binance, Coinbase — each just
  another `BrokerPlugin`, prioritized by demand.
