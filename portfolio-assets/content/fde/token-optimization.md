---
title: Token Optimization
slug: token-optimization
order: 5
caption: every token in the context window pays rent
back: "Context compression, prompt-payload reduction, and model rerouting: the token engineering that cut per-tenant LLM spend without cutting quality."
tags:
  - { label: "Context Compression", node: "skill_context_compression" }
  - { label: "Query Rerouting", node: "skill_query_rerouting" }
  - { label: "LLM Observability", node: "skill_llm_observability" }
---

Token spend is the one AI cost that scales with success: the better the adoption, the bigger the bill. I treat the context window as a budget where every token pays rent.

## What this looks like in practice

- Context compression in the retrieval path: documents contribute relevant spans, not full bodies, before they reach the model.
- Prompt-payload reduction: system prompts, schemas, and few-shot examples audited and trimmed; anything the model does not need for THIS call gets out of the window.
- Model rerouting by complexity: low-complexity queries route to lighter models, reserving the expensive path for calls that need it. Combined with compression, this cut per-tenant LLM spend on the AI-Infused QE Platform.
- Measured, always: the observability layer's per-tenant token telemetry is what proves an optimization worked and catches regressions when prompts drift.

## Where it shows up

The AI-Infused QE Platform (per-tenant spend engineering under live customer scrutiny) and Loop Copilot (a lean Groq/Llama path where latency and cost budgets are tight).
