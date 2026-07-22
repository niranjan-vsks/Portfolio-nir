"use client";

import { useEffect, useState } from "react";
import { Monitor } from "lucide-react";

/**
 * A friendly, one-time nudge for visitors on a touch device (including phones
 * in "Desktop site" mode): the 3D globe, mind map, and richer motion land best
 * on a wider screen. Palette-matched to the terminal cards, appears a beat after
 * load (never jarring), and once dismissed it stays gone (localStorage).
 */
const KEY = "nv_web_hint_dismissed";

export function MobileWebHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = !!localStorage.getItem(KEY);
    } catch {
      /* storage blocked: treat as not-yet-dismissed */
    }
    if (dismissed) return;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const small = window.matchMedia("(max-width: 1024px)").matches;
    if (!coarse || !small) return; // touch + smallish screen only
    const t = setTimeout(() => setShow(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[70] animate-[fadeIn_0.4s_ease]">
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-green/25 bg-[#0b0e0c]/90 px-4 py-3.5 shadow-[0_16px_50px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-green/40 bg-green/10 text-green">
          <Monitor className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <p className="text-[13.5px] font-medium leading-snug text-neutral-100">
            Best experienced on desktop
          </p>
          <p className="mt-1 text-[12.5px] leading-relaxed text-text-dim">
            The 3D globe, the interactive mind map, and the motion really come alive on a wider screen. Worth a look on your laptop when you get a moment.
          </p>
          <button
            onClick={dismiss}
            className="mt-2.5 rounded-lg bg-green px-3.5 py-1.5 font-mono text-[12px] font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-95"
          >
            Got it, exploring anyway
          </button>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 font-mono text-[13px] text-text-dim transition-colors hover:text-green"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
