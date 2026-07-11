---
title: Fine-tuning · RLHF & LoRA
slug: finetuning-rlhf-lora
order: 7
caption: when to tune, when to retrieve, when to leave the model alone
back: "My decision framework for fine-tuning: LoRA adapters where style and format must be learned, retrieval where facts live, and evaluation gates before any tuned model ships."
tags:
  - { label: "RAGAS", node: "skill_ragas" }
  - { label: "GraphRAG", node: "skill_graphrag" }
  - { label: "LLM Observability", node: "skill_llm_observability" }
---

The most expensive fine-tune is the one that should have been a retrieval fix. My first job on any "we need to fine-tune" conversation is deciding whether the problem is knowledge (retrieval), behavior (prompting and guardrails), or genuine capability and format gaps, which is where tuning earns its cost.

## How I approach it

- Retrieval before tuning: in both enterprise RAG systems I shipped, the accuracy gap closed with GraphRAG, reranking, and evaluation loops, at a fraction of a tuning program's cost and risk. Facts belong in retrieval, where they can be updated without a training run.
- LoRA for behavior, not knowledge: parameter-efficient adapters are the right tool when output format, domain style, or tool-calling behavior must be learned, and they keep the base model swappable, which matters in customer environments where the approved model list changes.
- RLHF-style preference signals, pragmatically: structured human feedback (accepted vs corrected outputs) collected from real usage is the highest-value tuning data an enterprise has. The QE platform's evaluation layer (coverage scores, RAGAS) is exactly the grading harness such a loop needs.
- Evaluation gates before shipping: any tuned model must beat the incumbent on the same held-out evaluation before promotion, the same frozen-threshold discipline WealthOS applies to strategy changes.

## Where it shows up

The evaluation infrastructure that makes tuning decisions defensible ships today in the AI-Infused QE Platform; the decision framework governs every model conversation I have inside customer environments.
