# 07 — CONTENT MODEL & RAG SOURCE

Single source of truth: `portfolio-assets/content/`. The site renders from these files AND the chatbot embeds them. Edit markdown = update both.

## Structure
```
portfolio-assets/content/
  hero.md                 # terminal intro lines, entry labels, tagline
  about.md                # bio, 7-year arc, employer anchors
  skills.md               # grouped skills (Agentic AI, Engineering, Enterprise, ML)
  contact.md              # contact info, availability line
  projects/
    loop-copilot.md
    saarthi.md
    rebalancer.md
    qe-platform.md
  experience/
    coforge.md
    hpe.md
    mphasis.md
  system-design/
    loop-copilot.md        # interactive diagram content + rationale
    qe-platform.md         # genericized reference architecture content
  interview/
    persona.md             # voice, tone, how Niranjan speaks (FIRST PERSON)
    decisions-and-tradeoffs.md
    war-stories.md
    faq.md                 # common recruiter/interview questions + his answers
```

## File format
Frontmatter + markdown body:
```md
---
title: Loop Copilot
slug: loop-copilot
status: piloted
stack: [React 19, FastAPI, MongoDB Atlas, Groq/Llama, Railway]
metric: "CRM logging 4-6 min → ~45 sec (~85%)"
order: 1
---
Body markdown (problem, approach, outcome) ...
```

## Loader (`src/lib/content.ts`)
- Parse frontmatter + markdown (gray-matter + a markdown renderer).
- Expose typed getters: `getProject(slug)`, `getAllProjects()`, `getSection(name)`, `getExperience(slug)`, `getInterviewCorpus()`.
- Pages render from these. No page copy hardcoded in components.

## RAG ingestion (feeds `08`)
- The same files are chunked + embedded into the pgvector store.
- `interview/` files are the highest-value retrieval source for the chatbot persona. They carry Niranjan's actual voice and reasoning.

## On you, Niranjan (cannot be automated)
`interview/*` requires your authentic first-person content: how you talk, your real decision rationale, "tell me about a time" stories, opinions, the tradeoffs you actually made. Claude can scaffold the files and headings, but it must NOT invent your voice or stories. Where missing, it leaves `TODO(niranjan)` and the chatbot answers only from what exists. Thin interview content = a generic bot. This is the one input only you can supply.
