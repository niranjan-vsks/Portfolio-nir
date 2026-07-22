---
title: Guardrails & AI Safety
slug: guardrails-ai-safety
order: 8
caption: the difference between a demo and a system an enterprise will sign off on
back: "Guardrails as layers, not vibes: input/output filtering, grounded-answer contracts, deterministic gates on anything that writes, and evaluation that proves the fences hold."
tags:
  - { label: "RAGAS", node: "skill_ragas" }
  - { label: "GraphRAG", node: "skill_graphrag" }
  - { label: "LLM Observability", node: "skill_llm_observability" }
---

Enterprises do not reject AI systems because the model is weak; they reject them because nobody can say what the system will refuse to do. Guardrails are how I answer that question in writing, and every system I have shipped carries them as architecture, not as a system-prompt wish.

## How I approach it

- Layered, not single-point: input filtering and scope limits, grounded-answer contracts on the RAG path (no retrieved context, no answer), output filtering and refusal paths, and audit logging around all of it. Any one layer can fail; the stack should not.
- Deterministic gates on anything that writes: in the census assistant, registrations and vital-event records run as validated state machines where the LLM assists with language but never writes records; in WealthOS, a code-enforced veto gate with five risk rings means no money moves on LLM output alone.
- Compliance as architecture: Saarthi's multi-layer posture (curated regulatory-safe KB, system-prompt guardrails, server-side governance, DPDP consent-first data, non-transactional by design) shipped a financial copilot without touching model weights.
- Prove the fences hold: guardrails without evaluation are decoration. The QE platform's eval harness (Acceptance-Criteria Coverage, Test-Design Coverage, RAGAS) is the same machinery that makes safety claims audit-defensible, and pairs with RLHF-style preference data and LoRA-tuned behavior when tuning is genuinely warranted.

## Where it shows up

The AI-Infused QE Platform (guardrails + eval plane), the National Census Digital Assistant (deterministic civic-record flows), Saarthi (compliance-first voice copilot), and WealthOS (veto gate and frozen-threshold evolution gauntlet).
