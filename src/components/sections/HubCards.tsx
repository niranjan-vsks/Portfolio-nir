"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface HubItem {
  key: string;
  label: string;
  caption: string;
  cmd: string; // terminal command shown on hover, e.g. "cd projects"
  href?: string;
  onClick?: () => void;
}

/**
 * Landing hub portal cards : terminal-style cards that introduce each
 * section. Hover simulates a terminal command ("$ cd projects" -> "Opening
 * /projects..."). Real links/headings stay in the DOM for SEO + keyboard nav.
 */
export function HubCards({ items }: { items: HubItem[] }) {
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => {
        const active = hovered === it.key;
        const activate = () => (it.onClick ? it.onClick() : it.href && router.push(it.href));
        return (
          <button
            key={it.key}
            onMouseEnter={() => setHovered(it.key)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(it.key)}
            onBlur={() => setHovered(null)}
            onClick={activate}
            className="group rounded-lg border border-green/20 bg-surface/50 p-4 text-left backdrop-blur-sm transition-colors hover:border-green/60 focus-visible:border-green/60 focus-visible:outline-none"
          >
            <div className="mb-2 font-mono text-[11px] text-green">
              {active ? (
                <span>
                  {"$ "}
                  {it.cmd}
                  <span className="text-text-dim"> → opening…</span>
                </span>
              ) : (
                <span className="text-text-dim">{"$ "}{it.cmd}</span>
              )}
            </div>
            <div className="font-mono text-[15px] text-white group-hover:text-green">
              {it.label}
            </div>
            <div className="mt-1 text-[12px] text-text-dim">{it.caption}</div>
          </button>
        );
      })}
    </div>
  );
}
