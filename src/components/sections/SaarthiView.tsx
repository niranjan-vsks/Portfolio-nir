"use client";

import { useEffect, useState } from "react";

const SCREENS = Array.from({ length: 10 }, (_, i) => `/saarthi/wireframes/wf${String(i + 1).padStart(2, "0")}.png`);
const SCREEN_MS = 4200;

/**
 * Saarthi View: Mobile / Web toggle. Mobile = a single center-stage iPhone
 * floating in mid-air with a slow 3D sway; the actual app wireframes cycle
 * inside the screen (extracted from Niranjan's Saarthi wireframe deck).
 */
export function SaarthiView() {
  const [mode, setMode] = useState<"mobile" | "web">("mobile");
  const [screen, setScreen] = useState(0);

  useEffect(() => {
    if (mode !== "mobile") return;
    const id = setInterval(() => setScreen((s) => (s + 1) % SCREENS.length), SCREEN_MS);
    return () => clearInterval(id);
  }, [mode]);

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
        <div className="flex justify-center py-10 [perspective:1400px]">
          <div className="saarthi-phone-float">
            {/* iPhone frame, center stage */}
            <div className="relative w-[340px] rounded-[52px] border-[12px] border-neutral-800 bg-black shadow-[0_60px_120px_-40px_rgba(0,0,0,0.95),0_0_70px_-25px_rgba(74,222,128,0.3)]">
              <div className="absolute left-1/2 top-2.5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-900 ring-1 ring-neutral-800" />
              <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[40px] bg-[#0b0f17]">
                {SCREENS.map((src, i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={src}
                    src={src}
                    alt={`Saarthi wireframe screen ${i + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-1000 ${
                      i === screen ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          <style jsx global>{`
            .saarthi-phone-float {
              animation: saarthi-sway 14s ease-in-out infinite;
              transform-style: preserve-3d;
              will-change: transform;
            }
            @keyframes saarthi-sway {
              0% {
                transform: rotateY(-11deg) rotateX(2deg) translateY(0);
              }
              25% {
                transform: rotateY(0deg) rotateX(0deg) translateY(-10px);
              }
              50% {
                transform: rotateY(11deg) rotateX(-2deg) translateY(0);
              }
              75% {
                transform: rotateY(0deg) rotateX(0deg) translateY(-10px);
              }
              100% {
                transform: rotateY(-11deg) rotateX(2deg) translateY(0);
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .saarthi-phone-float {
                animation: none;
              }
            }
          `}</style>
        </div>
      ) : (
        <div className="grid min-h-[260px] place-items-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 p-8 text-center">
          <div>
            <p className="font-mono text-[13px] text-green">$ open saarthi --web</p>
            <p className="mt-2 max-w-md text-[15px] text-neutral-300">
              Web screens land here once cleared for publication. The mobile
              wireframe walkthrough is live in the mobile tab.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
