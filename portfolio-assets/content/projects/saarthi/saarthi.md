---
title: Voice-First Financial AI Copilot
public_name: Voice-First Financial AI Copilot
slug: saarthi
status: piloting
demo: "pilot"
tagline: Voice intelligence for India's gig workforce
stack: [Voice STT, Master AI Orchestrator, Gemini, Supabase + pgvector, Google Cloud TTS, Custom Voice Agents, Multi-language, Mobile + Web, AWS]
metric: "~55% first-week repeat usage against a >40% target (V1 pilot, ~15 users over 2 weeks)"
signature_visual: phone-mockup
order: 2
---

## Status note

Built end to end across mobile and web: AI integration, multilingual voice workflows, and financial-intelligence features are complete. Currently in pilot with a small user group ahead of broader rollout.

## The problem

India's gig workers face structural financial precarity: irregular daily income, payout delays, no emergency buffer, and deep distrust of fintech apps after years of scam exposure. Existing tools assume literate, English-comfortable, salaried users. Nothing exists that actually helps a delivery rider understand his own cashflow.

## My role

I own this product end to end, solo: solutions architect, AI engineer, and product manager in one. Customer discovery, product strategy, the agentic architecture, AI orchestration, and full-stack delivery across mobile and web are all mine. I made every technical call, including the trust-first reframe below, and shipped the platform from a blank page to a working pilot.

## Why it mattered

User research surfaced that the real need was confidence against exploitation, not financial-data access. That reframe restructured the product from information delivery to trust-building through conversational AI.

## Architecture
Voice-first agentic system: voice is the interaction layer atop a modular AI orchestrator that maintains user context and routes to specialized sub-agents (money logging, analysis, education, offer explanation). Retrieval runs over a curated, regulatory-safe knowledge base. Responses are non-transactional and consent-driven, with system-prompt guardrails. The compliance posture is a multi-layer architecture (curated knowledge base + guardrails + server-side governance + consent-first data), not model fine-tuning. Compliance was a design constraint from the start, not a retrofit, because financial guidance for vulnerable users sits inside SEBI, DPDP, and RBI considerations.

## Key decisions (V1, verified in pilot)
1. **Vernacular voice over chat.** Low literacy means voice wins. Tradeoff: STT/TTS infra cost and dialect accuracy.
2. **Google Cloud TTS plus custom voice agents for production voice,** selected for reliability and cost efficiency on the budget Android devices the target users carry. The voice layer is built so it can grow into fully custom voice agents and, later, an AI avatar without reworking the orchestration underneath.
3. **Supabase with pgvector over a standalone vector DB,** to keep RAG infrastructure simple at MVP scale and reduce operational surface.
4. **Gemini for conversational intelligence,** for cost-efficient depth in vernacular languages.

## The outcome (V1 pilot, real numbers)
Pilot of about 15 users over two weeks: ~55% repeat usage within the first week against a >40% target; most users engaged with vernacular voice; half acted on at least one AI suggestion. It validated that voice-first works for low-literacy users and that non-prescriptive guidance is trusted more than directive advice.

## Web deployment (AWS)

The web version runs on AWS. The React front end is served from S3 behind CloudFront; API Gateway fronts the application tier; the master orchestrator and its sub-agents run as containers on ECS Fargate that scale on request volume, with the heavier voice work isolated so a slow synthesis call never blocks the chat path. Session context and per-user rate limits sit in ElastiCache, structured state in a managed Postgres with pgvector for retrieval, and audio blobs in S3. Secrets live in AWS Secrets Manager, never in images or environment files.

The voice loop is held to explicit latency budgets so the conversation stays natural on the budget Android devices the users carry: speech-to-text under roughly 700 ms, model reasoning under about 1.5 s on the common path, and text-to-speech synthesis under roughly 500 ms, with the three stages pipelined rather than run strictly in sequence. The design target is a spoken turn that comes back inside a few seconds end to end.

Cost is engineered, not hoped for. The dominant drivers are STT and TTS per-minute charges and LLM tokens per turn, so the architecture caps each: hot answers from the curated knowledge base are cached instead of regenerated, low-complexity turns route to a lighter model, prompt payloads are compressed to the context each sub-agent actually needs, and TTS is only invoked on responses the user will actually hear. The result is a per-active-user cost that stays bounded as usage grows rather than scaling linearly with every interaction.

## What I would do differently
Start with a WhatsApp bot rather than a standalone app to cut install friction.
