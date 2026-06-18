import Link from "next/link";
import { getAllProjects } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

const STATUS_COLOR: Record<string, string> = {
  live: "text-green border-green/40",
  production: "text-green border-green/40",
  piloted: "text-cyan border-cyan/40",
  in_development: "text-text-dim border-border",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  return (
    <PageShell eyebrow="all_projects" title="Projects">
      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) => {
          const fm = p.frontmatter;
          return (
            <Link
              key={fm.slug}
              href={`/projects/${fm.slug}`}
              className="group flex flex-col rounded-lg border border-border bg-surface/40 p-6 transition-colors hover:border-green/50"
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className={`rounded border px-2 py-0.5 font-mono text-[11px] uppercase ${
                    STATUS_COLOR[fm.status ?? ""] ?? "text-text-dim border-border"
                  }`}
                >
                  {fm.status?.replace("_", " ")}
                </span>
                <span className="font-mono text-[11px] text-text-dim">
                  {String(fm.order).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mb-1 font-mono text-lg text-white group-hover:text-green">
                {fm.public_name ?? fm.title}
              </h2>
              <p className="mb-4 text-sm text-text-dim">{fm.tagline}</p>
              {fm.metric && (
                <p className="mt-auto font-mono text-[12px] text-cyan">
                  {fm.metric}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
