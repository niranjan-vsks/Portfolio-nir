# TIER 3 — Advanced (v2, revised for Niranjan)

### For: Engineers already building agent systems who want a genuine enterprise-grade FDE portfolio artifact

**The goal:** Multi-agent orchestration. Fable 5 as the orchestrator. Sub-agents for specific tasks. The output is a business deliverable, not a demo. The case study is a genuine enterprise FDE artifact.

---

## WHAT CHANGED IN v2 AND WHY

The original community doc is strong and its master prompts are kept intact. Four additions, all inclusive, none removing existing value:

1. **Rebased on Understand Anything (OSS).** A mature open-source plugin already does codebase parsing, knowledge-graph construction, and graph exploration, installable in Claude Code in one command. Rebuilding that layer is the junior move and a recruiter who knows the space will say "this already exists." We reuse it for ingestion and graph, and spend the build on the layer it does not have.
2. **Added a Jira delivery layer (Component 5).** The original project ends at a document. A document is an artifact; a ticket in the customer's own tracker is an outcome. This is the standout differentiator and it maps directly to real enterprise-integration experience.
3. **Added an adaptive hybrid RAG + OKF persistence layer.** Retrieval for the codebase, OKF (Google's Open Knowledge Format) as the persistent knowledge layer so re-runs update a living picture instead of starting cold.
4. **Added the three depth items that separate a demo from a system:** severity-to-priority mapping, idempotency on re-runs, and a human approval gate before any write to a customer system.

**Scope discipline:** Jira only. No Salesforce, no HubSpot, no custom emailer. Salesforce and HubSpot are CRMs, not issue trackers; logging code-audit findings into a CRM is a category error an interviewer will catch. Jira already emails assignees. One integration done deeply beats four done shallowly, and connector count is not the story.

---

## Project 3A: Autonomous Codebase Intelligence System

**For: Engineers with multi-agent or GraphRAG experience**

If you've done embedded customer work and built RAG or GraphRAG systems, this project uses all of it. Fable 5's 1M context combined with a pre-processed dependency graph produces something most engineers can't.

**What it is:** Fable 5 as the orchestrator. Feed it a codebase it's never seen. It plans a full technical audit, spawns sub-agents to execute each domain, reconciles findings, delivers a CTO-readable report with prioritized recommendations, and routes approved findings into the customer's Jira as real tickets. From cold codebase to delivered, actioned insight, documented.

**Why this is elite FDE portfolio material:** "I walked into a codebase I'd never seen. Here's what I shipped in 48 hours. No ticket. No brief. Just the output."

**The upgraded FDE statement (v2):** "Cold codebase to prioritized, approved tickets in the customer's own Jira in 48 hours. No brief. The agent proposes, a human approves, nothing lands unreviewed."

---

### Step by Step

### Day 1 — Design the Multi-Agent Architecture

Before writing any code, define the agent fleet:

```
Orchestrator: Fable 5
  ├── Sub-agent 1: Dependency Mapper
  │     Job: Map all imports, packages, and internal dependencies. Output: dependency graph
  ├── Sub-agent 2: Security Scanner
  │     Job: Identify hardcoded secrets, vulnerable dependencies, SQL injection risks, auth gaps
  ├── Sub-agent 3: Architecture Reviewer
  │     Job: Identify coupling issues, missing abstractions, scaling bottlenecks
  ├── Sub-agent 4: Dead Code Detector
  │     Job: Identify unused functions, deprecated routes, orphaned files
  ├── Synthesis Agent: Fable 5
  │     Job: Reconcile all sub-agent outputs, identify conflicts, produce prioritized report
  └── Delivery Agent: Fable 5  [NEW in v2]
        Job: Map synthesized findings to Jira tickets, propose them for human approval,
             create approved tickets idempotently, write results back to the OKF bundle
```

Prompt Fable 5 to validate this architecture before you build:

```
I want to build a multi-agent codebase intelligence system.
Here is my proposed agent architecture: [paste the above]

Before I build:
1. Are there dependencies between agents that I haven't accounted for?
2. Which agents can run in parallel and which must be sequential?
3. What could go wrong in each agent and how should the orchestrator handle failures?
4. What data format should each agent output so the synthesis agent can work with all of them?
5. [v2] The Delivery Agent writes to an external system (Jira). What are the failure modes,
   and where must a human approval gate sit so nothing writes unreviewed?

Give me a revised architecture with these considerations addressed.
```

---

### Day 1–2 — Ingestion and Graph: REBASE ON UNDERSTAND ANYTHING  [REVISED in v2]

**Do not build the parsing and graph layer. It already exists and is mature.**

Understand Anything (Egonex-AI/Understand-Anything) is an OSS plugin that already delivers: multi-agent parsing pipeline, a knowledge graph of every file, function, class and dependency, an interactive graph dashboard, semantic and fuzzy search, guided tours, diff-impact analysis, and domain/business-logic extraction. It installs natively in Claude Code.

```bash
/plugin marketplace add Egonex-AI/Understand-Anything
/plugin install understand-anything
```

Useful commands for this build:
- `/understand` — scans the project and builds the knowledge graph (incremental by default)
- `/understand-explain <file>` — deep-dive a file or function
- `/understand-diff` — impact analysis of uncommitted changes
- `/understand-domain` — extract business domains, flows, steps

**Why this is the right call, and how to say it in an interview:**
"Understand Anything is a developer comprehension tool. I evaluated it and used it for graph construction rather than rebuilding that layer. What it does not do is run an autonomous multi-domain audit, reconcile conflicting agent findings, and produce a prioritized decision document that routes into the customer's tracker. That synthesis and delivery layer is what I built, and it is the part a customer actually pays for."

That answer demonstrates landscape awareness, build-vs-buy judgment, and clarity about where value sits. All four are FDE signals. Rebuilding their graph would demonstrate none of them.

**Two hard requirements:**
- Comply with the license and disclose the reuse explicitly in the writeup. Undisclosed reuse in a portfolio piece is a credibility bomb if anyone checks.
- Never claim you built the graph layer. "I used Understand Anything for graph construction; I built the audit fleet, synthesis, and delivery" is stronger and true.

**If you want your own GraphRAG pass on top** (optional, only if the plugin's graph is insufficient for relationship reasoning):

```
# Use your existing GraphRAG pipeline to:
# 1. Parse the codebase into entities: files, functions, classes, imports
# 2. Build relationships: function calls, class inheritance, module imports
# 3. Export as a structured graph (JSON or NetworkX format)

# Then feed BOTH the raw code AND the graph to Fable 5
# This dramatically improves Fable 5's ability to reason about relationships
# because it doesn't have to infer them from text alone
```

**Target codebase:** Pick a real, public, non-sensitive open-source project. Good candidates: a 3–5 year old Python or Node.js project with 10k–50k lines. Something that looks clean on the surface but has accumulated debt. Never run this against employer code.

---

### Day 2 — The Adaptive Hybrid RAG + OKF Persistence Layer  [NEW in v2]

Two distinct layers. Do not conflate them; the distinction is itself an interview answer.

**Layer A — Retrieval (adaptive hybrid).** The codebase does not fit in context. Retrieval feeds the agents.
- Dense (vector) retrieval for semantic queries: "where is auth handled."
- Sparse (BM25) for exact identifiers, function names, error strings. Code is full of exact tokens; dense alone will miss them. This is why hybrid is not optional for code.
- Graph traversal from the Understand Anything dependency graph for relationship queries: "what calls this."
- **Adaptive routing:** classify the query first, then pick the strategy. Identifier lookup goes sparse. Conceptual question goes dense. Blast-radius question goes graph. A single fixed strategy underperforms on all three.
- Rerank the merged candidate set before it reaches an agent's context.

**Layer B — Persistence (OKF).** This is the "persistent context" requirement.
- OKF (Google's Open Knowledge Format, published June 2026) is a directory of markdown files with YAML frontmatter, one file per concept, designed so agents can navigate to the right knowledge without reading everything. It formalizes Karpathy's LLM-Wiki pattern.
- Store audit findings, architectural decisions, conflict resolutions, and the evolving picture of the codebase as an OKF bundle.
- On re-run, the orchestrator reads the existing bundle first. It updates findings, notes where new evidence contradicts prior claims, and links related concepts, rather than starting cold.
- This is what makes it a system rather than a one-shot script.

**Be precise about the distinction (it matters in interviews):** RAG is a retrieval technique; OKF is a storage format. They are not competitors. Retrieval finds; OKF organizes and persists. Anyone who frames it as "OKF vs RAG" has made a category error.

**Caveat, stated honestly:** OKF is new and the spec will change. Keep it as a swappable persistence layer behind an interface, not a load-bearing dependency. Say this in the interview; it shows you evaluate maturity, not just novelty.

---

### Day 2–3 — Build the Orchestrator

```
You are an autonomous codebase intelligence orchestrator.

I've given you:
1. The raw source code of [project name]
2. A dependency graph from Understand Anything (and optionally a GraphRAG-derived graph)
3. The existing OKF knowledge bundle from any prior audit (may be empty on first run)

Your task is to run a full technical audit. Here is your plan:
[paste the architecture you defined in Day 1]

Start with the Dependency Mapper. When it completes, move to Security Scanner and
Architecture Reviewer in parallel. Run Dead Code Detector last.

For each sub-agent:
- State what you're doing
- Execute it
- Output structured results
- Flag confidence level for each finding
- Note what you could NOT determine and why

Do not summarize as you go. Produce complete output for each agent before moving to the next.
After all agents complete, run the synthesis step.
```

```
Synthesis task:
1. Reconcile all findings. Where two agents have conflicting assessments, explain the conflict
   and give your best judgment.
2. Prioritize all findings into: Critical (fix within 1 week), High (fix within 1 month),
   Medium (fix within 1 quarter), Low (technical debt to track)
3. Produce a CTO-readable executive summary: 3 paragraphs, no jargon, focused on business risk.
4. [v2] Reconcile against the existing OKF bundle: which findings are new, which are recurring,
   which contradict a prior claim, which are now resolved. Update the bundle accordingly.

Then answer the unasked question:
"Based on everything you've seen in this codebase, what is the one thing the engineering team
is probably not aware of that will cause the most pain in the next 6 months if left unaddressed?
This should NOT be the highest-severity finding. It should be the most non-obvious inference —
something that only emerges from looking at the full picture."
```

---

### Day 3–4 — Component 5: The Jira Delivery Layer  [NEW in v2]

This is what turns an artifact into an outcome, and it is the clearest separation from every OSS code-comprehension tool.

**MCP vs direct API:** Use the Jira MCP for agent-facing tool calls. The whole architecture is an orchestrator selecting and calling tools; MCP is the tool-use protocol, and a schema-described tool the agent can select is the skill being demonstrated. Fall back to the direct REST API only where the MCP does not expose what you need (custom fields, specific issue types). State this position explicitly: "MCP for agent-facing tool calls, direct API only where the MCP does not expose what I need." That is an engineering position, not a preference.

**The three things that make this senior.** Connector count is not the story; these are.

1. **Severity-to-priority mapping.** How does an agent's "critical security finding" become a correctly-formed ticket? Define the mapping explicitly: audit severity to Jira priority, component, labels, and issue type. Include the finding's evidence and a link back to the source location. This mapping is a judgment artifact, not plumbing.
2. **Idempotency.** Re-running the audit must not create forty duplicate tickets. Use a deterministic fingerprint per finding (rule + file + symbol), store it in the OKF bundle and on the ticket, and on re-run: update the existing ticket, close it if resolved, create only genuinely new ones. This is the difference between a demo and something you would let near a real backlog.
3. **Human approval gate.** No one lets an agent write to their production Jira unreviewed. The Delivery Agent proposes a ticket set; a human approves, edits, or rejects; only approved items are created. Build the gate as a first-class step, not an afterthought. This single detail is the most FDE-shaped part of the project: it shows you understand enterprise trust boundaries.

**Auth and tenancy.** Authenticate into the customer's instance with least privilege: a scoped token, only the projects it needs, no admin. Document what permissions it requires and why. This connects directly to real prior experience with locked-down enterprise tenants and third-party auth restrictions.

**Delivery Agent master prompt:**

```
You are the Delivery Agent in an autonomous codebase intelligence system.

Inputs:
1. The synthesized, prioritized findings from the Synthesis Agent
2. The existing OKF knowledge bundle (contains fingerprints of previously-filed findings)
3. Jira project context (project key, issue types, priority scheme, components, available labels)

Your task: convert findings into a proposed Jira ticket set. Do NOT create anything yet.

For each finding:
1. Compute a stable fingerprint: {rule_id + file_path + symbol}. Check it against the OKF bundle.
   - Not present  -> propose CREATE
   - Present and finding persists -> propose UPDATE (add new evidence, adjust priority if changed)
   - Present but finding no longer detected -> propose CLOSE with a resolution note
2. Map severity to the project's scheme:
   - Critical -> highest priority, issue type Bug (security) or Task (architecture)
   - High -> high priority
   - Medium -> medium priority
   - Low -> lowest priority, labelled tech-debt
   Use ONLY components and labels that exist in the provided project context. Never invent a field value.
3. Compose each ticket:
   - Summary: one line, specific, no jargon. A reader must know the problem from the summary alone.
   - Description: what it is, where (file and line), why it matters in business terms, the evidence,
     the confidence level, and the recommended fix.
   - Include: effort estimate (S/M/L), risk of making the change, risk of NOT making it.
   - Assign/tag the relevant owner ONLY if provided in project context. Never guess an assignee.
4. Flag anything you are unsure about rather than filing it.

Output: a structured proposal (JSON) of CREATE / UPDATE / CLOSE actions with full ticket bodies,
plus a one-paragraph summary for the approver: how many of each, and the three most important.

HUMAN APPROVAL GATE: stop here. Wait for explicit approval. On approval, execute only the approved
actions via the Jira MCP, then write each created/updated ticket key and its fingerprint back into
the OKF bundle so the next run is idempotent.

Never write to Jira without approval. Never invent a field, component, assignee, or metric.
```

---

### Day 4–5 — Build the Case Study

**Honesty rule for this section:** every bracket below is a real value from your actual run, or the section does not ship. Do not fill a bracket with a plausible number. If the audit has not run, the project is labelled "In development" and these slots stay marked as pending. A fabricated finding is worse than an unfinished project, because it dies under one question in an interview.

```
# Case Study: Autonomous Codebase Intelligence

## The Scenario
Walked into [project name] — a [language] codebase with [X] files, [Y] lines of code,
active for [Z] years. No brief. No prior context. Treated it as a cold FDE engagement.

## The System
Multi-agent architecture with Fable 5 as orchestrator:
- 4 specialized audit sub-agents (2 running in parallel) + synthesis + delivery
- Ingestion and dependency graph: Understand Anything (OSS, reused, not rebuilt)
- Adaptive hybrid retrieval: dense + BM25 + graph traversal, routed by query type
- Persistent knowledge: OKF bundle, so re-runs update a living picture instead of starting cold
- Self-verification at synthesis stage
- Delivery: findings routed to Jira via MCP, idempotent, behind a human approval gate

## Build vs Buy
[State plainly what you reused and what you built, and why. This section is a feature, not a
disclaimer. It is the clearest senior signal in the whole case study.]

## What It Found
- [X] security vulnerabilities ([Y] critical)
- [X] architectural coupling issues
- [X] dead code files (estimated [Y]% of codebase)
- Top dependency risk: [specific finding]

## The Unasked Question
[Paste the actual Fable 5 output here verbatim]

## The Delivery
[N] findings proposed as tickets, [M] approved and filed into Jira, [K] rejected at the gate
and why. Re-run produced [0] duplicates.

## Time: Cold codebase to delivered, filed tickets in 48 hours
## Architecture diagram: [include diagram]
```

**FDE portfolio statement:** "I can walk into a codebase I've never seen and deliver a CTO-readable technical audit in 48 hours, with the findings filed as prioritized tickets in the team's own tracker. Here's the system I built to do it, and here's what I chose not to build."

---

## APPENDIX — Project 3B: Autonomous Incident Intelligence Agent (NOT SELECTED)

Kept for reference. Not the chosen build, for two reasons worth recording:

- It runs on **synthetic incident data you generate yourself**, then detects the patterns you planted. In an interview, "I detected a pattern I generated" is circular and collapses under one question. 3A audits a real public codebase and finds real problems.
- It is written for engineers living the microservices/incident problem daily. That is not your day-to-day, so you would be building on borrowed context, which shows under questioning.

**Worth stealing from it:** the framing "sees the pattern across incidents, flags the third one before it happens." If the 3A audit surfaces a recurring architectural risk, phrase the finding that way. Borrow the narrative, not the project.

<details>
<summary>Original 3B content (unchanged, for reference)</summary>

**For: Engineers working with microservices, event-driven systems, or high-availability infrastructure**

If you're living the microservices problem at work right now, you already know what real incident data looks like. You know the dependency chains. This project takes exactly what you're doing at work and turns it into a portfolio artifact.

**What it is:** A Fable 5-powered agent that watches microservice event streams, identifies recurring failure patterns (not individual incidents), predicts the next occurrence, and recommends whether the fix is a code change or an architectural change.

**Why this is FDE:** "I noticed that incident management tools treat every incident as unique. I built something that sees the pattern across incidents — and flags the third one before it happens."

### Step by Step

**Day 1 — Create Synthetic Incident Data**

```
Generate 90 days of microservice incident log data for a healthcare platform with these services:
- auth-service, patient-service, appointment-service, billing-service, notification-service

Include these realistic patterns:
- auth-service -> patient-service timeout: appears every 14 days (infrastructure restart cycle)
- billing-service failure during appointment-service high load: resource contention pattern
- notification-service queue overflow: gradual accumulation, resets when manually cleared
- One cascade failure in week 8: auth-service triggers patient-service triggers appointment-service

Format each incident:
{timestamp, service, severity, error_type, dependency_chain, resolution_time_min, resolved_by}
```

**Day 2–3 — Build the LangGraph Agent**

```
Using LangGraph, build an agent with these nodes:
1. IngestionNode: reads incident logs, normalizes format, stores in memory
2. PatternDetectionNode: identifies incidents that share: same service + same error_type,
   appearing more than 3 times, with intervals that suggest a cyclical cause
3. DependencyTraceNode: for each pattern, traces the full dependency chain to find
   the upstream root cause
4. ClassificationNode: classifies each pattern as:
   - "AI-fixable" (retry logic, timeout tuning, connection pooling)
   - "Architectural change required" (service coupling, resource contention, design flaw)
5. ReportNode: generates the weekly intelligence report

Use Fable 5 as the reasoning engine for nodes 2, 3, and 4.
Use standard Python logic for nodes 1 and 5.
```

```
Add a PredictionNode after PatternDetectionNode:

For each identified pattern, predict:
1. When is the next occurrence likely, based on the interval pattern?
2. What is the confidence level of this prediction?
3. What early warning signal should the team watch for in the 48 hours before predicted occurrence?

If confidence > 70%, generate a proactive alert:
"Pattern X is predicted to recur in ~N days. Watch for [early signal]. Recommended action now: [action]"
```

The alert before the incident is the FDE value. Incident management reacts. FDE anticipates.

**Day 3–4 — The Architectural Recommendation Sub-Agent**

```
For each pattern classified as "Architectural change required," spawn a sub-agent:

Sub-agent prompt:
"This failure pattern has recurred [N] times in 90 days: [pattern description].
The dependency chain is: [chain].
The current resolution is: [resolution].

Provide:
1. The specific architectural change that would prevent this pattern permanently
2. Estimated engineering effort (S/M/L)
3. Risk of making the change
4. Risk of NOT making the change over the next 90 days
5. Whether this can be implemented incrementally or requires a breaking change"
```

**Day 4–5 — Generate Real Output, Build Case Study**

Run against the synthetic data. The output should include:
- 3–4 identified patterns with full analysis
- 2 proactive alerts with predicted dates
- 1–2 architectural recommendations

</details>

---

## BUILD ORDER AND SCOPE GUARD

1. Install Understand Anything, run `/understand` on the target repo, confirm the graph is usable.
2. Validate the agent architecture with Fable 5 (Day 1 prompt, including the new question 5).
3. Build the audit fleet + synthesis. This is the core; it must work before anything else.
4. Add the OKF persistence layer and the adaptive retrieval routing.
5. Add the Jira delivery layer: mapping, then idempotency, then the approval gate.
6. Run against the real repo. Only then write the case study with real numbers.

**Scope guard:** if a layer will not fit the window, ship the layers below it and mark the rest "in development." A finished 3-layer system beats a half-built 5-layer one. Do not add a second connector, a second tracker, or an emailer. The story does not get better with more integrations; it gets weaker, because it signals you cannot scope.