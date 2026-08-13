"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useScroll, useTransform, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * MacBook Scroll — a laptop lid that tips open as the section scrolls into
 * view (closed ~ -100deg → open 0deg), revealing screen content, with a
 * stylized keyboard deck beneath. Recolored to the dark + green terminal
 * palette so it blends with the rest of the site. Reduced motion shows the
 * lid fully open (end state), no animation.
 *
 * Pass `videoSrc` to make the screen clickable: it opens the same fullscreen
 * treatment the architecture diagrams use (escape or the close button exits),
 * but with a real video player so the reel can be scrubbed. The laptop screen
 * is small and the reels are dark, so the inline view is a teaser and this is
 * the readable one.
 */
export function MacBookScroll({
  children,
  videoSrc,
}: {
  children: ReactNode;
  videoSrc?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.35"],
  });

  const lidRotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-100, 0]);
  const lidOpacity = useTransform(scrollYProgress, [0, 0.15, 1], reduced ? [1, 1, 1] : [0, 1, 1]);
  const screenOpacity = useTransform(scrollYProgress, [0.55, 1], reduced ? [1, 1] : [0, 1]);

  return (
    <div ref={ref} className="relative mx-auto flex max-w-3xl flex-col items-center py-10">
      <div className="w-full" style={{ perspective: "1600px" }}>
        {/* lid: bezel + screen, hinges up from the base */}
        <motion.div
          style={{
            rotateX: lidRotate,
            opacity: lidOpacity,
            transformOrigin: "bottom center",
          }}
          className="relative z-10 mx-auto aspect-[16/10.2] w-full max-w-[560px] rounded-t-2xl border-2 border-b-0 border-green/25 bg-[#0c1310] p-2.5 shadow-[0_-10px_40px_-15px_rgba(74,222,128,0.25)]"
        >
          {/* camera notch */}
          <div className="pointer-events-none absolute left-1/2 top-1 z-20 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black ring-1 ring-green/20" />
          <div className="relative h-full w-full overflow-hidden rounded-lg border border-green/10 bg-bg">
            <motion.div style={{ opacity: screenOpacity }} className="h-full w-full">
              {children}
            </motion.div>
            {videoSrc && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-label="play the demo reel fullscreen"
                title="click to expand"
                className="group absolute inset-0 flex items-end justify-center pb-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-green"
              >
                <span className="rounded border border-green/40 bg-bg/85 px-2 py-1 font-mono text-[11px] text-green opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                  ⛶ expand
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* base: keyboard deck + trackpad, sits still beneath the lid */}
        <div className="relative mx-auto -mt-px w-full max-w-[560px]">
          <div className="h-3 w-full rounded-b-md border border-t-0 border-green/25 bg-[#0e1512]" />
          <div className="relative h-5 w-[104%] -translate-x-[2%] rounded-b-2xl border border-t-0 border-green/20 bg-[#0a0f0d] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.7)]">
            <div className="absolute left-1/2 top-0.5 h-1.5 w-20 -translate-x-1/2 rounded-b-md bg-black/40" />
          </div>
        </div>
      </div>

      {/* Rendered through a portal: the laptop sits inside a `perspective`
          container, which would otherwise anchor a fixed overlay to the
          laptop instead of the viewport. */}
      {videoSrc &&
        expanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-bg/95 p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="demo reel"
            onClick={(e) => {
              if (e.target === e.currentTarget) setExpanded(false);
            }}
          >
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="close fullscreen demo"
              className="absolute right-4 top-4 z-10 rounded border border-green/40 bg-bg/90 px-2 py-1 font-mono text-[11px] text-green transition-colors hover:bg-green hover:text-bg"
            >
              ✕ close (esc)
            </button>
            <video
              src={videoSrc}
              controls
              autoPlay
              loop
              playsInline
              className="max-h-full w-full max-w-6xl rounded-lg border border-green/20"
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
