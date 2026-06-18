import { getSection, getAllExperience } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/sections/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  const about = getSection("about");
  const experience = getAllExperience();

  return (
    <PageShell eyebrow="about" title="Niranjan VSKS">
      {about && <Markdown html={about.html} className="max-w-3xl" />}

      <section className="mt-16">
        <h2 className="mb-6 font-mono text-xl text-green">{`> experience`}</h2>
        <div className="space-y-8">
          {experience.map((exp) => (
            <article
              key={exp.slug}
              id={exp.slug}
              className="scroll-mt-20 rounded-lg border border-border bg-surface/40 p-6"
            >
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-mono text-lg text-white">
                  {exp.frontmatter.employer}
                </h3>
                <span className="font-mono text-[13px] text-violet">
                  {exp.frontmatter.tenure as string}
                </span>
              </div>
              <p className="mb-4 font-mono text-[13px] text-text-dim">
                {exp.frontmatter.title} · {exp.frontmatter.location as string}
              </p>
              <Markdown html={exp.html} />
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
