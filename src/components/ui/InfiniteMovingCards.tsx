"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Infinite Moving Cards . 
 * 2026-07-12: bigger cards, CAPITALIZED titles, larger type, and a two-stage
 * hover — the card EXPANDS first (and stays expanded while hovered), then
 * FLIPS to a back face; while hovering it keeps flipping back and forth every
 * ~6s. Marquee pauses on hover; reduced motion = static scrollable row.
 */
export interface MovingCardItem {
  title: string;
  subtitle: string;
  /** optional back-face line revealed by the hover flip */
  back?: string;
  onClick?: () => void;
}

function FlipCard({ it }: { it: MovingCardItem }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!hovered || reduced || !it.back) {
      // reset asynchronously so no state is set synchronously inside the effect
      const t = setTimeout(() => setFlipped(false), 0);
      return () => clearTimeout(t);
    }
    // expand happens instantly via CSS; the flip lands shortly after, then
    // keeps cycling every 6s for as long as the pointer stays on the card
    const first = setTimeout(() => setFlipped(true), 450);
    timer.current = setInterval(() => setFlipped((f) => !f), 6000);
    return () => {
      clearTimeout(first);
      if (timer.current) clearInterval(timer.current);
      timer.current = null;
    };
  }, [hovered, reduced, it.back]);

  const face =
    "absolute inset-0 flex flex-col justify-center rounded-xl border p-5 text-left [backface-visibility:hidden]";

  return (
    <button
      onClick={it.onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative h-28 w-72 shrink-0 [perspective:900px] focus-visible:outline-none"
      style={{
        transform: hovered && !reduced ? "scale(1.13)" : "scale(1)",
        transition: "transform .3s ease",
        zIndex: hovered ? 10 : 1,
      }}
    >
      <span
        className="absolute inset-0 block transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* FRONT */}
        <span className={`${face} border-green/20 bg-surface/70 backdrop-blur-sm`}>
          <span className="font-mono text-[15px] font-semibold uppercase tracking-wide text-white">
            {it.title}
          </span>
          <span className="mt-1.5 font-mono text-[12.5px] text-text-dim">{it.subtitle}</span>
        </span>
        {/* BACK */}
        <span
          className={`${face} border-green/50 bg-[#0b120d] shadow-[0_0_26px_-8px_rgba(74,222,128,0.5)] [transform:rotateY(180deg)]`}
        >
          <span className="font-mono text-[12.5px] leading-relaxed text-neutral-300">
            {it.back ?? it.subtitle}
          </span>
          <span className="mt-2 font-mono text-[12px] text-green">click → open</span>
        </span>
      </span>
    </button>
  );
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
      className="relative w-full overflow-x-auto py-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex w-max gap-4 py-2"
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
          <FlipCard key={`${it.title}-${idx}`} it={it} />
        ))}
      </div>
    </div>
  );
}
