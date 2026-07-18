"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Collapsible avatar (landing). NOW_FIXES 2026-07-13: no card frame. Opening
 * the bubble makes the Starman float in mid-air as an avatar (video blended
 * over the page, no box), a comic dialog box above his head speaks the
 * summary, and an ask_niranjan button floats under his legs.
 *
 * First visit per session: opens by itself, the dialog disappears after 5s,
 * the whole avatar collapses after 10s. Clicking anywhere outside dismisses
 * the dialog.
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
    <div className="relative rounded-2xl border border-white/12 bg-[#0b0e0c]/65 px-4 py-3 text-[13.5px] font-medium leading-relaxed text-neutral-100 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.85)] backdrop-blur-md">
      {typed}
      {typed.length < text.length && (
        <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-neutral-100" />
      )}
      {/* speech-bubble tail pointing down at the starman's head, matched to the box */}
      <span className="absolute -bottom-2.5 left-1/2 block h-0 w-0 -translate-x-1/2 border-x-8 border-t-[12px] border-x-transparent border-t-[#0b0e0c]/65" />
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
  const [showDialog, setShowDialog] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // On every landing load the starman expands on his own, then collapses back
  // after 6s (deferred so the auto-open never sets state synchronously).
  useEffect(() => {
    timers.current.push(
      setTimeout(() => {
        setOpen(true);
        setShowDialog(true);
      }, 0),
    );
    timers.current.push(setTimeout(() => setOpen(false), 6000));
    return clearTimers;
  }, [clearTimers]);

  // Clicking anywhere outside the dialog dismisses the dialog.
  useEffect(() => {
    if (!open || !showDialog) return;
    const onDoc = (e: MouseEvent) => {
      const dialog = rootRef.current?.querySelector("[data-dialog]");
      if (dialog && dialog.contains(e.target as globalThis.Node)) return;
      setShowDialog(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [open, showDialog]);

  return (
    <div ref={rootRef} className="fixed bottom-6 left-6 z-40">
      {open ? (
        <div className="flex w-[380px] flex-col items-center">
          {showDialog && (
            <div data-dialog className="mb-4 w-full">
              <ComicDialog text={summary} />
            </div>
          )}

          {/* The starman floats in mid-air: no frame, no card. The video's
              black background blends into the page (screen blend), so only
              the glowing figure remains, like an avatar standing there. */}
          <div className="relative w-[344px]">
            <video
              src="/starman/star-man.mp4"
              poster="/starman/star-man.jpg"
              autoPlay
              loop
              muted
              playsInline
              aria-label={`${name} avatar`}
              className="block w-full mix-blend-screen [mask-image:radial-gradient(ellipse_66%_60%_at_50%_45%,black_42%,transparent_90%)]"
            />
            <button
              onClick={() => {
                clearTimers();
                setOpen(false);
              }}
              aria-label="Collapse avatar"
              className="absolute -right-1 top-0 grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:text-green"
            >
              ✕
            </button>
          </div>

          {/* floating identity + CTA under his legs */}
          <p className="font-mono text-[12px] text-green">{title}</p>
          <button
            onClick={onAsk}
            className="mt-2 rounded-full bg-green px-6 py-2 text-[13.5px] font-medium text-bg shadow-[0_0_24px_rgba(74,222,128,0.45)] transition-transform hover:scale-[1.04] active:scale-95"
          >
            ask_niranjan
          </button>
        </div>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            clearTimers();
            setOpen(true);
            setShowDialog(true);
          }}
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
