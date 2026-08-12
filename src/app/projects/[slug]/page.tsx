import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProject,
  getAllProjects,
  getProjectImages,
  getSaarthiWireframes,
  splitSections,
} from "@/lib/content";
import { ButtonLink } from "@/components/ui/Button";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { ProjectShowcase } from "@/components/sections/ProjectShowcase";
import { SliderSpectra } from "@/components/ui/SliderSpectra";
import { SaarthiView } from "@/components/sections/SaarthiView";
import { ProductSection } from "@/components/sections/ProductSection";
import { MacBookScroll } from "@/components/ui/MacBookScroll";
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

// Section titles that are internal authoring notes, never rendered .
const INTERNAL_SECTION = /nda framing|must hold|^framing\b/i;

const SYSTEM_DESIGN_SLUGS = new Set([
  "loop-copilot",
  "qe-platform",
  "hpe-rag-chatbot",
  "global-census-chatbot",
  "saarthi",
  "wealthos",
  "codebase-intelligence-system",
  "operator-os",
]);

/** Projects with a rendered demo reel, shown in the MacBook frame above the fold. */
const DEMO_VIDEOS: Record<string, string> = {
  "codebase-intelligence-system": "/videos/codebase-intelligence-demo.mp4",
  "qe-platform": "/videos/qe-platform-demo.mp4",
};

// Confidentiality gate : screenshots only render for slugs whose
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
              {/* : every tag is clickable and deep-links the
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

        {DEMO_VIDEOS[slug] && (
          <section className="mb-4">
            <h2 className="mb-1 font-mono text-lg text-green">{"> demo"}</h2>
            <MacBookScroll>
              <video
                src={DEMO_VIDEOS[slug]}
                autoPlay
                loop
                muted
                playsInline
                className="h-full w-full object-cover"
              />
            </MacBookScroll>
          </section>
        )}

        {/* View · Slider Spectra coverflow, real screenshots ONLY. No boxed
            text placeholders : when a project has no
            cleared screenshots the narrative reads directly on the page below,
            not inside placeholder cards. Saarthi keeps its dedicated
            mobile/web view . */}
        {slug === "saarthi" && <SaarthiView screens={getSaarthiWireframes()} />}
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

        {/* Designed results-pending block: an intentional slot, not an empty
            hole. Upgrades to real numbers with zero rework once they land. */}
        {fm.results_pending && (
          <section className="mt-16 max-w-3xl">
            <h2 className="mb-4 font-mono text-xl text-green">{"> audit results"}</h2>
            <div className="relative overflow-hidden rounded-xl border border-green/25 bg-surface/60 p-8 backdrop-blur-sm">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-green/10 blur-3xl"
              />
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green/70" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green" />
                </span>
                <span className="font-mono text-[13px] uppercase tracking-wider text-green">
                  audit results publishing shortly
                </span>
              </div>
              <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-neutral-300">
                The system is live. A full audit run against a real open-source
                codebase is being finalized: the security, architecture, and
                dead-code findings, the reconciled priority list, the one
                non-obvious inference the team cannot see from inside, and the
                tickets filed into Jira behind the approval gate. Every number
                here will be a measured result from that run, not an estimate.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  "Findings by severity: critical / high / medium / low",
                  "The unasked question: the highest-leverage non-obvious risk",
                  "Tickets proposed, approved at the gate, and filed",
                  "Re-run reconciliation: updated, closed, zero duplicates",
                ].map((label) => (
                  <div
                    key={label}
                    className="rounded-lg border border-border/70 bg-bg/40 px-4 py-3 font-mono text-[12.5px] text-text-dim"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Product-thinking cards: Saarthi, Loop Copilot, QE platform only */}
        <ProductSection slug={slug} />
      </main>
    </>
  );
}
