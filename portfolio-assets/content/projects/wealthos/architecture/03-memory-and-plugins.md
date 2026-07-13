# 03 — Memory Architecture, Plugin System, MCP Layer, Broker Abstraction

> Covers deliverables 12–15.

## 1. Principles

- Everything outside the kernel is a plugin. TradeS's concrete integrations become the
  **reference plugins** (Alpaca broker, Yahoo data, EDGAR/Stocktwits/Reddit/Quiver research
  sources, Claude Agent SDK provider) — their code moves behind interfaces *without
  behavioral change*.
- Plugins declare capabilities and constraints; the kernel never special-cases a plugin id.
- Agents never see plugin identities: they see `PortfolioView`, `Quote`, `ResearchSection`,
  `OrderResult` — normalized types.

## 2. Memory architecture (deliverable 12)

Ten logical stores, one physical strategy. Each store = (schema'd tables) + (optional
embedding index) + (retention/consolidation policy), managed by the Memory Manager agent.

| Store | Seed from TradeS | Contents | Retrieval |
|---|---|---|---|
| **Conversation** | `chat_messages` | All threads across interfaces, per-decision and free-form | recency + thread |
| **Portfolio** | `holdings`, `account_snapshots`, `bot_trades` | Positions, lots, transactions, equity history per account/broker | structured queries |
| **Investment** | `predictions` + `prediction_outcomes` | Theses, calls, outcomes — the append-only dataset, unchanged (INV-1) | structured + semantic over theses |
| **Market** | `bars_cache`, `latest_prices`, `quant_signals`, regime tags | Price/indicator/regime history | structured |
| **Research** | packet source outputs, `company_links` | Cached findings, filings summaries, relationship graph | semantic + TTL freshness |
| **Strategy** | `strategy_versions`, `bot_rules(+versions)` | Every agent's policy lineage + scorecards | structured (lineage) |
| **Learning** | `lessons` | Root-caused post-mortems for ALL agents | cluster + semantic ("similar past mistakes") |
| **Preference** | `users.lang`, `bot_config` | User goals, risk tolerance, autonomy modes, constraints ("never tobacco") | structured; Compliance reads it |
| **Execution** | `orders_log`, `bot_activity` | Full order/decision audit incl. blocked/halts | structured |
| **Reflection** | (new) | Periodic self-assessments, calibration drift reports, improvement reports | recency |

**Physical strategy (Stage A):** same SQLite DB, same writer-ownership discipline
(INV-13). Embedding indexes are additive sidecar tables (`memory_embeddings`: storeId,
rowRef, vector, model) filled lazily by the Memory Manager — the source tables are never
altered for retrieval's sake. Memory *providers* (e.g., a vector DB at Stage C) are
plugins behind a `MemoryProvider` interface; SQLite is provider #1.

**Consolidation & decay:** Memory Manager runs on the learning budget (shed before
anything user-facing): dedupe research findings, expire stale market memory per TTL,
roll conversation history into summaries, promote recurring lessons into cluster records
that feed the strategist (extends the existing "actionable cluster" gate).

## 3. Plugin architecture (deliverable 13)

### 3.1 Contract

```ts
interface PluginManifest {
  id: string; version: string;
  kind: "broker" | "market-data" | "research-source" | "llm-provider"
      | "notification" | "interface" | "memory-provider" | "risk-engine" | "mcp";
  capabilities: string[];              // e.g. broker: ["portfolio.read","orders.paper","orders.live","brackets"]
  constraints?: { maxConnections?: number; rateLimits?: RateSpec[]; markets?: MarketId[] };
  configSchema: zod.Schema;            // credentials/config, validated like env.ts
  healthCheck(): Promise<HealthStatus>;
}
```

- **Lifecycle:** register → validate config (Zod, empty-string-is-unset — the env.ts
  convention) → health-check → active. Failures degrade gracefully and surface as
  "Data Gaps" (the packet pattern, generalized) — a dead plugin never crashes an engine.
- **Isolation:** Stage A plugins are in-process modules behind interfaces (matching the
  single-machine reality). The interface is designed so Stage C can move untrusted
  third-party plugins out-of-process without changing callers.
- **Capability security:** the kernel grants tools to agents from plugin capabilities.
  Only the Execution agent may hold `orders.*`; `orders.live` additionally requires the
  full unlock chain (INV-2) — capability grants cannot bypass it.

### 3.2 Plugin kinds and their reference implementations

