import { getAllProjects } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { TerminalFlipCard } from "@/components/ui/TerminalFlipCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

/* AGain Fixes 2026-07-12: hub cards must be THE terminal flip card (PRD 12.1),
   grouped Work / Independent, not plain boxes. */

export default function ProjectsPage() {
  const projects = getAllProjects();
  const groups: [string, typeof projects][] = [
    ["independent", projects.filter((p) => p.frontmatter.group?.toLowerCase() !== "work")],
    ["work", projects.filter((p) => p.frontmatter.group?.toLowerCase() === "work")],
  ];

  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="all_projects" title="Projects">
        {groups.map(([label, list]) =>
          list.length === 0 ? null : (
            <section key={label} className="mb-12">
              <h2 className="mb-5 font-mono text-lg text-green">{`> ${label}`}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p, i) => {
                  const fm = p.frontmatter;
                  return (
                    <TerminalFlipCard
                      key={fm.slug ?? p.slug}
                      href={`/projects/${fm.slug ?? p.slug}`}
                      path={`${fm.slug ?? p.slug}.sh`}
                      name={fm.public_name ?? fm.title}
                      status={fm.status?.replace("_", " ")}
                      caption={fm.tagline ?? ""}
                      stat={fm.metric}
                      index={String(fm.order ?? i + 1).padStart(2, "0")}
                      stack={fm.stack ?? []}
                    />
                  );
                })}
              </div>
            </section>
          ),
        )}
      </PageShell>
    </>
  );
}
