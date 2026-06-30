"use client";

import { useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Infinite Moving Cards (PRD 6.10, Aceternity marquee). A looping row of skill
 * cards. Each card routes to its Mind Map node on click. Pauses on hover;
 * reduced motion shows a static, horizontally-scrollable row.
 */
export interface MovingCardItem {
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export function InfiniteMovingCards({
  items,
  speed = 40,
}: {
  items: MovingCardItem[];
  speed?: number;
}) {
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const row = [...items, ...items]; // duplicate for seamless loop

  return (
    <div
      className="relative w-full overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex w-max gap-3 py-2"
        style={
          reduced
            ? undefined
            : {
                animation: `marquee ${speed}s linear infinite`,
                animationPlayState: paused ? "paused" : "running",
              }
        }
      >
        {row.map((it, idx) => (
          <button
            key={`${it.title}-${idx}`}
            onClick={it.onClick}
            className="group flex w-56 shrink-0 flex-col rounded-lg border border-green/20 bg-surface/60 p-4 text-left backdrop-blur-sm transition-colors hover:border-green/55"
          >
            <span className="font-mono text-[14px] text-white group-hover:text-green">
              {it.title}
            </span>
            <span className="mt-1 font-mono text-[11px] text-text-dim">
              {it.subtitle}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