| Kind | Interface core | Reference plugin (extracted from TradeS, unchanged behavior) |
|---|---|---|
| Broker | §4 below | `alpaca` (paper+live, brackets, one-WS constraint declared) |
| Market data | `getBars/getQuote/stream?` | `alpaca-iex`, `yahoo` (delayed, intl) |
| Research source | `fetchSection(instrument): ResearchSection` | `alpaca-news`, `yahoo-fundamentals`, `sec-edgar`, `stocktwits`, `reddit`, `polymarket`, `quiver` |
| LLM provider | `invoke(spec, prompt, tools): Stream` | `claude-agent-sdk` (incl. the guardAnthropicKey semantics as plugin config, INV-11) |
| Notification | `send(channel, msg, urgency)` | (new) web-inbox first; WhatsApp/Telegram/Slack/email later |
| Interface | session + message in/out | web cockpit; voice (OpenClaw) later — interfaces are clients of the same API, per the vision |
| Memory provider | `index/search/expire` | `sqlite-embeddings` |
| Risk engine | `evaluate(context): Verdict` (pure) | `trades-safeguards` (the existing pure function, verbatim) |

## 4. Broker Abstraction Layer (deliverable 15)

The single most important new interface. Requirements: agents never know which broker is
underneath; brokers are swappable; INDmoney's portfolio aggregation is first-class.

```ts
interface BrokerPlugin extends PluginManifest {
  // Read side — every broker must implement
  getAccounts(): Account[];                          // multi-account (INDmoney aggregates many)
  getPortfolio(accountId): Position[];               // normalized: Instrument, qty, costBasis lots, currency
  getTransactions(accountId, range): Transaction[];
  // Trade side — optional capability
  placeOrder?(accountId, order: NormalizedOrder): OrderResult;
  cancelOrder?(accountId, orderId): void;
  streamFills?(accountId): AsyncIterable<FillEvent>; // else: kernel polls + reconciles (INV-15)
  // Declared truths the kernel needs
  supports: { brackets: boolean; fractional: boolean; paperMode: boolean;
              assetClasses: AssetClass[]; markets: MarketId[] };
}
```

Design points:

- **Normalized `Instrument`** replaces raw symbols: `{ id, symbol, exchange, assetClass,
  currency, country }` with per-broker symbol mapping (generalizing the BRK.B↔BRK-B rule).
- **Bracket emulation:** brokers without server-side brackets get kernel-side protective
  monitoring, but the capability flag lets Risk *refuse autonomy* on such brokers —
  server-side stops were a deliberate TradeS safety property; we don't silently weaken it.
- **Paper/live is per-broker-connection**, each with its own triple lock. A live INDmoney
  connection and a paper Alpaca connection can coexist; Execution routes by account, and
  the pure safeguard ring re-checks the connection's mode last (INV-2/INV-4).
- **Read-only connections are valuable alone**: INDmoney read-only powers the whole
  Portfolio Engine with zero execution risk — this is the recommended default posture and
  replaces TradeS manual holdings entry (A8).
- **Fill ingestion**: `streamFills` where available; a universal 60s reconcile poller
  (TradeS order-sync pattern) heals gaps for every broker regardless.
- Initial plugins: `alpaca` (extracted), `indmoney-mcp` (read-focused), `upstox-mcp`.
  Zerodha/IBKR/Binance/Coinbase/custom-REST follow the same interface.

## 5. MCP integration layer (deliverable 14)

MCP servers are how the India brokers (INDmoney, Upstox) and many future data sources
arrive. Treat MCP as a **transport, not a plugin kind**:

- `McpBridge` = kernel service that connects to configured MCP servers, enumerates tools,
  and exposes them as capability-scoped tool grants.
- A broker plugin can be *implemented over* the bridge (`indmoney-mcp` maps MCP tools →
  `BrokerPlugin` methods, normalizing responses). Same for research-source plugins.
- **Safety:** MCP tools that mutate anything are wrapped so they route through Execution +
  Risk exactly like native broker calls — an agent can never call a raw mutating MCP tool
  directly (INV-4). MCP credentials follow the plugin config rules (explicit, validated,
  never ambient — INV-11).
- Agent SDK note: TradeS deliberately sets `settingSources: []` so the analyst inherits no
  ambient MCP servers. **Preserve that** — agents receive only the tool grants their spec
  declares, sourced from the kernel's bridge, never from the machine's environment.
