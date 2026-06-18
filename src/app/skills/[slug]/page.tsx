import { getSection } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/sections/PageShell";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Skills" };

// Thin skill-filter view (bullseye/02). V1 renders the full grouped skills doc;
// a deep per-skill filter is deferred (see 05). The [slug] is informational.
export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skills = getSection("skills");
  return (
    <PageShell eyebrow={`skills :: ${slug.replace(/-/g, "_")}`} title="Skills">
      {skills && <Markdown html={skills.html} />}
    </PageShell>
  );
}
