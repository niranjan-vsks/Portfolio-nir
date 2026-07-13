import Link from "next/link";
import type { Metadata } from "next";
import { getSection, getAllExperience, splitSections } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { AboutStrips } from "@/components/sections/AboutStrips";

export const metadata: Metadata = {
  title: "About",
  description:
    "Niranjan VSKS · seven years across data science, GenAI, and agentic AI, shipping into enterprise environments end to end.",
};

export default function AboutPage() {
  const about = getSection("about");
  const experience = getAllExperience();

  const sections = about
    ? splitSections(about.body).filter((s) => !/credentials/i.test(s.title))
    : [];

  const expStrip = experience.map((e) => ({
    employer: (e.frontmatter.employer as string) ?? "",
    title: (e.frontmatter.title as string) ?? "",
    tenure: (e.frontmatter.tenure as string) ?? "",
    slug: (e.frontmatter.slug as string) ?? e.slug,
  }));

  // skills marquee items straight from skills.md (group per H2 heading)
  const skillsDoc = getSection("skills");
  const skillItems: { label: string; group: string }[] = [];
  if (skillsDoc) {
    for (const s of splitSections(skillsDoc.body)) {
      const text = s.html.replace(/<[^>]+>/g, "");
      for (const label of text.split("·").map((t) => t.trim()).filter(Boolean)) {
        skillItems.push({ label, group: s.title });
      }
    }
  }

  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <PageShell eyebrow="about" title="Niranjan VSKS">
        {/* Bio */}
        <div className="max-w-3xl space-y-10">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-3 font-mono text-xl text-green">{`> ${s.title}`}</h2>
              <div
                className="prose-nir text-[17px] leading-[1.75] text-neutral-300 [&_li]:text-[16.5px] [&_p]:text-[17px]"
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
              {/* AGain Fixes: "Why FDE" gets real data + a path to the proof */}
              {/^why fde/i.test(s.title) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    { v: "17", l: "enterprise QA teams", s: "one platform, at peak adoption" },
                    { v: "3", l: "Deployed Across 3 Cloud Service Providers", s: "AWS · Azure · GCP, one codebase, per-tenant identity" },
                    { v: "15% → <5%", l: "hallucination", s: "GraphRAG + evaluation loops" },
                  ].map((c) => (
                    <div key={c.l} className="rounded-xl border border-green/20 bg-surface/60 p-4">
                      <div className="font-mono text-2xl font-semibold text-green">{c.v}</div>
                      <div className="mt-1 font-mono text-[13px] text-white">{c.l}</div>
                      <div className="mt-0.5 text-[12.5px] text-text-dim">{c.s}</div>
                    </div>
                  ))}
                  <div className="sm:col-span-3 flex justify-end">
                    <Link
                      href="/forward-deployed"
                      className="rounded-lg border border-green/50 bg-green/10 px-5 py-2.5 font-mono text-[15px] font-medium text-green shadow-[0_0_20px_rgba(74,222,128,0.15)] transition-colors hover:bg-green hover:text-bg"
                    >
                      See the full FDE track record →
                    </Link>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Experience strip + skills marquee (Infinite Moving Cards, PRD 11.2) */}
        <AboutStrips experience={expStrip} skills={skillItems} />

        {/* Credentials */}
        <section className="mt-16">
          <h2 className="mb-5 font-mono text-xl text-green">{"> credentials"}</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/certifications"
              className="rounded border border-green/40 px-4 py-2 font-mono text-[13px] text-green transition-colors hover:bg-green hover:text-bg"
            >
              certifications →
            </Link>
            <Link
              href="/education"
              className="rounded border border-green/40 px-4 py-2 font-mono text-[13px] text-green transition-colors hover:bg-green hover:text-bg"
            >
              education →
            </Link>
          </div>
        </section>
      </PageShell>
    </>
  );
}
