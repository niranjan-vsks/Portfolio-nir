---
title: Voice-First Financial AI Copilot
public_name: Voice-First Financial AI Copilot
slug: saarthi
status: piloted
demo: "deploying"
tagline: Voice intelligence for India's gig workforce
stack: [Voice STT, Master AI Orchestrator, Gemini, Supabase + pgvector, Google Cloud TTS, multi-language]
metric: "~55% repeat usage within first week (target >40%), ~15 pilot users over 2 weeks"
signature_visual: phone-mockup
order: 2
---

## The problem
India's gig workers face structural financial precarity: irregular daily income, payout delays, no emergency buffer, and deep distrust of fintech apps after years of scam exposure. Existing tools assume literate, English-comfortable, salaried users. Nothing exists that actually helps a delivery rider understand his own cashflow.

## My role
I owned the full product lifecycle: customer research, MVP scoping, architecture design, implementation, and pilot rollout, and led the BITSoM capstone team's AI architecture. The MVP is a roughly 30-screen application with architecture supporting multiple Indian languages.

## Why it mattered
User research surfaced that the real need was confidence against exploitation, not financial-data access. That reframe restructured the product from information delivery to trust-building through conversational AI.

## Architecture
Voice-first agentic system: voice is the interaction layer atop a modular AI orchestrator that maintains user context and routes to specialized sub-agents (money logging, analysis, education, offer explanation). Retrieval runs over a curated, regulatory-safe knowledge base. Responses are non-transactional and consent-driven, with system-prompt guardrails. The compliance posture is a multi-layer architecture (curated knowledge base + guardrails + server-side governance + consent-first data), not model fine-tuning. Compliance was a design constraint from the start, not a retrofit, because financial guidance for vulnerable users sits inside SEBI, DPDP, and RBI considerations.

## Key decisions
1. **Vernacular voice over chat.** Low literacy means voice wins. Tradeoff: STT/TTS infra cost and dialect accuracy.
2. **Google Cloud TTS for production voice,** selected for reliability and cost efficiency on the budget Android devices the target users carry.
3. **Supabase with pgvector over a standalone vector DB,** to keep RAG infrastructure simple at MVP scale and reduce operational surface.
4. **Gemini for conversational intelligence,** for cost-efficient depth in vernacular languages.

## The outcome
Pilot of about 15 users over two weeks: ~55% repeat usage within the first week against a >40% target; most users engaged with vernacular voice; half acted on at least one AI suggestion. It validated that voice-first works for low-literacy users and that non-prescriptive guidance is trusted more than directive advice.

## What I would do differently
Start with a WhatsApp bot rather than a standalone app to cut install friction. Lead with offer-explanation in vernacular as the wedge feature; that is where users had the most "aha" moments. Start vernacular voice sample collection earlier.
