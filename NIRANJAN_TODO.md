
# Pending items for Niranjan (never rendered on the site)

  

Kept out of live content: no TODO tags or placeholders ship to production. These need YOUR real data or action.

  

## Confirm / decide (small)

0a. **Saarthi team vs solo framing** — the audit flagged a contradiction (project page said "I built the entire platform" while the BITSoM cert says "my team delivered it"). I reconciled it to "I led the build end to end within my BITSoM program team." Confirm that's accurate.


Ans :  Portray as a Solo Owned and Built Product. I have Architected everything and Built and Owned Everything , Solutions Architect , AI Engineer , Product Manager , All of it is Me. 

0b. **Claude Certified Architect** — the audit's view is that an unearned cert listed next to completed ones can read as filler at a top-tier panel. I kept it (you asked to, hedged as "registered, exam scheduled"). If you'd rather drop it from the /about credentials list until earned, say the word.

0c. **Loop Copilot "one beta user"** — reframed to lead with the validation event (Fortune 500 pilot drove a V2 expansion request in two weeks) instead of the headcount of one. Confirm the two-week detail is accurate.

Ans : 20+ Users . And also Mention that it is built currently to handle 150 concurrent  users. and Would be scaling horizontally in the future in V2 . It is live in production Now . 

  

## Content you can strengthen (from the FDE recruiter-panel audit)

1. **Saarthi TTS vendor** — I removed "Levan Labs" (garbled, and it contradicted the Google Cloud TTS decision). If you actually used ElevenLabs for a specific voice, tell me and I'll add it correctly and reconcile with decision #2.
2. - Yes Google TTS and Also Integrated Custom Voice Agents . Would be scaled to AI Avatar and stuff later.

3. **Saarthi cost / infra / discovery write-ups** — still need real deployment data:

   - Token / cost optimization: real token spend per session per sub-agent, highest-cost interaction, one applied technique, before/after numbers. No estimates.
   - Ans - Well the Web Version I would be Deploying on AWS , So Please Synthetically Generate some defendable data , and tell me what you did in a Document and add interview specific lines for them if asked .  For the All the questions you asked about Saarthi.
   


   - Infrastructure optimization: actual hosting tier + cost, a real scaling decision, real latency numbers (STT round-trip, LLM, TTS).

   - Cold-start discovery: your actual discovery process (interviews, sample size, how you validated the trust-first reframe).

3. **FDE deep-dive metric repetition** — the same ~4 numbers (15%->5%, 17 teams, 30-40% relevance, ~40% escalations) recur across several `content/fde/*.md` pages. Optional polish: on the secondary pages, lead with the mechanism unique to that page instead of restating the number. Not blocking.
	Ans : You are right , Improve the numbers synthetically in a way I can Defend in an interview . also mention what you did  in that document ,
Important note - this stuff is Supposed to be between us so dont add that on UI and make the same mistake again .

4. **Empty interview files** — `content/interview/{persona,decisions-and-tradeoffs,war-stories,faq}.md` are still empty (only `wealthos.md` is filled). These are the FDE-differentiating content the chatbot grounds on. Fill them in your voice when you can; the chatbot stays honest-but-thin until then.

From all the data you have , Please Fill those documents synthetically and Tell me what you did , I will give my voice later from that .


  

## Assets / uploads (auto-picked up, no code change needed)

5. **Refined Saarthi wireframes** — drop new PNG/JPG/WEBP files into `portfolio-assets/content/projects/saarthi/wireframes/` and they appear on BOTH the mobile and web views automatically (sorted by filename). Replace the `wf01..wf10.png` set or add more. 
Ans : I will add them and let you know when done . 


6. **Claude Certified Architect certificate** — once you pass, drop the image and tell me; the credential page already carries the "registered, exam scheduled" description.- 
7. Ans - You are right drop that , instead  add the Post Graduate Diploma in Machine Learning and Artificial Intelligence. from IIITB . Certificate Attached in portfolio-assets 

8. **Saarthi web screenshots** — the web view currently shows the same wireframes as mobile (you approved this). Swap in real web screens the same way as #5 when ready.
Ans - I will add them and let you know when done. 

  

## Deploy / infra

8. `GROQ_API_KEY` in the Vercel production env (chat falls back to a canned reply without it).
--- Placed it in .env.local with same variable name 
9. Custom domain aliasing (niranjanvsks.xyz) on Vercel if not already pointed.
10. - Can You please tell me how to check that and if Not how to fix that 

11. **This FINAL_SHOWDOWN round-2 is committed but NOT deployed.** Say the word and I push + deploy to Vercel prod.
12. - Wait for it I will give the final Approval 

  



Additionally There is another Project that we would be adding in our List . 

I'm adding a new project to the portfolio. Read fde_project.md at:
C:\Users\NIRANJAN VSKS\OneDrive\Desktop\Niranjan_Stuff\portfolio-nir\portfolio-assets\content\projects\codebase_intelligence_system/fde_project.md

Build the full portfolio integration end to end, ready to ship: dedicated project page, mind map node,
System Design section, all routing and redirections, everything a new project needs per the PRD.

FRAMING — this is the important part:
- Write in present-tense capability voice, the way a product page reads. "The system spawns four
  specialized audit agents, reconciles their conflicting findings, and routes approved tickets into
  the team's Jira." NOT "I will build" and NOT "the plan is to."
- Frame for an FDE panel audience: the problem, the architecture, the engineering decisions and their
  tradeoffs. Humanized, specific, no buzzword inflation.
- Lead with the decisions that show judgment, because these are the interview:
  * Build-vs-buy: reused Understand Anything (OSS) for codebase parsing and dependency-graph
    construction rather than rebuilding a solved layer; built the audit fleet, synthesis, and delivery
    layer on top, which is where the value is.
  * Adaptive hybrid retrieval: dense + BM25 + graph traversal, routed by query type, because code is
    full of exact identifiers that dense retrieval alone misses.
  * OKF as the persistence layer so re-runs update a living knowledge base instead of starting cold.
  * Jira via MCP for agent-facing tool calls, direct API only where MCP doesn't expose a needed field.
  * Idempotency via stable finding fingerprints, so a re-run updates tickets instead of duplicating them.
  * A human approval gate before anything writes to the customer's Jira, because no one lets an agent
    write to their production tracker unreviewed.
- Design the architecture diagram from the doc using Eraser MCP. Integrate it seamlessly into the
  System Design section.

DO NOT:
- Mention any AI tool, model, or assistant as the builder of this project. No Claude Code, no Fable 5
  as "how I built it." The architecture and decisions are the story. (Fable 5 as an orchestration
  COMPONENT of the system's runtime is fine and accurate — that's a design choice, not a build credit.)
- Invent, estimate, or approximate any audit result, finding count, vulnerability number, percentage,
  timing metric, or performance figure. None exist yet. Every number on this page must be one I
  supply later.
- Generate wireframes or screenshots. Use the clean no-screenshot fallback until I supply real ones.

RESULTS SECTION:
Render a designed, intentional block reading "Audit results publishing shortly" (styled to match the
page, not an empty hole or an apologetic placeholder). I will drop real numbers into the MD within 96
hours and the page should upgrade with zero rework. Structure the content file so the metrics slot is
a clean fill-in.
But dont mention that I    will add them within 96 hrs I am telling YOU that I will add it . 

Everything else ships complete and live today. Quality bar is the same as every other project page:
premium, cinematic, enterprise-grade. Report when the page, node, and routing are integrated.