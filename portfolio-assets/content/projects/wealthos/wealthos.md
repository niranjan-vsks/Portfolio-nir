---
title: WealthOS
public_name: WealthOS · Autonomous Wealth Operating System
slug: wealthos
status: in_development
group: independent
tagline: A 21-agent analyst council debates every decision and code, not the LLM, holds the veto.
stack: [TypeScript, Next.js, Node, PostgreSQL, Drizzle, Better Auth, Telegram Bot API, MCP, Railway]
tags: [Multi-Agent Systems, Agentic Orchestration, Event-Driven Architecture, Risk Engineering, LLM Calibration, MCP, Telegram Bots, System Design, Fintech]
order: 3
---

## Problem

Retail investors juggle stocks, mutual funds, ETFs, bonds, and NPS across brokers with no unified brain. Existing robo-advisors are black boxes: one model, one opinion, no accountability for being wrong. LLM trading bots are worse: they let a language model touch money directly.

## Approach

WealthOS is architected around three laws: preserve the validated trading core, money always passes a gate, and everything is measured.

- A 21-agent analyst council produces isolated opinions (no groupthink), a devil's advocate agent attacks the consensus, and aggregation is calibrated: each agent's vote is weighted by its measured historical accuracy, not its confidence.
- No LLM output moves money. Every action passes a code-enforced veto gate and a five-ring risk system: position limits, portfolio limits, drawdown circuit breakers, spend budgets, and per-broker connection locks.
- Strategy changes face an evolution gauntlet with frozen statistical thresholds: a challenger must beat the incumbent across fixed gates before promotion. No silent drift.
- The platform is a modular monolith with ports-and-adapters seams: a framework-free core, broker adapters over Model Context Protocol, and a durable database-backed event bus. Sized for free-tier deployment today with documented seams for horizontal scale.
- Users converse with the system from Telegram: instructions in, trade and portfolio reports out.

## Outcome

Status: In development. The engineering substrate is locked before feature work: 15 frozen architectural invariants, 11 architecture decision records, and 15 subsystem PRDs that make the veto gate, five-ring risk system, and calibration loop enforceable rather than aspirational. The trading core derives from a previously validated system. I engineered a guardrail harness (policy hooks, frozen-path protection, specialist review agents) so implementation cannot violate those invariants. Build metrics publish here as phases ship.

## Product Design

**Core JTBD.** "When my money is spread across brokers and asset classes, help me act on it with institutional discipline, so I stop losing to inattention and emotion."

**Value proposition.** A council, not an oracle: 21 accountable analysts whose track records are measured, behind a gate that code controls. Trust is the product; autonomy is the feature.

**MVP scope (MoSCoW).** Must: portfolio aggregation, council analysis with calibrated output, gated paper execution, Telegram reports. Should: evolution gauntlet, web dashboard. Could: live broker execution, model selection. Won't (v1): social features, advice marketplace.

**Key metric hypotheses (estimates, pre-launch).** Activation: first portfolio connected within one session. Retention proxy: weekly Telegram report open rate. Trust metric: percentage of council recommendations users accept over time.

**Compliance posture.** Built against DPDP requirements and SEBI advisory principles as design constraints: consent-first data handling, no advice framing without registration, execution gated and logged.
