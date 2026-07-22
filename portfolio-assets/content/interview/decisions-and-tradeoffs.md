---
title: Decisions and Tradeoffs
slug: decisions-and-tradeoffs
---

Q: What is a hard architectural call you made and why?
A: On the QE platform I chose GraphRAG on a knowledge graph over plain vector retrieval. QA documents are full of entity relationships that cosine similarity flattens, so a graph preserves the structure the answer depends on. The tradeoff is real: GraphRAG costs roughly 30 to 40 percent more tokens per query. But it produced about half as many regenerations, so the cost per acceptable output went down, and hallucination dropped from around 15 percent to under 5 percent. I make that tradeoff explicitly because the number that mattered to the customer was trust in the output, not tokens on the invoice.

Q: When did you deliberately not use a popular technique?
A: On Loop Copilot I chose event sourcing over vector RAG for chat context. The copilot needs to know what just happened in the workflow, not what the history semantically embeds to. So I inject live workflow events, the account portfolio, and recent chat as structured JSON per request. It costs more tokens per call, but it eliminates hallucinated memory entirely. Choosing not to reach for RAG when it is the wrong tool is itself the decision.

Q: Give me a build-versus-buy call.
A: On the codebase intelligence system I reused Understand Anything, an open-source plugin, for codebase parsing and dependency-graph construction rather than rebuilding a solved layer. Rebuilding that would demonstrate no judgment. The value is in the layer it does not have: an autonomous multi-domain audit fleet, conflict reconciliation across agents, and a delivery layer that routes approved findings into the customer's own Jira. I build the part a customer pays for and reuse the part that already exists, and I disclose the reuse openly.

Q: How do you decide autonomy boundaries for an agent?
A: The rule is consistent across everything I build: the language model proposes, deterministic code decides, and a human approves anything that writes to a customer's production system. In WealthOS a code-enforced veto gate with five concentric risk rings sits between the agent council and any action that touches money. In the codebase system, no ticket lands in the customer's Jira until a human approves the proposed set. That gate is not an afterthought, it is a first-class step, because no one lets an agent write to their tracker unreviewed.

Q: Tell me about a constraint you designed within rather than against.
A: On Loop Copilot the customer's IT policy blocked standard external OAuth grants. Instead of fighting it, I built a three-tier integration inside their tenant trust model: Power Automate flows on internal tenant identity as the primary path, direct Dataverse REST via MSAL where permissions were broader, and a browser session path as fallback. It was a more complex strategy, but it was portable across their environments from day one and it respected the boundary the customer actually had.

Q: What tradeoff do you regret or would change?
A: On Loop Copilot I retrofitted automated test coverage in V2 instead of writing it from V1, and I built D365-specific first and refactored toward a multi-CRM abstraction later. Both cost me time I could have saved by designing for them up front. I would architect the abstraction and the tests on day one now.
