import type { Metadata } from "next";
import Link from "next/link";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";

// Scaffolded now, hidden from nav + Home hub until content exists (lock #3).
// noindex so the thin page is never surfaced to a recruiter via search.
export const metadata: Metadata = {
  title: "AI Labs",
  robots: { index: false, follow: false },
};

const OPTIMIZATION = [
  { area: "Token", note: "context budgets, compression, per-tenant tuning" },
  { area: "Cost / Cloud", note: "inference cost telemetry, model routing" },
  { area: "Performance", note: "async throughput, caching, latency paths" },
  { area: "Scalability", note: "multi-tenant, multi-cloud, RBAC at scale" },
];

export default function AiLabsPage() {
  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <PageShell eyebrow="ai_labs" title="AI Labs">
        <p className="max-w-2xl text-text-dim">
          How I work with agents, LLMOps, and optimization. Full write-ups land
          here as I publish them.
        </p>

        <h2 className="mb-4 mt-10 font-mono text-sm text-green">{"> optimization"}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {OPTIMIZATION.map((o) => (
            <Link
              key={o.area}
              href="/system-design"
              className="group rounded-lg border border-green/20 bg-surface/60 p-5 backdrop-blur-sm transition-colors hover:border-green/55"
            >
              <div className="font-mono text-[15px] text-white group-hover:text-green">
                {o.area}
              </div>
              <div className="mt-1 font-mono text-[12px] text-text-dim">{o.note}</div>
            </Link>
          ))}
        </div>
      </PageShell>
    </>
  );
}
