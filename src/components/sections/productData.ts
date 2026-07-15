/**
 * Product-thinking sections (FINAL_SHOWDOWN): terminal-style cards per project
 * for Saarthi, Loop Copilot and the QE platform ONLY (not HPE / Mphasis work).
 * Saarthi traces to Niranjan's BITSoM PRD (PS3, in portfolio-assets); the
 * other two are derived from the shipped products' real scope. Kept lean on
 * purpose: this is an FDE portfolio with product judgment, not a PM portfolio.
 */

export interface ProductCard {
  title: string; // terminal card title, e.g. "jtbd.md"
  heading: string;
  rows: { label: string; body: string }[];
}

export interface ProductSpec {
  intro: string;
  cards: ProductCard[];
}

export const PRODUCT_SECTIONS: Record<string, ProductSpec> = {
  saarthi: {
    intro:
      "Saarthi was built product-first: a full discovery, framing, and prioritization pass (JTBD, RICE, MoSCoW, SWOT, value proposition) before a line of the agentic stack was written. It shipped past prototype into a pilot-ready production app.",
    cards: [
      {
        title: "jtbd.md",
        heading: "Jobs To Be Done",
        rows: [
          {
            label: "Core job",
            body: "When my income is irregular, I want simple, trustworthy financial tools that help me manage daily cash, handle emergencies, and feel secure, so I can focus on earning more.",
          },
          {
            label: "Functional",
            body: "Stabilise cash flow, access money in mid-cycle shortfalls, build emergency protection, understand finances in my own language.",
          },
          {
            label: "Emotional / social",
            body: "Feel in control instead of anxious; be seen as a responsible provider; avoid the stigma of dependence on informal lenders.",
          },
        ],
      },
      {
        title: "value_prop.md",
        heading: "Value Proposition",
        rows: [
          {
            label: "One-liner",
            body: "A trusted AI financial companion that guides people with irregular income to make safe, confident money decisions, one small step at a time.",
          },
          {
            label: "Root pain",
            body: "Decision anxiety from uncertainty and mistrust: it drives avoided savings, bad loans, and staying outside formal finance.",
          },
          {
            label: "Positioning",
            body: "Confidence + action, not information. Voice-first, vernacular (Telugu / Hindi / Hinglish), guidance-only, and non-transactional by design.",
          },
        ],
      },
      {
        title: "prioritization.md",
        heading: "RICE + MoSCoW",
        rows: [
          {
            label: "RICE winners",
            body: "Stars habit progression and the Available Cash view (1.44), My Money daily check-in (1.19), vernacular voice copilot (0.89). Habit mechanics outranked transactional features.",
          },
          {
            label: "Must have",
            body: "Daily cash visibility + voice check-ins, vernacular AI copilot, emergency awareness (savings + insurance education), consent-safe trust layer, Coins & Stars.",
          },
          {
            label: "Won't have",
            body: "Coins for loans or investments, credit-score nudges, gamified urgency, leaderboards, cashback, mandatory data consent. Trust is the product; nothing exploitative ships.",
          },
        ],
      },
      {
        title: "swot.md",
        heading: "SWOT",
        rows: [
          {
            label: "Strengths",
            body: "Vernacular voice-first UX; clean split of Stars = habit and trust, Coins = clarity and decisiveness; core features always free.",
          },
          {
            label: "Weaknesses / threats",
            body: "No instant cash gratification, slower perceived value; loan apps offering instant rewards; users misreading Stars as a credit score.",
          },
          {
            label: "Opportunities",
            body: "Gamified habits for low-literacy users, reassurance-first design for women riders, high retention potential through Stars.",
          },
        ],
      },
      {
        title: "success_metrics.md",
        heading: "Success Metrics (design targets)",
        rows: [
          {
            label: "Activation",
            body: "≥80% complete onboarding plus first AI interaction on day 1; time-to-first-value under 3 minutes; ≥70% engage with vernacular voice within 30 days.",
          },
          {
            label: "Habit / retention",
            body: "2 to 4 sessions per user per week; D7 retention ≥70%, D30 ≥40%, cohorts segmented by star tier.",
          },
          {
            label: "Outcome",
            body: "≥50% of active users take at least one positive financial action in 30 days; ≥25% build a Rs.5k emergency buffer within 3 months; AI misguidance rate <0.5%.",
          },
        ],
      },
    ],
  },

  "loop-copilot": {
    intro:
      "Loop Copilot's product framing came from the field: seller-side workflow pain observed directly in enterprise CRM operations, prioritized around the moments where reps lose deals to slow context, not around feature volume.",
    cards: [
      {
        title: "jtbd.md",
        heading: "Jobs To Be Done",
        rows: [
          {
            label: "Core job",
            body: "When I am preparing for or sitting in a customer conversation, I want the full account context and the next best action surfaced instantly, so I never stall a deal because the system was slower than the customer.",
          },
          {
            label: "Functional",
            body: "Retrieve account and pipeline context across CRM objects, draft follow-ups, schedule and log actions without leaving the flow of work.",
          },
          {
            label: "Emotional",
            body: "Walk into every conversation feeling prepared; trust that what the copilot says is grounded in the CRM record, not invented.",
          },
        ],
      },
      {
        title: "prioritization.md",
        heading: "Prioritization",
        rows: [
          {
            label: "Must have",
            body: "Grounded retrieval over CRM data with tenant isolation, action execution with confirmation gates, enterprise SSO, and full auditability. Non-negotiable for a system that touches seller data.",
          },
          {
            label: "Should have",
            body: "Proactive nudges (stalled deals, upcoming renewals), multi-language support, and voice input, sequenced after trust in core answers was proven.",
          },
          {
            label: "Won't have",
            body: "Autonomous writes without human confirmation, cross-tenant learning, or any answer path that bypasses the guardrail layer.",
          },
        ],
      },
      {
        title: "success_metrics.md",
        heading: "Success Metrics",
        rows: [
          {
            label: "Adoption",
            body: "Weekly active sellers and repeat usage rate: a copilot that reps return to unprompted is the only real signal.",
          },
          {
            label: "Quality",
            body: "Grounded-answer rate measured by evaluation loops, escalation-to-human rate, and time-to-context versus manual CRM navigation.",
          },
          {
            label: "Scale target",
            body: "Live in production for 20+ users, built to handle 150 concurrent today on Azure with Key Vault, Entra ID, Service Bus, and Redis in the serving path, and designed to scale horizontally.",
          },
        ],
      },
      {
        title: "tradeoffs.md",
        heading: "Key Product Tradeoffs",
        rows: [
          {
            label: "Trust over speed",
            body: "Every write action is confirmation-gated even though it costs a click: seller trust in an enterprise tool is unrecoverable once lost.",
          },
          {
            label: "Depth over breadth",
            body: "Fewer CRM surfaces covered deeply (accounts, opportunities, activities) rather than shallow coverage of every object type.",
          },
        ],
      },
    ],
  },

  "qe-platform": {
    intro:
      "The QE platform was scoped as a product, not a tool: the buyer is a QA leader accountable for release velocity, the user is a test engineer, and every capability had to move one of two numbers: escaped defects or cycle time.",
    cards: [
      {
        title: "jtbd.md",
        heading: "Jobs To Be Done",
        rows: [
          {
            label: "Core job",
            body: "When my team ships weekly across many apps, I want test design, generation, and triage to keep pace with development, so quality stops being the bottleneck in the release train.",
          },
          {
            label: "Functional",
            body: "Generate and maintain test assets from requirements, triage failures with context, and surface risk before release sign-off.",
          },
          {
            label: "Organizational",
            body: "Give QA leadership a defensible quality signal per release without manual report assembly.",
          },
        ],
      },
      {
        title: "prioritization.md",
        heading: "Prioritization",
        rows: [
          {
            label: "Must have",
            body: "Agentic test generation grounded in real requirements, failure triage with evidence, multi-tenant isolation, and cloud-portable deployment (AWS, Azure, GCP).",
          },
          {
            label: "Should have",
            body: "Self-healing selectors, flakiness detection, and coverage-gap analysis, each added only after the generation loop held up in real teams.",
          },
          {
            label: "Won't have",
            body: "Fully autonomous release decisions: the platform recommends, humans sign off. Quality accountability stays with people.",
          },
        ],
      },
      {
        title: "success_metrics.md",
        heading: "Success Metrics",
        rows: [
          {
            label: "Adoption",
            body: "17 enterprise QA teams on the platform at peak: adoption by teams who could have said no is the strongest product signal.",
          },
          {
            label: "Quality of AI",
            body: "Hallucination in generated assets driven from roughly 15% down to under 5% through GraphRAG grounding and evaluation loops.",
          },
          {
            label: "Efficiency",
            body: "Cycle-time reduction on test design and triage, and token/cost per generated asset tracked per tenant.",
          },
        ],
      },
      {
        title: "swot.md",
        heading: "SWOT",
        rows: [
          {
            label: "Strengths",
            body: "GraphRAG-grounded generation, three-cloud portability from one codebase, per-tenant identity and isolation.",
          },
          {
            label: "Weaknesses / threats",
            body: "Generated-asset trust must be re-earned per team; incumbent test-management vendors bundling 'AI features' into existing contracts.",
          },
          {
            label: "Opportunities",
            body: "Evaluation-as-a-feature: exposing the grounding and eval evidence that enterprise QA buyers increasingly demand.",
          },
        ],
      },
    ],
  },
};
