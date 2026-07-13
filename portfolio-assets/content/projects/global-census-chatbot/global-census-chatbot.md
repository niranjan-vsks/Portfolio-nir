---
title: National Census Digital Assistant
public_name: National Census Digital Assistant (HPE)
slug: global-census-chatbot
status: production
group: work
order: 6
tags: [Conversational AI, RAG, Deterministic State Machines, Azure, Guardrails, Civic Tech]
---

## Overview

A civic-scale conversational assistant supporting India's census operations, built at HPE on Azure. It grounds guideline and FAQ answers with retrieval-augmented generation, and runs National Population Register enrolment and birth and death reporting as deterministic, validated state-machine flows against central government registries. Every backend call sits behind Azure API Management as a managed, audited boundary.

## My role

I designed the conversational architecture and the split that makes it safe: generative answering for open questions, and deterministic transactional flows for anything that writes a civic record. I owned the guardrail and audit posture so the assistant never speculates on policy and every registration step is traceable.

## Key decisions

1. Deterministic state machines for registrations over end-to-end generative flows. Civic records demand validation and receipts, not fluency.
2. Azure API Management as a hard boundary, so government-data access is a managed, auditable contract rather than a direct dependency.
3. Guardrails and explicit refusal paths, so the assistant answers what it can ground and declines what it cannot, instead of inventing civic policy.

## Why it mattered

At civic scale, a single wrong answer about enrolment or a mishandled birth or death record is a real-world failure, not a bad chat turn. The architecture keeps the parts that touch records boring and deterministic, and the parts that talk to citizens helpful but bounded.
