"use client";

import dynamic from "next/dynamic";
import {
  loopCopilotNodes,
  loopCopilotEdges,
  qeNodes,
  qeEdges,
  saarthiMermaid,
  rebalancerMermaid,
} from "@/components/sections/systemDesignData";
import { useRouter } from "next/navigation";
import { Mermaid } from "@/components/sections/Mermaid";
import { TerminalLoader } from "@/components/ui/TerminalLoader";
import { MovingBorderButton } from "@/components/ui/MovingBorderButton";

const FlowDiagram = dynamic(
  () =>
    import("@/components/sections/FlowDiagram").then((m) => m.FlowDiagram),
  { ssr: false, loading: () => <TerminalLoader label="loading_diagram" /> },
);

// Tag chips route to the Mind Map (PRD 6.7). Moving-border + hover lift.
function TagChips({ tags }: { tags: string[] }) {
  const router = useRouter();
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tags.map((t) => (
        <MovingBorderButton key={t} onClick={() => router.push("/map")}>
          {t}
        </MovingBorderButton>
      ))}
    </div>
  );
}

function Section({
  id,
  index,
  title,
  badge,
  children,
}: {
  id: string;
  index: string;
  title: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-baseline gap-3">
        <span className="font-mono text-[13px] text-text-dim">{index}</span>
        <h2 className="font-mono text-xl text-white">{title}</h2>
        <span className="rounded border border-cyan/40 px-2 py-0.5 font-mono text-[11px] text-cyan">
          {badge}
        </span>
      </div>
      {children}
    </section>
  );
}

export function SystemDesignClient() {
  return (
    <div className="space-y-16">
      <Section
        id="loop-copilot"
        index="01"
        title="Loop Copilot"
        badge="interactive · how I would build it"
      >
        <p className="mb-4 max-w-3xl text-sm text-text-dim">
          Event sourcing over vector RAG for chat context, and a three-tier
          integration shell that lives within the customer&apos;s tenant trust
          model. Toggle planes; hover any node for the rationale.
        </p>
        <TagChips tags={["event sourcing", "tenant trust model", "async API", "multi-CRM shell"]} />
        <FlowDiagram nodes={loopCopilotNodes} edges={loopCopilotEdges} height={500} />
      </Section>

      <Section
        id="qe-platform"
        index="02"
        title="Agentic Quality Engineering (reference architecture)"
        badge="interactive · reference pattern"
      >
        <p className="mb-4 max-w-3xl text-sm text-text-dim">
          A genericized agentic QE platform: GraphRAG plus agentic retrieval,
          generation through a tool server, an audit-defensible eval layer, and
          one platform beaming into multiple managed clouds (A/B/C). Generic
          primitives only, no proprietary or client names.
        </p>
        <TagChips tags={["GraphRAG", "agentic RAG", "reranking", "LLM observability", "tenant-aware RBAC"]} />
        <FlowDiagram nodes={qeNodes} edges={qeEdges} height={560} />
      </Section>

      <Section id="saarthi" index="03" title="Voice-First Financial Copilot" badge="static">
        <p className="mb-4 max-w-3xl text-sm text-text-dim">
          Voice as the interaction layer atop a modular orchestrator routing to
          specialized agents, with a compliance posture built from a curated
          knowledge base, guardrails, server-side governance, and consent-first
          data (a multi-layer compliance architecture, not model adjustment).
        </p>
        <Mermaid chart={saarthiMermaid} />
      </Section>

      <Section id="rebalancer" index="04" title="Portfolio Rebalancing Agent" badge="static">
        <p className="mb-4 max-w-3xl text-sm text-text-dim">
          LLM for synthesis and explanation, deterministic Python for guardrails
          and execution, the agentic layer where they meet. Surfaces
          recommendations; it does not execute trades.
        </p>
        <Mermaid chart={rebalancerMermaid} />
      </Section>
    </div>
  );
}
