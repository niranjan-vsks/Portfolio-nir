import type { Metadata } from "next";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";
import { DashboardMetrics } from "@/components/sections/DashboardMetrics";
import { DashboardExplorer } from "@/components/sections/DashboardExplorer";
import { SKILL_NODE } from "@/components/sections/AboutStrips";
import { getSection, getAllProjects, splitSections } from "@/lib/content";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "The signal at a glance: years shipping, cloud platforms, and the measurable impact of Niranjan's agentic AI and RAG work.",
};

export default function DashboardPage() {
  // skills from skills.md (same source as the About marquee), grouped per H2
  const skillsDoc = getSection("skills");
  const skills: { label: string; group: string; node?: string }[] = [];
  if (skillsDoc) {
    for (const s of splitSections(skillsDoc.body)) {
      const text = s.html.replace(/<[^>]+>/g, "");
      for (const label of text.split("·").map((t) => t.trim()).filter(Boolean)) {
        skills.push({ label, group: s.title, node: SKILL_NODE[label] });
      }
    }
  }

  const projects = getAllProjects().map((p) => ({
    name: p.frontmatter.public_name ?? p.frontmatter.title,
    slug: p.frontmatter.slug ?? p.slug,
    status: (p.frontmatter.status ?? "in_development").toLowerCase(),
    tagline: p.frontmatter.tagline ?? "",
  }));

  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="dashboard" title="The signal at a glance">
        <p className="mb-10 max-w-2xl text-text-dim">
          Every number here traces to a real project or engagement. No client-tied
          figures, no invented metrics. Every card routes somewhere real.
        </p>
        <DashboardMetrics />
        <DashboardExplorer skills={skills} projects={projects} />
      </PageShell>
    </>
  );
}
