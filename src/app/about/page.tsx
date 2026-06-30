import Link from "next/link";
import type { Metadata } from "next";
import { getSection, getAllExperience, splitSections } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { TerminalCard } from "@/components/ui/TerminalCard";

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

  const expCards = experience.map((e) => {
    const fm = e.frontmatter;
    const title = `${(fm.employer as string) ?? ""} · ${(fm.title as string) ?? ""}`;
    return { title: title.toUpperCase(), html: e.html };
  });

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

        {/* Experience · terminal flip cards */}
        <section id="experience" className="mt-16 scroll-mt-20">
          <h2 className="mb-5 font-mono text-xl text-green">{"> experience"}</h2>
          <div className="max-w-3xl">
            {expCards.length > 0 && <TerminalCard cards={expCards} />}
          </div>
        </section>

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
