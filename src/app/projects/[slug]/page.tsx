import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProject,
  getAllProjects,
  getProjectImages,
  splitSections,
} from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { SliderSpectra } from "@/components/ui/SliderSpectra";
import { SaarthiView } from "@/components/sections/SaarthiView";
import { ProductSection } from "@/components/sections/ProductSection";
import { TagChip } from "@/components/ui/TagChip";
import { SKILL_NODE } from "@/components/sections/AboutStrips";
import type { Metadata } from "next";

/** Case-insensitive skill → mind-map node resolution for stack tag chips. */
const SKILL_NODE_CI: Record<string, string> = Object.fromEntries(
  Object.entries(SKILL_NODE).map(([k, v]) => [k.toLowerCase(), v]),
);
function resolveNode(label: string): string | undefined {
  return SKILL_NODE_CI[label.toLowerCase()];
}

export function generateStaticParams() {
  // p.slug falls back to the file basename, so a project md with missing or
  // partial frontmatter can never crash the whole /projects/* tree again.
  return getAllProjects().map((p) => ({ slug: p.frontmatter.slug ?? p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "Project" };
  return {
    title: project.frontmatter.public_name ?? project.frontmatter.title,
    description: project.frontmatter.tagline,
  };
}

// Section titles that are internal authoring notes, never rendered (PRD 1.1).
const INTERNAL_SECTION = /nda framing|must hold|^framing\b/i;

const SYSTEM_DESIGN_SLUGS = new Set([
  "loop-copilot",
  "qe-platform",
  "hpe-rag-chatbot",
  "global-census-chatbot",
  "saarthi",
  "wealthos",
]);

// Confidentiality gate (PRD rule 3): screenshots only render for slugs whose
// images are confirmed scrubbed of client data. Empty until Niranjan confirms;
// Loop Copilot's dropped shots stay hidden (not scrubbed) until then.
const SCREENSHOTS_CLEARED = new Set<string>(["loop-copilot"]);

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const fm = project.frontmatter;
  const name = fm.public_name ?? fm.title;
  const images = SCREENSHOTS_CLEARED.has(slug) ? getProjectImages(slug) : [];
  const cards = splitSections(project.body)
    // hard gate: internal note titles AND any section still carrying a
    // TODO(niranjan) placeholder never reach production markup
    .filter((s) => !INTERNAL_SECTION.test(s.title) && !s.html.includes("TODO("))
    .map((s) => ({ title: `${name} · ${s.title}`, html: s.html }));

  return (
    <>
      <PageBackground variant="flow-wave" />
      <main className="relative mx-auto min-h-screen max-w-[1100px] px-4 pb-28 pt-24">
        <header className="mb-4">
          <Link
            href="/"
            className="mb-4 inline-block font-mono text-[13px] text-text-dim hover:text-green"
          >
            {"> cd ~"}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-3xl font-semibold tracking-tight text-white">
              {name}
            </h1>
            <span className="rounded border border-green/40 px-2 py-0.5 font-mono text-[11px] uppercase text-green">
              {fm.status?.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-text-dim">{fm.tagline}</p>
          {fm.metric && (
            <p className="mt-3 font-mono text-[13px] text-cyan">{fm.metric}</p>
          )}
          {fm.stack && fm.stack.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {/* FINAL_SHOWDOWN: every tag is clickable and deep-links the
                  matching mind-map node (zoomed on arrival); unmapped tags
                  still land on the graph, never a dead chip */}
              {fm.stack.map((s) => (
                <TagChip key={s} label={s} node={resolveNode(s) ?? ""} />
              ))}
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3">
            {fm.demo && fm.demo.startsWith("http") && (
              <ButtonLink href={fm.demo} target="_blank" rel="noopener noreferrer" variant="primary" size="sm">
                view_live ↗
              </ButtonLink>
            )}
            {SYSTEM_DESIGN_SLUGS.has(slug) && (
              <ButtonLink href={`/system-design#${slug}`} variant="outline" size="sm">
                system_design →
              </ButtonLink>
            )}
            <ButtonLink href="/map" variant="ghost" size="sm">
              see in mind map →
            </ButtonLink>
          </div>
        </header>

        {/* View · Slider Spectra coverflow, real screenshots ONLY. No boxed
            text placeholders (NOW_FIXES 2026-07-13): when a project has no
            cleared screenshots the narrative reads directly on the page below,
            not inside placeholder cards. Saarthi keeps its dedicated
            mobile/web view (PRD 13.4). */}
        {slug === "saarthi" && <SaarthiView />}
        {slug !== "saarthi" && images.length > 0 && (
          <section className="mb-4">
            <h2 className="mb-1 font-mono text-lg text-green">{"> view"}</h2>
            <SliderSpectra
              slides={images.map((img, i) => ({
                name: `${name} · screen ${i + 1}`,
                img,
              }))}
            />
          </section>
        )}

        <ProjectShowcase
          name={name}
          tagline={fm.tagline ?? ""}
          images={images}
          demo={fm.demo}
          cards={cards}
        />

        {/* Product-thinking cards: Saarthi, Loop Copilot, QE platform only */}
        <ProductSection slug={slug} />
      </main>
    </>
  );
}
