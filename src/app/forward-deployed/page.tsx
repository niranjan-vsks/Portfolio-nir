import type { Metadata } from "next";
import Link from "next/link";
import { getAllFdeSections, getSection } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { TerminalFlipCard } from "@/components/ui/TerminalFlipCard";

export const metadata: Metadata = {
  title: "Forward Deployed Engineering",
  description:
    "What forward deployed work actually looks like: architecture, production RAG, optimization, observability, and LLMOps inside customer environments.",
};

export default function ForwardDeployedPage() {
  const sections = getAllFdeSections();
  const fde = getSection("fde");
  const intro = fde ? fde.body.split(/^##\s/m)[0].trim() : "";

  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="forward_deployed" title="Forward Deployed Engineering">
        {intro && (
          <p className="max-w-3xl text-[15.5px] leading-relaxed text-neutral-300">{intro}</p>
        )}
        <p className="mt-3 max-w-3xl text-[14px] text-text-dim">
          Eight capabilities, each with the techniques used and the systems they
          shipped in. Hover a card to flip it; click to go deep. Full track
          record on the{" "}
          <Link href="/experience" className="text-green underline decoration-dotted underline-offset-2 hover:text-green/80">
            experience page
          </Link>
          .
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s, i) => (
            <TerminalFlipCard
              key={s.slug}
              href={`/forward-deployed/${s.frontmatter.slug}`}
              path={`fde/${s.frontmatter.slug}.sh`}
              name={s.frontmatter.title}
              caption={s.frontmatter.caption ?? ""}
              backCaption={s.frontmatter.back}
              index={String(i + 1).padStart(2, "0")}
              stack={(s.frontmatter.tags ?? []).slice(0, 4).map((t) => t.label)}
            />
          ))}
        </div>
      </PageShell>
    </>
  );
}
