---
title: War Stories
slug: war-stories
---

Q: Tell me about a time you shipped into a messy enterprise environment.
A: The QE platform went into enterprise QA teams on their own managed clouds, across AWS, Azure, and GCP, from one codebase with no forks. Every tenant had different identity, different permissions, and different tolerance for AI in their release path. The hard part was not the model, it was tenant-aware RBAC with module-level permissions and role templates that let a new team onboard from their existing org chart, plus per-tenant cost telemetry so a budget owner could watch spend and quality live. It reached seventeen teams at peak. Getting there was an integration and trust problem, not a modeling one.

Q: Describe a time the real problem was different from the stated one.
A: Saarthi started as a financial-data tool for gig workers. User research surfaced that the actual need was not access to their numbers, it was confidence against exploitation after years of scam exposure. That reframe changed the whole product from information delivery to trust-building through conversational AI: vernacular voice first, non-prescriptive guidance, consent-driven and non-transactional by design. The pilot validated it. Around 55 percent of about fifteen users came back in the first week against a 40 percent target, and non-prescriptive guidance was trusted more than directive advice.

Q: When did a small detail turn out to be the whole ballgame?
A: On Loop Copilot, activity logging in Dynamics 365 took reps four to six minutes, so a lot of activities simply never got logged and pipeline visibility degraded. The fix that mattered was not clever AI, it was getting a logged activity down to about 45 seconds inside the customer's tenant trust model without asking their IT team to loosen a single policy. It is live in production for twenty-plus users, and the pilot drove a V2 expansion request within two weeks.

Q: Tell me about a system where safety was the design, not a feature.
A: WealthOS is an autonomous wealth operating system where a council of twenty-one analyst agents debates every decision, weighted by how often each has actually been right, and a devil's advocate stage attacks the consensus. But no language model output moves money. A code-enforced veto gate and a five-ring risk system decide, and the model layer has no write access to money paths at all. The interesting engineering is making that rule structurally impossible to break rather than merely discouraged.

Q: Give me a civic-scale, high-stakes example.
A: The census assistant at HPE helped citizens through enrolment and birth and death reporting. At that scale a wrong answer or a mishandled record is a real-world failure, not a bad chat turn. So I split it: generative answering for open questions, and deterministic, validated state-machine flows for anything that writes a civic record, every backend call behind a managed, audited API boundary. The safe part is boring on purpose.

Q: What is something you learned the hard way?
A: That the parts of an agentic system a customer actually pays for are the unglamorous ones: evaluation you can defend in a budget review, idempotency so a re-run updates work instead of duplicating it, and a human approval gate before anything writes to production. Early on I would have spent that effort on the model. Now I spend it on the trust boundary, because that is what decides whether the thing is allowed to run.
