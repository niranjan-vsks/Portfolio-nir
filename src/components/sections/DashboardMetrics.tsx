"use client";

import Link from "next/link";
import { CardSpotlight } from "@/components/ui/CardSpotlight";

/**
 * Dashboard metrics . Every number traces to real content (cited in
 * comments); no fabricated or client-tied figures (firewall). FDE-positioning
 * metrics that have no defensible number are simply omitted, not faked.
 */
interface Metric {
  value: string;
  label: string;
  sub: string;
  href?: string;
}

const METRICS: Metric[] = [
  { value: "7 yrs", label: "shipping into production", sub: "data science → GenAI → agentic AI", href: "/experience" }, // about.md
  { value: "3", label: "cloud platforms", sub: "AWS · Azure · GCP", href: "/forward-deployed/architecting-ai-solution" }, // qe-platform.md (customer-managed AWS/Azure/GCP)
  { value: "~85%", label: "CRM logging time cut", sub: "Loop Copilot · 4–6 min → ~45 sec", href: "/projects/loop-copilot" }, // loop-copilot.md metric
  { value: "85–90%", label: "manual QA effort reduced", sub: "agentic QE platform", href: "/system-design" }, // qe-platform.md
  { value: "15% → <5%", label: "hallucination rate", sub: "GraphRAG + entity normalization", href: "/system-design" }, // qe-platform.md
  { value: "17", label: "enterprise QE teams", sub: "at peak adoption", href: "/projects/qe-platform" }, // qe-platform.md (softened)
  { value: "5", label: "independent products", sub: "Loop Copilot · Saarthi · WealthOS · Agentic Codebase Intelligence · Operator OS", href: "/projects" },
  { value: "100%", label: "owned end to end", sub: "discovery → architecture → deploy", href: "/forward-deployed" }, // hero.md positioning
];

export function DashboardMetrics() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {METRICS.map((m) => {
        const inner = (
          <CardSpotlight className="h-full p-5">
            <div className="font-mono text-3xl font-semibold text-green">{m.value}</div>
            <div className="mt-2 font-mono text-[13px] text-white">{m.label}</div>
            <div className="mt-1 font-mono text-[11px] text-text-dim">{m.sub}</div>
            {m.href && (
              <div className="mt-3 font-mono text-[11px] text-cyan">{"> open"}</div>
            )}
          </CardSpotlight>
        );
        return m.href ? (
          <Link key={m.label} href={m.href} className="block h-full">
            {inner}
          </Link>
        ) : (
          <div key={m.label} className="h-full">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
