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
        <div className="max-w-3xl space-y-8">
          {sections.map((s) => (
            <section key={s.title}>
              <h2 className="mb-2 font-mono text-lg text-green">{`> ${s.title}`}</h2>
              <div
                className="prose-nir"
                dangerouslySetInnerHTML={{ __html: s.html }}
              />
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
