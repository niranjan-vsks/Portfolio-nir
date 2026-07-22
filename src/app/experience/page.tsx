import type { Metadata } from "next";
import { getSection, getAllExperience } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { Wikify } from "@/components/ui/Wikify";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Seven years across data science, GenAI, and agentic AI, with an explicit Forward Deployed Engineering track record.",
};

/** Split a plain-prose block into paragraphs / bullet lines for Wikify. */
function lines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.replace(/^-\s*/, "").trim())
    .filter(Boolean);
}

export default function ExperiencePage() {
  const fde = getSection("fde");
  const experience = getAllExperience();
  const parts = fde ? fde.body.split(/^##\s+/m) : [""];
  const fdeIntro = parts[0].trim();
  const fdeSections = parts.slice(1).map((p) => {
    const nl = p.indexOf("\n");
    return { title: p.slice(0, nl).trim(), body: p.slice(nl + 1) };
  });
  const tags = ((fde?.frontmatter.tags as string[]) ?? []).filter(Boolean);

  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="experience" title="Where I've shipped">
        {/* Forward Deployed Engineering */}
        <section id="fde" className="scroll-mt-20">
          <h2 className="mb-3 font-mono text-xl text-green">
            {"> forward deployed engineering"}
          </h2>
          {fdeIntro && (
            <p className="max-w-3xl text-[15.5px] leading-relaxed text-neutral-300">
              <Wikify text={fdeIntro} />
            </p>
          )}
          {tags.length > 0 && (
            <div className="mt-4 flex max-w-3xl flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-green/30 bg-green/5 px-3 py-1 font-mono text-[12px] text-green"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-8 grid max-w-5xl gap-6 md:grid-cols-2">
            {fdeSections.map((s) => {
              return (
                <div
                  key={s.title}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur-sm"
                >
                  <h3 className="mb-3 font-mono text-[14px] font-semibold text-white">
                    <span className="text-green">$</span> {s.title.toLowerCase()}
                  </h3>
                  <ul className="space-y-2.5">
                    {lines(s.body).map((b, j) => (
                      <li
                        key={j}
                        className="flex gap-2 text-[14px] leading-relaxed text-neutral-300"
                      >
                        <span className="mt-[2px] shrink-0 text-green">▸</span>
                        <span>
                          <Wikify text={b} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Employer timeline */}
        <section className="mt-20">
          <h2 className="mb-8 font-mono text-xl text-green">{"> timeline"}</h2>
          <div className="space-y-12">
            {experience.map((e) => {
              const fm = e.frontmatter;
              const slug = (fm.slug as string) ?? e.slug;
              return (
                <article
                  key={slug}
                  id={slug}
                  className="max-w-3xl scroll-mt-24 border-l-2 border-green/30 pl-6"
                >
                  <header className="mb-3">
                    <h3 className="text-lg font-semibold text-white">
                      {fm.employer as string}
                    </h3>
                    <p className="font-mono text-[13px] text-green">
                      {fm.title as string}
                    </p>
                    <p className="mt-0.5 font-mono text-[12px] text-neutral-500">
                      {(fm.tenure as string) ?? ""}
                      {fm.location ? ` · ${fm.location as string}` : ""}
                    </p>
                  </header>
                  <div className="space-y-3">
                    {lines(e.body).map((p, i) => (
                      <p
                        key={i}
                        className="text-[14.5px] leading-relaxed text-neutral-300"
                      >
                        <Wikify text={p} />
                      </p>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </PageShell>
    </>
  );
}
