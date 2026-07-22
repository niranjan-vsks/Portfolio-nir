"use client";

import { useRef, type ReactNode } from "react";
import { useScroll, useTransform, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

/**
 * Container Scroll Animation  — a custom scroll
 * container that the user explicitly wanted restored "properly" (NOT a dead B&W
 * frame). Scroll tips a 3D device frame from rotateX 20deg → 0 while it scales
 * up; the title rises. Recolored to the dark + green palette (no B&W). Reduced
 * motion shows the end state (flat, scale 1). Real screenshot goes inside.
 */
export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({ target: ref });

  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [20, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? [0.8, 0.95] : [1.05, 1],
  );
  const translate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [0, -100]);

  return (
    <div
      ref={ref}
      className="relative flex h-[48rem] items-center justify-center p-2 md:h-[64rem] md:p-12"
    >
      <div className="relative w-full py-8 md:py-28" style={{ perspective: "1000px" }}>
        <motion.div
          style={{ translateY: translate }}
          className="mx-auto max-w-5xl text-center"
        >
          {titleComponent}
        </motion.div>

        <motion.div
          style={{
            rotateX: rotate,
            scale,
            boxShadow:
              "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
          }}
          className="-mt-8 mx-auto h-[26rem] w-full max-w-5xl rounded-[28px] border-2 border-green/30 bg-[#0c1310] p-2 shadow-2xl md:h-[36rem] md:p-4"
        >
          {/* macOS chrome strip */}
          <div className="mb-2 flex items-center gap-1.5 px-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <div className="h-[calc(100%-1.5rem)] w-full overflow-hidden rounded-2xl border border-green/10 bg-bg">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
