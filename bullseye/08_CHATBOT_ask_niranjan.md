# 08 — CHATBOT: ask_niranjan

A retrieval-grounded chatbot that simulates an interview with Niranjan. Text only in V1. No voice, no avatar (parked for V2+).

## Behavior
- Persona: answers as Niranjan, first person, grounded ONLY in `portfolio-assets/content/` (especially `interview/`). Tone from `interview/persona.md`.
- It simulates an interview: a recruiter/engineer can ask "tell me about a time you...", "how did you handle...", "what would you do if...". It answers from his real stories and reasoning.
- **Honesty guardrail:** if the answer isn't in the corpus, it says so plainly ("I haven't documented that here, but you can reach me at niranjan.vsks@gmail.com") rather than fabricating. Never invent metrics, employers, or experiences. Never claim production specifics that violate the liability firewall.

## Pipeline
1. Embed `portfolio-assets/content/` chunks into a pgvector store (Supabase pgvector or equivalent). Re-embed on content change (a simple ingest script).
2. On query: retrieve top-k relevant chunks → build a grounded prompt with the persona + retrieved context → call **Groq (Llama 3.1 8B)** → stream the answer.
3. Keep lightweight conversation memory within a session (last N turns). No cross-visitor memory, no PII storage.

## Backend
- Next.js route handler (`/api/ask`). Streaming response.
- Secrets via env: `GROQ_API_KEY`, vector store URL/key. Never hardcode. If absent at build time, scaffold fully and leave `TODO(niranjan): set GROQ_API_KEY in .env` and a working mock so the UI runs.

## UI
- Terminal-styled chat panel opened by `> ask_niranjan`. Static photo of Niranjan (from `public/`), name, role.
- JetBrains Mono, `--green` accents, dark. Streaming typed output consistent with the terminal aesthetic.
- Suggested starter prompts (chips): "Walk me through Loop Copilot", "How do you approach a cold-start FDE engagement?", "Toughest RAG problem you've solved?".
- Mobile-friendly (this is text, so it works on mobile unlike the 3D modes).

## NOT in V1
Voice synthesis (ElevenLabs/open-source), talking/lip-synced avatar (Omni), real-time audio. Keep the repos for later. Do not build any audio/avatar path now.
