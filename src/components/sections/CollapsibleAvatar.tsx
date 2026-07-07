"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Collapsible avatar (landing). Replaces the space-hungry 3D photo card: a small
 * avatar bubble that expands into a compact identity card (name, title, summary,
 * ask_niranjan). The circular media slot is swappable — a real animated avatar
 * (video/Lottie/3D) can drop into `AvatarMedia` later with no layout change.
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
        <div className="w-72 rounded-2xl border border-white/10 bg-[#0b0e0c]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-start gap-3">
            <AvatarMedia size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{name}</p>
              <p className="text-[12px] text-green">{title}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Collapse"
              className="text-text-dim transition-colors hover:text-green"
            >
              ✕
            </button>
          </div>
          <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-text-dim">{summary}</p>
          <button
            onClick={onAsk}
            className="mt-3 w-full rounded-lg bg-green py-1.5 text-[13px] font-medium text-bg transition-transform hover:scale-[1.02] active:scale-95"
          >
            ask_niranjan
          </button>
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
