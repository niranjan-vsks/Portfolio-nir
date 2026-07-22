import type { Metadata } from "next";
import { getSection } from "@/lib/content";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";
import { SkillsClient } from "@/components/sections/SkillsClient";

export const metadata: Metadata = {
  title: "Skills",
  description:
    "Niranjan's skills across Generative & Agentic AI, Engineering & Delivery, Enterprise, and ML & Data Science.",
};

// Parse skills.md into { category, skills[] } groups (no hardcoded copy).
function parseSkills(body: string) {
  return body
    .split(/^##\s+/m)
    .filter((s) => s.trim())
    .map((part) => {
      const nl = part.indexOf("\n");
      const category = part.slice(0, nl).trim();
      const skills = part
        .slice(nl + 1)
        .replace(/\n/g, " ")
        .split("·")
        .map((s) => s.trim())
        .filter(Boolean);
      return { category, skills };
    });
}

export default function SkillsPage() {
  const skills = getSection("skills");
  const groups = skills ? parseSkills(skills.body) : [];
  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <PageShell eyebrow="skills" title="What I work with">
        <p className="mb-10 max-w-2xl text-text-dim">
          Click any skill to see where it lives in the mind map and where I have
          applied it.
        </p>
        <SkillsClient groups={groups} />
      </PageShell>
    </>
  );
}
