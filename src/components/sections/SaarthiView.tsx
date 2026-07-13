"use client";

import { useEffect, useState } from "react";

const SCREEN_MS = 4200;

/**
 * Saarthi View: Mobile / Web toggle. Both surfaces cycle the SAME wireframe
 * screens (passed from the server, read live from the project's wireframes/
 * folder — dropping refreshed wireframes there updates this with no code
 * change). Mobile = a floating, slowly-swaying iPhone; Web = the same screens
 * inside a browser-window chrome.
 */
export function SaarthiView({ screens }: { screens: string[] }) {
  const [mode, setMode] = useState<"mobile" | "web">("mobile");
  const [screen, setScreen] = useState(0);
  const list = screens.length > 0 ? screens : [];

  useEffect(() => {
    if (list.length < 2) return;
    const id = setInterval(() => setScreen((s) => (s + 1) % list.length), SCREEN_MS);
    return () => clearInterval(id);
  }, [list.length]);

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
            <div className="relative w-[340px] rounded-[52px] border-[12px] border-neutral-800 bg-black shadow-[0_60px_120px_-40px_rgba(0,0,0,0.95),0_0_70px_-25px_rgba(74,222,128,0.3)]">
              <div className="absolute left-1/2 top-2.5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-neutral-900 ring-1 ring-neutral-800" />
              <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[40px] bg-[#0b0f17]">
                {list.map((src, i) => (
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
        <div className="flex justify-center py-8">
          {/* browser-window chrome around the same wireframe screens */}
          <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-neutral-800 bg-[#0b0f17] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9),0_0_60px_-25px_rgba(74,222,128,0.22)]">
            <div className="flex items-center gap-2 border-b border-white/8 bg-neutral-900/80 px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 flex-1 truncate rounded-md bg-black/40 px-3 py-1 text-center font-mono text-[11px] text-text-dim">
                app.saarthi.money
              </span>
            </div>
            <div className="relative aspect-[16/10] w-full bg-[#0b0f17]">
              {list.map((src, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={src}
                  src={src}
                  alt={`Saarthi web wireframe screen ${i + 1}`}
                  className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-1000 ${
                    i === screen ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <p className="mt-3 text-center font-mono text-[12px] text-text-dim">
        {list.length} wireframe screens · refreshed automatically as the design evolves
      </p>
    </section>
  );
}
