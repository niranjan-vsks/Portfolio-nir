"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * Card Spotlight : a green radial glow tracks the cursor over the
 * card. Used for System Design node detail and Dashboard metric cards. Optional
 * onClick for the expand-on-click behavior (replaces the dropped Expandable card).
 */
export function CardSpotlight({
  children,
  className = "",
  onClick,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: "div" | "button";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [active, setActive] = useState(false);
  const Tag = as as "div";

  return (
    <Tag
      ref={ref}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={`group relative overflow-hidden rounded-xl border border-green/20 bg-surface/60 backdrop-blur-sm transition-colors hover:border-green/50 ${
        onClick ? "cursor-pointer text-left" : ""
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(220px circle at ${pos.x}px ${pos.y}px, rgba(74,222,128,0.16), transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </Tag>
  );
}
