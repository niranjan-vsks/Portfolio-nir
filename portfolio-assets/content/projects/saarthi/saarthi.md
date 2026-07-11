---
title: Voice-First Financial AI Copilot
public_name: Voice-First Financial AI Copilot
slug: saarthi
status: piloting
build_status: production-ready
demo: "pilot"
tagline: Voice intelligence for India's gig workforce
stack: [Voice STT, Master AI Orchestrator, Gemini, Supabase + pgvector, Google Cloud TTS, Levan Labs, Multi-language, Mobile + Web]
metric: "~55% repeat usage within first week (target >40%), ~15 pilot users over 2 weeks (V1 pilot)"
signature_visual: phone-mockup
order: 2
---

## Status note

Production-grade platform completed end-to-end with cross-platform support across mobile and web. The platform has completed development, AI integration, multilingual voice workflows, and financial intelligence capabilities. It is currently in pilot deployment with selected users before broader production rollout.

## The problem

India's gig workers face structural financial precarity: irregular daily income, payout delays, no emergency buffer, and deep distrust of fintech apps after years of scam exposure. Existing tools assume literate, English-comfortable, salaried users. Nothing exists that actually helps a delivery rider understand his own cashflow.

## My role

I owned the complete product lifecycle—from customer discovery and product strategy through architecture, implementation, AI orchestration, and full-stack development. I designed and built the entire production-grade platform with cross-platform support for mobile and web, integrating multilingual voice intelligence, financial AI workflows, and enterprise-ready infrastructure now undergoing pilot deployment.

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

---

## Token / cost optimization
`TODO(niranjan)`: Requires a live deployment with real API traffic before this section can be written honestly. Do not fill this in with estimates. Once V2 is deployed:
- Capture real token spend per session (input + output, by sub-agent).
- Identify the highest-cost interaction type.
- Apply one real technique (prompt compression, caching repeated context, model routing by task complexity, batching).
- Report actual before/after numbers here. If no optimization work has been done yet, leave this section out of the live portfolio rather than publishing a placeholder claim.

## Infrastructure optimization
`TODO(niranjan)`: Same rule. Requires real deployment + real load before this is honest content. Once deployed:
- Document actual hosting tier and cost.
- Document any scaling decision made in response to a real bottleneck (not a hypothetical one).
- Report actual latency numbers (STT round-trip, LLM response, TTS synthesis) under real conditions.

## Forward Deployed Engineer framing (reference architecture, not a claim of deployment)
This section is legitimate to publish now because it is framed as "how I would build this at enterprise scale," not as a fact about what has already happened. Use "reference architecture" / "how I would build" language throughout, consistent with the liability firewall.

- **Cold-start discovery approach:** `TODO(niranjan)` — your actual discovery process for Saarthi (user interviews, sample size, how you validated the trust-first reframe before building).
- **Deployment topology (reference):** Voice input -> STT -> orchestrator -> sub-agent routing -> curated RAG retrieval -> guardrail layer -> Gemini -> TTS -> response. Describe as the pattern you would deploy into a customer environment, not as a live system.
- **Multi-tenant / scale considerations (reference):** How this architecture would need to change to serve enterprise-scale gig platforms (a logistics company's driver base, for example) rather than a 15-user pilot. Write this as forward-looking judgment, clearly labeled as such.
