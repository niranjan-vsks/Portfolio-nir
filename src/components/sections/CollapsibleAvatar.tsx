"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Collapsible avatar (landing). Right_Now fixes 2026-07-11: expanding the
 * bubble now pops up the Starman template — the looping video integrated AS
 * IS (no resolution/color changes, only sized to its slot) — with a
 * comic-style dialog box that typewrites the summary. Collapsed state stays
 * the small photo bubble.
 */
function AvatarMedia({ size }: { size: number }) {
  const [ok, setOk] = useState(true);
  return (
    <div
      className="relative overflow-hidden rounded-full border border-green/40 bg-neutral-900"
      style={{ width: size, height: size }}
    >
      {ok ? (
        <Image
          src="/niranjan-photo.jpg"
          alt="Niranjan VSKS"
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setOk(false)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green/15 to-cyan/15 font-mono text-2xl text-green/70">
          N
        </div>
      )}
    </div>
  );
}

function ComicDialog({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? text : "");

  useEffect(() => {
    if (reduced) {
      setTyped(text);
      return;
    }
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [text, reduced]);

  return (
    <div className="relative rounded-2xl border-2 border-white/80 bg-white px-4 py-3 text-[13.5px] font-medium leading-relaxed text-neutral-900 shadow-[4px_4px_0_rgba(74,222,128,0.55)]">
      {/* comic speech-bubble tail pointing at the starman */}
      <span className="absolute -top-3 left-10 block h-0 w-0 border-x-8 border-b-[14px] border-x-transparent border-b-white" />
      {typed}
      {typed.length < text.length && (
        <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-neutral-900" />
      )}
    </div>
  );
}

export function CollapsibleAvatar({
  name,
  title,
  summary,
  onAsk,
}: {
  name: string;
  title: string;
  summary: string;
  onAsk: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-40">
      {open ? (
        <div className="w-[340px] overflow-hidden rounded-2xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur-xl">
          {/* Starman, integrated as-is: looping, muted, its own colors */}
          <div className="relative">
            <video
              src="/starman/star-man.mp4"
              poster="/starman/star-man.jpg"
              autoPlay
              loop
              muted
              playsInline
              className="block aspect-square w-full object-cover"
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Collapse"
              className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white backdrop-blur transition-colors hover:text-green"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <AvatarMedia size={40} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{name}</p>
                <p className="text-[12px] text-green">{title}</p>
              </div>
            </div>
            <ComicDialog text={summary} />
            <button
              onClick={onAsk}
              className="w-full rounded-lg bg-green py-2 text-[13.5px] font-medium text-bg transition-transform hover:scale-[1.02] active:scale-95"
            >
              ask_niranjan
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open profile"
          className="group relative grid place-items-center rounded-full ring-2 ring-green/50 transition-transform hover:scale-105"
        >
          <AvatarMedia size={56} />
          <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-green text-[10px] font-bold text-bg">
            +
          </span>
        </button>
      )}
    </div>
  );
}
