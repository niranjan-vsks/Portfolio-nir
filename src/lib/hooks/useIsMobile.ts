"use client";

import { useSyncExternalStore } from "react";

// Narrow screens, OR portrait touch devices up to 1024px wide. The second
// clause catches phones forced into "Desktop site" mode (which report a wide
// width) and small tablets held in portrait, so they get the clean card
// fallback instead of the orbit breaking — and rotating to landscape brings
// the full 3D scene back.
const QUERY =
  "(max-width: 767px), (max-width: 1024px) and (orientation: portrait) and (pointer: coarse)";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * Shared mobile breakpoint hook (< 768px). Drives the mobile fallbacks required
 * for every heavy component (PRD 1.5). SSR-safe, lint-clean.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => (typeof window !== "undefined" ? window.matchMedia(QUERY).matches : false),
    () => false,
  );
}
