import { PageShell } from "@/components/sections/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import type { Metadata } from "next";

// Optional, noindex (bullseye/09). Main profile stays FDE-pure; this is a
// quiet freelance landing for direct shares only.
export const metadata: Metadata = {
  title: "Work with me",
  robots: { index: false, follow: false },
};

export default function WorkWithMePage() {
  return (
    <PageShell eyebrow="work_with_me" title="Work with me">
      <div className="max-w-2xl space-y-6 text-text">
        <p>
          I take on a small number of focused engagements: agentic AI systems
          and production RAG, shipped into real enterprise environments end to
          end. Discovery, architecture, implementation, deployment.
        </p>
        <p className="text-text-dim">
          Best fit: teams that need someone to get into a real environment,
          understand the problem fast, and ship something that holds up in
          production. Remote-first, available to work with teams globally.
        </p>
        <div className="rounded-lg border border-border bg-surface/40 p-6">
          <h2 className="mb-3 font-mono text-green">{`> how engagements work`}</h2>
          <ul className="space-y-2 font-mono text-[13px] text-text-dim">
            <li>1. short scoping call to frame the problem and constraints</li>
            <li>2. a discovery pass against your real environment</li>
            <li>3. an architecture + delivery plan with clear milestones</li>
            <li>4. build, deploy, and validate with your users</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <ButtonLink
            href="mailto:niranjan.vsks@gmail.com?subject=Engagement%20inquiry"
            variant="primary"
            size="md"
          >
            start a conversation
          </ButtonLink>
          <ButtonLink
            href="/NiranjanVSKS_FDE.pdf"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="md"
          >
            ↓ résumé
          </ButtonLink>
        </div>
      </div>
    </PageShell>
  );
}
