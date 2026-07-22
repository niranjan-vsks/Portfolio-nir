import { PageShell } from "@/components/sections/PageShell";
import { SystemDesignClient } from "@/components/sections/SystemDesignClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Design",
  description:
    "Architectures I have shipped, with the requirements, capacity math, and tradeoffs behind them. One reference pattern, the rest as deployed.",
};

export default function SystemDesignPage() {
  return (
    <PageShell eyebrow="system_design" title="Architectures">
      <p className="mb-12 max-w-3xl text-[15px] leading-relaxed text-text-dim">
        The systems I have built, as I would walk them in a design review:
        interactive architecture diagrams plus the functional requirements,
        non-functional bars, capacity assumptions, and tradeoffs behind each
        one. Every diagram expands fullscreen on click. One section, the
        agentic QE platform, is shown as a genericized reference pattern
        (how I would build it, no client names); everything else is the
        architecture as deployed.
      </p>
      <SystemDesignClient />
    </PageShell>
  );
}
