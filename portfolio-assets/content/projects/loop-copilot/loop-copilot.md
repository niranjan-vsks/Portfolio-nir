---
title: Loop Copilot
public_name: Loop Copilot · AI CRM Copilot
slug: loop-copilot
status: live
demo: https://loopcopilot.cc
tagline: D365 automation for enterprise sales
stack: [React 19, async FastAPI, MongoDB Atlas, Groq/Llama 3.1, Entra ID via MSAL, Microsoft Graph, Telegram Bot API, Railway CI/CD]
metric: "CRM logging 4-6 min -> ~45 sec (~85% reduction)"
signature_visual: macbook-scroll
order: 1
---

## The problem
Enterprise sales reps spend 4 to 6 minutes per CRM activity logging in Dynamics 365. Across hundreds of activities per rep per month, that is hours lost to data entry. Worse, the friction means activities do not get logged, so pipeline visibility degrades and opportunity tracking breaks down.

## My role
Sole architect and engineer. I owned the system from customer discovery through V2 production deployment, and built the entire stack solo, including the integration architecture that respected the customer's IT OAuth policy constraints.

## The outcome
CRM activity logging dropped from 4 to 6 minutes to about 45 seconds, an ~85% reduction. It is live in production inside a Fortune 500 sales org with 20+ active users, and the pilot drove a V2 expansion request within two weeks of V1. The system is built to handle 150 concurrent users today and is designed to scale horizontally in a future release. V2 shipped in a single sprint covering Microsoft Graph calendar integration, bulk activity upload with AI summarization, Telegram alerts, admin monitoring, and a multi-CRM expansion shell.

## Key decisions
1. **Three-tier integration within the customer's tenant trust model.** Power Automate flows authenticated by internal tenant identity (primary), direct Dataverse REST via MSAL (secondary, broader-permission environments), Playwright session paths (fallback). The customer's IT policy blocked standard external OAuth grants, so I designed within their tenant trust boundary, not against it. Tradeoff: a more complex three-path strategy, but cross-environment portable from day one.
2. **Event sourcing over vector RAG for chat context.** Live workflow events, account portfolio, and recent chat history are injected per request as structured JSON. Chat needs to know what just happened in the workflow, not what the history embeds to. Tradeoff: more tokens per request, but hallucinated memory eliminated entirely. Choosing not to use RAG when it is the wrong tool is itself the point.
3. **MVP scope: appointment-logging only in V1, over six planned workflow types.** Validate the end-to-end production flow in weeks, not months. The pilot drove an expansion request within two weeks of V1.
4. **Async throughout (FastAPI + Motor).** Sub-second response was non-negotiable for rep adoption. Tradeoff: harder to debug than synchronous patterns.

## What I would do differently
Add automated test coverage from V1 rather than retrofitting it in V2. Architect the multi-CRM abstraction from day one instead of building D365-specific then refactoring. Ship the admin dashboard sooner; manager visibility into adoption was the second-highest request.
