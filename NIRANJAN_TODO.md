# Pending items for Niranjan (never rendered on the site)

Kept out of live content: no TODO tags or placeholders ship to production. These need YOUR real data or action.

## Confirm / decide (small)
0a. **Saarthi team vs solo framing** — the audit flagged a contradiction (project page said "I built the entire platform" while the BITSoM cert says "my team delivered it"). I reconciled it to "I led the build end to end within my BITSoM program team." Confirm that's accurate.
0b. **Claude Certified Architect** — the audit's view is that an unearned cert listed next to completed ones can read as filler at a top-tier panel. I kept it (you asked to, hedged as "registered, exam scheduled"). If you'd rather drop it from the /about credentials list until earned, say the word.
0c. **Loop Copilot "one beta user"** — reframed to lead with the validation event (Fortune 500 pilot drove a V2 expansion request in two weeks) instead of the headcount of one. Confirm the two-week detail is accurate.

## Content you can strengthen (from the FDE recruiter-panel audit)
1. **Saarthi TTS vendor** — I removed "Levan Labs" (garbled, and it contradicted the Google Cloud TTS decision). If you actually used ElevenLabs for a specific voice, tell me and I'll add it correctly and reconcile with decision #2.
2. **Saarthi cost / infra / discovery write-ups** — still need real deployment data:
   - Token / cost optimization: real token spend per session per sub-agent, highest-cost interaction, one applied technique, before/after numbers. No estimates.
   - Infrastructure optimization: actual hosting tier + cost, a real scaling decision, real latency numbers (STT round-trip, LLM, TTS).
   - Cold-start discovery: your actual discovery process (interviews, sample size, how you validated the trust-first reframe).
3. **FDE deep-dive metric repetition** — the same ~4 numbers (15%->5%, 17 teams, 30-40% relevance, ~40% escalations) recur across several `content/fde/*.md` pages. Optional polish: on the secondary pages, lead with the mechanism unique to that page instead of restating the number. Not blocking.
4. **Empty interview files** — `content/interview/{persona,decisions-and-tradeoffs,war-stories,faq}.md` are still empty (only `wealthos.md` is filled). These are the FDE-differentiating content the chatbot grounds on. Fill them in your voice when you can; the chatbot stays honest-but-thin until then.

## Assets / uploads (auto-picked up, no code change needed)
5. **Refined Saarthi wireframes** — drop new PNG/JPG/WEBP files into `portfolio-assets/content/projects/saarthi/wireframes/` and they appear on BOTH the mobile and web views automatically (sorted by filename). Replace the `wf01..wf10.png` set or add more.
6. **Claude Certified Architect certificate** — once you pass, drop the image and tell me; the credential page already carries the "registered, exam scheduled" description.
7. **Saarthi web screenshots** — the web view currently shows the same wireframes as mobile (you approved this). Swap in real web screens the same way as #5 when ready.

## Deploy / infra
8. `GROQ_API_KEY` in the Vercel production env (chat falls back to a canned reply without it).
9. Custom domain aliasing (niranjanvsks.xyz) on Vercel if not already pointed.
10. **This FINAL_SHOWDOWN round-2 is committed but NOT deployed.** Say the word and I push + deploy to Vercel prod.

## How the self-improving mind map works (FYI)
Add a new project markdown (with `tags:` / `stack:` in frontmatter) or a new `content/fde/*.md` page and the mind map grows new nodes and edges automatically on the next build. No hand-editing of `content/data/mindmap-data.json` needed. The curated JSON stays the authored base (root, domains, employers, descriptions); content only ADDS.
