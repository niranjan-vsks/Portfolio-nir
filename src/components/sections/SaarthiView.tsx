"use client";

import { useState } from "react";

/**
 * Saarthi View (PRD 13.4): Mobile / Web toggle. Mobile = the real wireframe
 * walkthrough video inside an iPhone-style mockup frame (asset supplied by
 * Niranjan, 2026-07-11). Web = honest stub until web screens are cleared.
 */
export function SaarthiView() {
  const [mode, setMode] = useState<"mobile" | "web">("mobile");

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-mono text-lg text-green">{"> view"}</h2>
        <div className="flex overflow-hidden rounded-lg border border-neutral-800 font-mono text-[12px]">
          {(["mobile", "web"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 transition-colors ${
                mode === m ? "bg-green text-bg" : "bg-neutral-900 text-text-dim hover:text-green"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === "mobile" ? (
        <div className="flex justify-center py-4">
          {/* iPhone-style mockup frame around the wireframe animation */}
          <div className="relative w-[290px] rounded-[44px] border-[10px] border-neutral-800 bg-black shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9),0_0_50px_-20px_rgba(74,222,128,0.25)]">
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-800" />
            <video
              src="/saarthi/mobile-demo.webm"
              autoPlay
              loop
              muted
              playsInline
              className="block aspect-[9/19] w-full rounded-[34px] object-cover"
            />
          </div>
        </div>
      ) : (
        <div className="grid min-h-[260px] place-items-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 text-center">
          <div>
            <p className="font-mono text-[13px] text-green">$ open saarthi --web</p>
            <p className="mt-2 max-w-md text-[13.5px] text-text-dim">
              Web screens land here once cleared for publication. The mobile
              wireframe walkthrough is live in the mobile tab.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
