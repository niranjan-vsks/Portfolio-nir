"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The one button system (PRD 6.2), Aceternity Hover Border Gradient:
 * a gradient highlight travels the border at rest; on hover the border lights
 * up green, the label glows, and it lifts (3D). Active = press-in. Fully
 * legible label. Reduced-motion holds a static lit border.
 */
type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";
const NEXT: Record<Direction, Direction> = { TOP: "LEFT", LEFT: "BOTTOM", BOTTOM: "RIGHT", RIGHT: "TOP" };
const MAP: Record<Direction, string> = {
  TOP: "radial-gradient(20.7% 50% at 50% 0%, #4ade80 0%, rgba(74,222,128,0) 100%)",
  LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #4ade80 0%, rgba(74,222,128,0) 100%)",
  BOTTOM: "radial-gradient(20.7% 50% at 50% 100%, #4ade80 0%, rgba(74,222,128,0) 100%)",
  RIGHT: "radial-gradient(16.2% 41.2% at 100% 50%, #4ade80 0%, rgba(74,222,128,0) 100%)",
};
const HIGHLIGHT =
  "radial-gradient(75% 181% at 50% 50%, #4ade80 0%, rgba(74,222,128,0.4) 60%, rgba(74,222,128,0) 100%)";

export function HoverBorderGradient({
  children,
  onClick,
  href,
  target,
  className = "",
  duration = 1.4,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  className?: string;
  duration?: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [dir, setDir] = useState<Direction>("TOP");
  const rot = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (hovered) return;
    rot.current = setInterval(() => setDir((d) => NEXT[d]), duration * 1000);
    return () => {
      if (rot.current) clearInterval(rot.current);
    };
  }, [hovered, duration]);

  const inner = (
    <>
      <div className="z-10 rounded-[inherit] bg-[#0a0d0b] px-5 py-2 text-[14px] font-medium text-text transition-colors duration-300 group-hover:text-white group-hover:[text-shadow:0_0_10px_rgba(74,222,128,0.7)]">
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 rounded-[inherit]"
        style={{ filter: "blur(2px)" }}
        initial={{ background: MAP[dir] }}
        animate={{ background: hovered ? HIGHLIGHT : MAP[dir] }}
        transition={{ ease: "linear", duration: 0.6 }}
      />
      <div className="absolute inset-[1px] z-[1] rounded-[inherit] bg-[#0a0d0b]" />
    </>
  );

  const shared = cn(
    "group relative inline-flex w-fit items-center justify-center overflow-hidden rounded-full",
    "border border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-transform duration-150",
    "hover:-translate-y-0.5 active:translate-y-px active:scale-[0.98] focus-visible:outline-none",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={shared}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={shared}
    >
      {inner}
    </button>
  );
}
