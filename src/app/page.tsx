import { getSection } from "@/lib/content";
import { HomeClient } from "@/components/sections/HomeClient";

export default function Home() {
  const hero = getSection("hero");
  const fm = (hero?.frontmatter ?? {}) as Record<string, string>;

  // Pull the one-line positioning paragraph from hero.md (no hardcoded copy).
  const positioning =
    hero?.body
      .match(/##\s*One-line positioning\s*\n+([^\n]+)/i)?.[1]
      ?.trim() ?? fm.tagline ?? "";

  return (
    <HomeClient
      name="Niranjan VSKS"
      title="Senior Agentic AI Engineer · Forward Deployed"
      summary={positioning}
      caption={fm.tagline ?? positioning}
    />
  );
}
