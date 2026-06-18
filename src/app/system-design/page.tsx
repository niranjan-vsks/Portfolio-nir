import { PageShell } from "@/components/sections/PageShell";
import { SystemDesignClient } from "@/components/sections/SystemDesignClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Design",
  description:
    "Reference architectures: how I would build systems like these. Pattern-level diagrams using industry-standard primitives.",
};

export default function SystemDesignPage() {
  return (
    <PageShell eyebrow="system_design" title="Reference Architectures">
      <p className="mb-12 max-w-3xl text-text-dim">
        How I would build systems like these. Pattern-level diagrams using
        industry-standard primitives (Docker, message queues, vector stores,
        graph databases, secrets managers). No proprietary names. These are
        reference patterns reachable from each project, framed as how I would
        build, not internal disclosures of any deployed system.
      </p>
      <SystemDesignClient />
    </PageShell>
  );
}
