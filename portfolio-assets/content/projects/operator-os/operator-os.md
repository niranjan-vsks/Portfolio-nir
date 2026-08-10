---
title: Operator OS
public_name: Operator OS
slug: operator-os
status: in_development
group: independent
tagline: A self-hosted multi-agent operations platform
stack: [Next.js 16, React 19, TypeScript, Drizzle ORM, PostgreSQL, Neon, Tailwind v4, React Flow]
tags: [Multi-Agent Systems, Durable Job Queue, LLM Cost Control, Provider Failover, PostgreSQL, System Design]
order: 5
---

## What it is

A single-tenant control plane for running AI agents against real work. It is built around three properties most agent frameworks leave to the reader: every model call is accounted for including the ones that fail, work survives a crash because dispatch is a durable queue, and structure is enforced by the database rather than by asking an agent nicely.

## The cost layer

Every model call routes through one function. A ledger row per attempt including failures. Kill switch, daily spend ceiling, and a per-model price ceiling that catches a case where one vendor lists the same model at $0.28 and $75 per million tokens with capitalisation as the only difference. A CI check fails the build if any code bypasses it.

## Provider cascade

Seven LLM providers, ordered free-first, with automatic failover and per-attempt deadlines because a hung provider blocks the whole chain. Model IDs verified by live probing, not vendor docs. That probe found a model that hangs 194 seconds before dying, and a free tier returning 403 while its dashboard still advertised it.

## Durable job queue

Postgres, FOR UPDATE SKIP LOCKED, leases with reclamation, exponential backoff with jitter, idempotency keys, resumable checkpoints, dead-letter queue.

## Agent organisation

Departments and employees in a registry. Reporting graph kept acyclic by a recursive CTE inside the write transaction. Adding a department requires a manifest file and a row and zero changes to routing or navigation code.

## Verification

78 acceptance checks against a live Postgres instance rather than mocks: 100 concurrent ID issues with zero collisions, two workers claiming disjoint job sets, lease reclamation after a simulated crash, a real cycle refused while a redundant acyclic edge is allowed.
