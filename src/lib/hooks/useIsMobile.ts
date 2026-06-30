"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 767px)";

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
