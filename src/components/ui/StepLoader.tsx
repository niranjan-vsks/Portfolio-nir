"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * First-visit step loader (PRD 5). Runs ONCE on mount and drives progress with
 * requestAnimationFrame so it always completes (never restarts on a parent
 * re-render — the bug that stuck it). Fast by design (~1.2s); returning visitors
 * and reduced-motion reveal almost instantly. Calls onDone so the heavy scene
 * mounts only after the loader clears.
 */
const MESSAGES = [
  "booting scene…",
  "warming particle field…",
  "compositing atmosphere…",
  "spinning up the orbit…",
  "ready.",
];

export function StepLoader({
  storageKey = "nv_loaded_home",
  durationMs = 1200,
  onDone,
}: {
  storageKey?: string;
  durationMs?: number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let raf = 0;
    let start = 0;
    let returning = false;
    try {
      returning = !!sessionStorage.getItem(storageKey);
    } catch {}
    const dur = returning || reduced ? 250 : durationMs;

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {}
      setPct(100);
      onDoneRef.current?.();
      setTimeout(() => setVisible(false), 300);
    };

    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(100, ((t - start) / dur) * 100);
      setPct(p);
      if (p >= 100) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Safety net in case rAF is paused (background tab): reveal after dur+1s.
    const hard = setTimeout(finish, dur + 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hard);
    };
    // Mount-once: props are captured intentionally; re-running would restart it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!visible) return null;

  const msg = MESSAGES[Math.min(Math.floor((pct / 100) * MESSAGES.length), MESSAGES.length - 1)];

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050706] transition-opacity duration-300 ${
        pct >= 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-[min(90vw,340px)]">
        <div className="mb-3 flex items-center justify-between font-mono text-[12px]">
          <span className="text-green">niranjan.vsks</span>
          <span className="text-text-dim">{Math.round(pct)}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-green" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-3 font-mono text-[12px] text-text-dim">
          <span className="text-green">$</span> {msg}
        </p>
      </div>
    </div>
  );
}
