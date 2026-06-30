import type { Metadata } from "next";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";
import { DashboardMetrics } from "@/components/sections/DashboardMetrics";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "The signal at a glance: years shipping, cloud platforms, and the measurable impact of Niranjan's agentic AI and RAG work.",
};

export default function DashboardPage() {
  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="dashboard" title="The signal at a glance">
        <p className="mb-10 max-w-2xl text-text-dim">
          Every number here traces to a real project or engagement. No client-tied
          figures, no invented metrics.
        </p>
        <DashboardMetrics />
      </PageShell>
    </>
  );
}
