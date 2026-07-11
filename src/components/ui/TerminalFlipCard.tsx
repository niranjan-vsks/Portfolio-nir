"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * The one true card (PRD 12.1), ported from the Aceternity `terminal_card`
 * essence: macOS terminal window (traffic-light dots + path label), syntax-
 * highlighted YAML body, typewriter caption. Renovation-surgical additions:
 * flips on hover (rotateY) to a "launch" back face, routes on click. Keeps the
 * template's multi-color syntax highlight (not flattened to green).
 */
export interface TerminalFlipCardProps {
  href: string;
  path: string; // e.g. "loop-copilot.sh"
  name: string;
  status?: string; // shipped | piloted | in development | production | reference
  caption: string;
  stat?: string;
  index?: string; // "01"
  stack?: string[];
  external?: boolean;
  className?: string;
  /** optional 2-liner on the flip back (FDE hub cards, Right_Now fixes) */
  backCaption?: string;
}

const STATUS_COLOR: Record<string, string> = {
  live: "text-emerald-400",
  shipped: "text-emerald-400",
  production: "text-emerald-400",
  piloted: "text-cyan-300",
  reference: "text-cyan-300",
  in_development: "text-amber-300",
  "in development": "text-amber-300",
};

function Dots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-3 w-3 rounded-full bg-red-500" />
      <span className="h-3 w-3 rounded-full bg-yellow-500" />
      <span className="h-3 w-3 rounded-full bg-green-500" />
    </div>
  );
}

export function TerminalFlipCard({
  href,
  path,
  name,
  status,
  caption,
  stat,
  index,
  stack = [],
  external = false,
  className = "",
  backCaption,
}: TerminalFlipCardProps) {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? caption : "");
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (reduced) {
      setTyped(caption);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          let i = 0;
          const id = setInterval(() => {
            i++;
            setTyped(caption.slice(0, i));
            if (i >= caption.length) clearInterval(id);
          }, 22);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [caption, reduced]);

  const statusCls = STATUS_COLOR[(status ?? "").toLowerCase()] ?? "text-neutral-300";

  const chrome = (label: string, extra?: React.ReactNode) => (
    <div className="flex items-center gap-2 border-b border-white/5 bg-neutral-800/80 px-3 py-2">
      <Dots />
      <span className="flex-1 truncate text-center text-[11px] text-neutral-400">{label}</span>
      {extra ?? <span className="w-8" />}
    </div>
  );

  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group block [perspective:1200px] focus-visible:outline-none ${className}`}
      aria-label={name}
    >
      <div
        ref={ref}
        className="relative h-56 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]"
      >
        {/* FRONT */}
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl [backface-visibility:hidden]">
          {chrome(
            `~/projects/${path}`,
            index ? <span className="w-8 text-right text-[10px] text-neutral-600">{index}</span> : undefined,
          )}
          <div className="p-4 font-mono text-[12.5px] leading-relaxed">
            <div>
              <span className="text-emerald-400">$ cat</span>{" "}
              <span className="text-cyan-300">project.yml</span>
            </div>
            <div>
              <span className="text-sky-400">name:</span>{" "}
              <span className="font-semibold text-white">{name}</span>
            </div>
            {status && (
              <div>
                <span className="text-sky-400">status:</span>{" "}
                <span className={statusCls}>{status}</span>
              </div>
            )}
            <div className="my-1 text-neutral-600">---</div>
            <div className="text-neutral-300">
              {typed}
              {!reduced && typed.length < caption.length && (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-neutral-300" />
              )}
            </div>
            {stat && <div className="mt-2 text-emerald-400">{stat}</div>}
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-green/40 bg-neutral-900 shadow-[0_0_30px_-8px_rgba(74,222,128,0.5)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {chrome(`~/open ${path}`)}
          <div className="flex h-[calc(100%-37px)] flex-col p-4 font-mono text-[12.5px]">
            <div className="text-emerald-400">$ ./launch {name.toLowerCase().replace(/\s+/g, "-")}</div>
            {backCaption ? (
              <p className="mt-2 text-[12px] leading-relaxed text-neutral-300">{backCaption}</p>
            ) : (
              <div className="mt-1 text-neutral-400">{"> booting" + "…"}</div>
            )}
            {stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stack.slice(0, 6).map((s) => (
                  <span key={s} className="rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-cyan-300">
                    {s}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-auto flex items-center justify-between">
              <span className="text-neutral-500">{external ? "opens live site" : "enter project"}</span>
              <span className="text-green transition-transform group-hover:translate-x-0.5">
                {external ? "↗" : "→"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
