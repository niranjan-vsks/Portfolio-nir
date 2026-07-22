"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useSound } from "@/components/providers/SoundProvider";

/**
 * Landing 3D photo card . CSS-3D flip (perspective +
 * rotateY) · NOT a second WebGL canvas, so Home keeps one heavy effect. Front:
 * photo + name + title + Summary button. Back: terminal card that typewrites
 * the summary (muted typing sound, opt-in). Photo falls back to a monogram if
 * public/niranjan-photo.jpg is absent (logged in STATE.md §2).
 */
export function PhotoCard3D({
  name,
  title,
  summary,
}: {
  name: string;
  title: string;
  summary: string;
}) {
  const reduced = useReducedMotion();
  const { play, enabled } = useSound();
  const [flipped, setFlipped] = useState(false);
  const [typed, setTyped] = useState(reduced ? summary : "");
  const [photoOk, setPhotoOk] = useState(true);

  useEffect(() => {
    if (!flipped || reduced) {
      if (reduced) setTyped(summary);
      return;
    }
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(summary.slice(0, i));
      if (enabled && i % 2 === 0) play("/sounds/sound.ogg");
      if (i >= summary.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [flipped, summary, reduced, enabled, play]);

  return (
    <div className="[perspective:1400px]">
      <div
        className="relative h-[420px] w-full max-w-[340px] transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* FRONT */}
        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-green/25 bg-surface/70 backdrop-blur-sm [backface-visibility:hidden]">
          <div className="relative flex-1 bg-bg">
            {photoOk ? (
              <Image
                src="/niranjan-photo.jpg"
                alt={name}
                fill
                priority
                className="object-cover"
                sizes="340px"
                onError={() => setPhotoOk(false)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green/10 to-cyan/10">
                <span className="font-mono text-6xl text-green/70">N</span>
              </div>
            )}
          </div>
          <div className="border-t border-green/20 p-4">
            <h2 className="font-mono text-lg text-white">{name}</h2>
            <p className="font-mono text-[12px] text-green">{title}</p>
            <button
              onClick={() => setFlipped(true)}
              className="mt-3 w-full rounded border border-green/50 py-1.5 font-mono text-[12px] text-green transition-colors hover:bg-green hover:text-bg"
            >
              {"> summary"}
            </button>
          </div>
        </div>

        {/* BACK · terminal summary */}
        <div className="absolute inset-0 overflow-hidden rounded-xl border border-cyan/30 bg-[#06080c]/95 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
            <span className="ml-2 font-mono text-[11px] text-text-dim">niranjan · summary</span>
          </div>
          <div className="p-4">
            <pre className="whitespace-pre-wrap font-mono text-[12px] leading-relaxed text-green">
              {typed}
              <span className="blink-cursor" />
            </pre>
            <button
              onClick={() => setFlipped(false)}
              className="mt-4 rounded border border-cyan/50 px-3 py-1 font-mono text-[12px] text-cyan transition-colors hover:bg-cyan hover:text-bg"
            >
              {"< back"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
