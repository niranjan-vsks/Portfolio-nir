import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getAllProjects } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { ButtonLink } from "@/components/ui/Button";
import { ProjectVisual } from "@/components/sections/ProjectVisual";
import type { Metadata } from "next";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.frontmatter.slug }));
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  const fm = project.frontmatter;

  // System-design page exists only for the two interactive write-ups.
  const hasSystemDesign = slug === "loop-copilot" || slug === "qe-platform";

  return (
    <main className="mx-auto min-h-screen max-w-[1100px] px-4 pb-24 pt-24">
      <header className="mb-8 border-b border-border pb-6">
        <Link
          href="/projects"
          className="mb-4 inline-block font-mono text-[13px] text-text-dim hover:text-green"
        >
          {`> cd ../projects`}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-semibold tracking-tight text-white">
            {fm.public_name ?? fm.title}
          </h1>
          <span className="rounded border border-green/40 px-2 py-0.5 font-mono text-[11px] uppercase text-green">
            {fm.status?.replace("_", " ")}
          </span>
        </div>
        <p className="mt-2 text-text-dim">{fm.tagline}</p>
        {fm.metric && (
          <p className="mt-3 font-mono text-[13px] text-cyan">{fm.metric}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          {fm.demo && fm.demo.startsWith("http") && (
            <ButtonLink
              href={fm.demo}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="sm"
            >
              view_live ↗
            </ButtonLink>
          )}
          {hasSystemDesign && (
            <ButtonLink href="/system-design" variant="outline" size="sm">
              system_design →
            </ButtonLink>
          )}
        </div>
      </header>

      <ProjectVisual visual={fm.signature_visual} slug={slug} />

      {fm.stack && fm.stack.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {fm.stack.map((s) => (
            <span
              key={s}
              className="rounded border border-border bg-surface px-2 py-1 font-mono text-[12px] text-text-dim"
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <Markdown html={project.html} className="max-w-3xl" />
    </main>
  );
}
