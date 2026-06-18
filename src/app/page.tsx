import { Suspense } from "react";
import { getSection, getAllProjects } from "@/lib/content";
import { HeroClient } from "@/components/sections/HeroClient";
import type { HeroProject } from "@/components/3d/hero/HeroScene";

export default function Home() {
  const hero = getSection("hero");
  const fm = (hero?.frontmatter ?? {}) as Record<string, string>;

  // Pull the typewriter intro lines from the fenced code block in hero.md.
  const introLines =
    hero?.body
      .match(/```([\s\S]*?)```/)?.[1]
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith(">") && l !== "> _") ?? [];

  const projects: HeroProject[] = getAllProjects().map((p) => ({
    slug: p.frontmatter.slug,
    name: p.frontmatter.public_name ?? p.frontmatter.title,
    tagline: p.frontmatter.tagline ?? "",
    metric: p.frontmatter.metric,
    stack: p.frontmatter.stack,
  }));

  return (
    <Suspense>
      <HeroClient
        projects={projects}
        introLines={introLines}
        tagline={fm.tagline ?? ""}
      />
    </Suspense>
  );
}
