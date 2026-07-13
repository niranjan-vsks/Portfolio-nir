---
title: Voice-First Financial AI Copilot
public_name: Voice-First Financial AI Copilot
slug: saarthi
status: piloting
demo: "pilot"
tagline: Voice intelligence for India's gig workforce
stack: [Voice STT, Master AI Orchestrator, Gemini, Supabase + pgvector, Google Cloud TTS, Multi-language, Mobile + Web]
metric: "~55% first-week repeat usage against a >40% target (V1 pilot, ~15 users over 2 weeks)"
signature_visual: phone-mockup
order: 2
---

## Status note

Built end to end across mobile and web: AI integration, multilingual voice workflows, and financial-intelligence features are complete. Currently in pilot with a small user group ahead of broader rollout.

## The problem

India's gig workers face structural financial precarity: irregular daily income, payout delays, no emergency buffer, and deep distrust of fintech apps after years of scam exposure. Existing tools assume literate, English-comfortable, salaried users. Nothing exists that actually helps a delivery rider understand his own cashflow.

## My role

I led the build end to end within my BITSoM program team: customer discovery, product strategy, the agentic architecture, AI orchestration, and full-stack delivery across mobile and web. I owned the technical calls, including the trust-first reframe below, and shipped the platform from spec to pilot.

## Why it mattered

User research surfaced that the real need was confidence against exploitation, not financial-data access. That reframe restructured the product from information delivery to trust-building through conversational AI.

## Architecture
Voice-first agentic system: voice is the interaction layer atop a modular AI orchestrator that maintains user context and routes to specialized sub-agents (money logging, analysis, education, offer explanation). Retrieval runs over a curated, regulatory-safe knowledge base. Responses are non-transactional and consent-driven, with system-prompt guardrails. The compliance posture is a multi-layer architecture (curated knowledge base + guardrails + server-side governance + consent-first data), not model fine-tuning. Compliance was a design constraint from the start, not a retrofit, because financial guidance for vulnerable users sits inside SEBI, DPDP, and RBI considerations.

## Key decisions (V1, verified in pilot)
1. **Vernacular voice over chat.** Low literacy means voice wins. Tradeoff: STT/TTS infra cost and dialect accuracy.
2. **Google Cloud TTS for production voice,** selected for reliability and cost efficiency on the budget Android devices the target users carry.
3. **Supabase with pgvector over a standalone vector DB,** to keep RAG infrastructure simple at MVP scale and reduce operational surface.
4. **Gemini for conversational intelligence,** for cost-efficient depth in vernacular languages.

## The outcome (V1 pilot, real numbers)
Pilot of about 15 users over two weeks: ~55% repeat usage within the first week against a >40% target; most users engaged with vernacular voice; half acted on at least one AI suggestion. It validated that voice-first works for low-literacy users and that non-prescriptive guidance is trusted more than directive advice.

## What I would do differently
Start with a WhatsApp bot rather than a standalone app to cut install friction.
