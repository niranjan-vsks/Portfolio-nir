---
title: Autonomous Portfolio Rebalancing Agent
public_name: Autonomous Portfolio Rebalancing Agent
slug: rebalancer
status: in_development
demo: none
tagline: Multi-asset agentic rebalancing for Indian retail investors
stack: [Groww MCP, LLM decision agent, structured tools, recommendation engine]
metric: "11-signal decision framework; surfaces rebalancing recommendations (no auto-execution)"
signature_visual: static-architecture
order: 3
---

## The problem
Indian retail investors hold structurally multi-asset portfolios: equity mutual funds, direct stocks, ETFs, bonds, NPS, sometimes PPF. Most AI trading agents online are stock-only and built for US markets. Nothing speaks to the Indian retail reality, where allocation drift across multiple asset classes is the actual rebalancing problem.

## My role
Architecting and building the agent as a personal project to operationalize agentic AI principles on real broker data with real consequences. Single-agent, prompt-driven V1; multi-agent decomposition planned for V2.

## Why I'm building it
Demonstrated understanding of agents on real data with real consequences is the bar for AI engineering now. Trading is high-signal: outcomes are measurable, regulated, and unforgiving.

## The 11-signal decision framework
Target allocation drift (highest weight), macro indicators, sector rotation, earnings calendar, fund performance, volatility regime, liquidity/exit-load windows, tax efficiency (STCG vs LTCG), cash position, news/sentiment (optional layer), and user-defined constraints. The list maps to real retail portfolio concerns, not generic "AI trading" talking points.

## Key decisions
1. **Groww first** for broker integration: MCP availability for Indian markets and multi-asset coverage (Zerodha Kite has no MCP).
2. **System prompts before multi-agent:** validate the analysis loop cheaply before paying the complexity tax. Natural transition point is when decision factors exceed three or four.
3. **Read-only, no auto-trading.** Regulatory exposure (SEBI), risk exposure (a code bug equals financial loss), and product position: advisory agent first, execution only after multi-cycle accuracy validation. It surfaces recommendations; it does not execute trades.
4. **Multi-asset from day one,** because Indian retail portfolios are structurally multi-asset.

## Where I'm taking it
Deterministic risk guardrails wrapping the LLM, scheduled pre-market analysis, multi-agent decomposition (Analyst, Risk, Recommender), a Telegram delivery layer, paper-trading validation, then human-in-the-loop approval for live execution.

## What I'm learning
The hard part is not the LLM. It is the deterministic logic around it. The pattern I'm settling on: LLM for synthesis and explanation, deterministic Python for guardrails and execution, the agentic layer where they meet.
