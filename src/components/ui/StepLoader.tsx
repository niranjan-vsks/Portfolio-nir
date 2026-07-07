"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * First-visit step loader (PRD 5 mitigation contract). Steps 0→100 in ~10%
 * increments with terminal-voice messages while heavy WebGL warms behind a
 * blur. First visit only (sessionStorage); returning nav skips it. Hard-timeout
 * reveal so the user is never trapped. Reduced motion shows a brief static state.
 */
export function StepLoader({
  storageKey = "nv_loaded_home",
  messages = [
    "booting scene…",
    "warming particle fields…",
    "loading planet geometry…",
    "compositing atmosphere…",
    "spinning up the orbit…",
    "ready.",
  ],
  timeoutMs = 4000,
  onDone,
}: {
  storageKey?: string;
  messages?: string[];
  timeoutMs?: number;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [pct, setPct] = useState(0);
  const [msg, setMsg] = useState(messages[0]);
  const done = useRef(false);

  useEffect(() => {
    // returning visitor: skip (deferred so it's not a synchronous effect setState)
    if (typeof window !== "undefined" && sessionStorage.getItem(storageKey)) {
      const t = setTimeout(() => {
        setVisible(false);
        onDone?.();
      }, 0);
      return () => clearTimeout(t);
    }
    const finish = () => {
      if (done.current) return;
      done.current = true;
      try { sessionStorage.setItem(storageKey, "1"); } catch {}
      setPct(100);
      setMsg(messages[messages.length - 1]);
      onDone?.(); // mount the heavy scene now that the loader is clearing
      setTimeout(() => setVisible(false), 350);
    };

    if (reduced) {
      const t = setTimeout(finish, 500);
      return () => clearTimeout(t);
    }

    let step = 0;
    const iv = setInterval(() => {
      step += 1;
      const p = Math.min(90, step * 10 + Math.floor(Math.random() * 6));
      setPct(p);
      setMsg(messages[Math.min(step, messages.length - 2)]);
    }, 380);
    const hard = setTimeout(finish, timeoutMs);
    return () => {
      clearInterval(iv);
      clearTimeout(hard);
    };
  }, [reduced, messages, storageKey, timeoutMs, onDone]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050706] transition-opacity duration-300 ${
        pct === 100 ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-[min(90vw,360px)]">
        <div className="mb-3 flex items-center justify-between font-mono text-[12px]">
          <span className="text-green">niranjan.vsks</span>
          <span className="text-text-dim">{pct}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-green transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 font-mono text-[12px] text-text-dim">
          <span className="text-green">$</span> {msg}
        </p>
      </div>
    </div>
  );
}
