"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Lightweight static dashboard preview  — a green bar chart in a
 * terminal-framed card. Pure DOM/SVG, not WebGL, so it never counts against the
 * one-heavy-effect budget. The full interactive Dashboard is /dashboard (R8).
 */
const BARS = [42, 68, 30, 84, 56, 73, 48];

export function DashboardPreview() {
  const reduced = useReducedMotion();
  return (
    <div className="w-full max-w-md rounded-xl border border-green/20 bg-surface/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[12px] text-text-dim">delivery · signal</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-green">
          <span className="h-1.5 w-1.5 rounded-full bg-green" /> live
        </span>
      </div>
      <div className="flex h-28 items-end gap-2">
        {BARS.map((h, i) => (
          <motion.div
            key={i}
            initial={reduced ? false : { height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
            className="flex-1 rounded-t bg-gradient-to-t from-green/40 to-green"
            style={reduced ? { height: `${h}%` } : undefined}
          />
        ))}
      </div>
      <div className="mt-4 space-y-1.5">
        {["agentic systems", "RAG pipelines", "enterprise deploys"].map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-32 font-mono text-[11px] text-text-dim">{label}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-green"
                style={{ width: `${[78, 64, 88][i]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
