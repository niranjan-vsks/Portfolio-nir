---
title: National Census Digital Assistant
public_name: National Census Digital Assistant (HPE)
slug: global-census-chatbot
status: production
group: work
tagline: Civic-scale conversational AI supporting India's census operations
stack: [Conversational AI, RAG, Azure, API Management, state-machine flows, multilingual NLP]
order: 6
---

## Overview
A conversational assistant built to support the Government of India's census operations: citizens get RAG-grounded answers to census FAQs, and complete real transactions conversationally, including NPR (National Population Register) registration and birth and death reporting, connected centrally to government data. Deployed on Azure.

## The design split that matters
Generative where safe, deterministic where it must be. FAQ answering runs as RAG over census guidelines with guardrails and refusal paths, because civic guidance must never be speculated. Registrations and vital-event reporting run as validated, state-machine flows with receipts and a full audit trail; the LLM assists with language but never writes records directly.

## Key characteristics
1. **Every backend call behind API Management.** Access to central government registries is a scoped, throttled, auditable contract, not an open pipe.
2. **Multilingual by design.** Intent detection and responses pass through a language layer so citizens interact in their own language.
3. **Burst tolerance for census windows.** Edge WAF plus an autoscaling app tier absorb national-scale traffic spikes.
4. **Minimal PII retention.** Conversation state is keyed to the case and purged on completion; multi-step registrations survive disconnects without hoarding data.
