"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { CubeLoader } from "./CubeLoader";

/**
 * Full-screen cube loader overlay. Used two ways:
 *  - app/loading.tsx renders it as the route-transition Suspense fallback
 *    (React unmounts it the moment the next segment is ready — it just flashes
 *    by when navigation is fast, and holds visibly on a slow network/server).
 *  - the landing first-visit gate wraps it with a minimum hold timer.
 */
// No spoilers about what is being built behind the loader — keep it playful.
const STATUS = [
  "booting the workspace…",
  "assembling the pieces…",
  "compiling the experience…",
  "connecting the dots…",
  "polishing the details…",
  "almost there…",
];

export function CubeLoaderScreen({ label }: { label?: string }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduced || label) return;
    const id = setInterval(() => setI((n) => (n + 1) % STATUS.length), 1400);
    return () => clearInterval(id);
  }, [reduced, label]);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[radial-gradient(ellipse_at_50%_45%,#060a16_0%,#03040a_70%,#000_100%)]">
      <div className="flex flex-col items-center">
        <div className="relative grid h-[150px] w-[150px] place-items-center">
          <CubeLoader />
        </div>
        <p className="mt-16 font-mono text-[15px] text-neutral-300 sm:text-base">
          <span className="text-green">$</span> {label ?? STATUS[i]}
        </p>
      </div>
    </div>
  );
}
