"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Terminal flip card . One shared card used by Experience + Projects.
 * macOS window chrome with functional controls:
 *  - close  -> collapse to a drilldown bar
 *  - minimize -> same collapsed drilldown (heading + chevron)
 *  - maximize -> larger single scrolling terminal (no flip)
 * A deck flips between cards (drag / arrows / swipe). Resume-bolded keywords
 * render green via the `<strong>` rule in globals.css (.terminal-body strong).
 */
export interface TerminalCardItem {
  title: string; // e.g. "COFORGE · Senior Agentic AI Engineer"
  html: string; // normal body (rendered markdown)
  maximizedHtml?: string; // richer body for the maximized view
}

function Dot({ color }: { color: string }) {
  return <span className="h-3 w-3 rounded-full" style={{ background: color }} />;
}

export function TerminalCard({ cards }: { cards: TerminalCardItem[] }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const [state, setState] = useState<"normal" | "min" | "max">("normal");
  const card = cards[i];
  const total = cards.length;

  const go = (dir: 1 | -1) => {
    setState("normal");
    setI((p) => (p + dir + total) % total);
  };

  if (state === "min") {
    return (
      <button
        onClick={() => setState("normal")}
        className="flex w-full items-center justify-between rounded-lg border border-green/25 bg-surface/70 px-4 py-3 text-left font-mono text-[13px] text-green transition-colors hover:border-green/50"
      >
        <span>{card.title}</span>
        <ChevronDown size={16} className="-rotate-90" />
      </button>
    );
  }

  const maximized = state === "max";

  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-xl border border-green/25 bg-[#06080c]/90 backdrop-blur-sm ${
        maximized ? "fixed inset-4 z-50 sm:inset-10" : "relative w-full"
      }`}
    >
      {/* title bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setState("min")} aria-label="Collapse">
            <Dot color="#ff5f56" />
          </button>
          <button onClick={() => setState("min")} aria-label="Minimize">
            <Dot color="#ffbd2e" />
          </button>
          <button
            onClick={() => setState(maximized ? "normal" : "max")}
            aria-label={maximized ? "Restore" : "Maximize"}
          >
            <Dot color="#27c93f" />
          </button>
          <span className="ml-2 truncate font-mono text-[11px] text-text-dim">
            {card.title}
          </span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-green/30 px-1.5 font-mono text-[10px] text-green">
          {i + 1}/{total}
        </span>
      </div>

      {/* body */}
      <div className={maximized ? "h-[calc(100%-84px)] overflow-y-auto p-6" : "p-5"}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={i}
            initial={reduced ? false : { rotateY: 12, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={reduced ? undefined : { rotateY: -12, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="terminal-body prose-terminal max-w-none font-mono text-[13px] leading-relaxed text-text [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[13px] [&_h2]:text-green [&_li]:my-1 [&_p]:my-2 [&_strong]:text-green [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{
              __html: maximized ? card.maximizedHtml ?? card.html : card.html,
            }}
          />
        </AnimatePresence>
      </div>

      {/* footer nav (hidden when maximized) */}
      {!maximized && total > 1 && (
        <div className="flex items-center justify-between border-t border-white/10 px-3 py-2">
          <button
            onClick={() => go(-1)}
            className="flex items-center gap-1 font-mono text-[11px] text-text-dim hover:text-green"
            aria-label="Previous card"
          >
            <ChevronLeft size={14} /> prev
          </button>
          <span className="font-mono text-[10px] text-text-dim">drag or use arrows</span>
          <button
            onClick={() => go(1)}
            className="flex items-center gap-1 font-mono text-[11px] text-text-dim hover:text-green"
            aria-label="Next card"
          >
            next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {maximized && (
        <button
          onClick={() => setState("normal")}
          className="absolute bottom-3 right-4 rounded border border-green/40 px-3 py-1 font-mono text-[11px] text-green hover:bg-green hover:text-bg"
        >
          restore
        </button>
      )}
    </motion.div>
  );
}
