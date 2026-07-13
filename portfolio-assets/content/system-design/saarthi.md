# Architecture · Voice-First Financial AI Copilot (Saarthi)

The piloted architecture, as walked on /system-design.

## Shape
Mobile and web clients (one architecture, ~30 screens) speak to cloud STT; a master AI orchestrator routes each utterance to specialist agents: money logging, analysis, financial education, and offer explanation. Responses return through guardrails to vernacular cloud TTS, keeping the full loop voice-first across a 10-language architecture.

## Grounding and memory
- A curated, regulatory-safe knowledge base (RAG) grounds education and offer explanation. Smaller than open retrieval, but every answer is defensible under SEBI advisory principles.
- A central memory layer with RAG persists user context, goals, and prior conversations across sessions and across web/mobile from a single source of truth.

## Compliance as architecture
Multi-layer, not model adjustment: curated KB, system-prompt guardrails, server-side governance, DPDP consent-first data handling, and a non-transactional design; no money-movement paths exist. Offers are explained, never recommended.

## Evidence
~55% repeat usage in a first-week pilot (~15 users). User research showed the core need was confidence against exploitation, and the architecture is shaped around that trust boundary.
