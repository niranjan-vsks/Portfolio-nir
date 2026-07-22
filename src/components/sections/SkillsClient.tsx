"use client";

import { useRouter } from "next/navigation";
import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";

/**
 * Skills : each skill is a card (subtitle = its category) in an
 * Infinite Moving Cards marquee. Clicking a skill routes to the Mind Map.
 * (Per-skill deep-zoom to its node is a polish item — reconcile in R12.)
 */
export function SkillsClient({
  groups,
}: {
  groups: { category: string; skills: string[] }[];
}) {
  const router = useRouter();
  return (
    <div className="space-y-8">
      {groups.map((g, i) => (
        <div key={g.category}>
          <h2 className="mb-3 font-mono text-sm text-green">{`> ${g.category}`}</h2>
          <InfiniteMovingCards
            speed={36 + i * 6}
            items={g.skills.map((s) => ({
              title: s,
              subtitle: g.category,
              onClick: () => router.push("/map"),
            }))}
          />
        </div>
      ))}
    </div>
  );
}
