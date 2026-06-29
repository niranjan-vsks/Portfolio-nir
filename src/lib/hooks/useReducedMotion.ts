"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Shared reduced-motion hook (PRD 1.5). Every heavy/animated component reads
 * this and skips morphs/motion to the end state when true. SSR-safe and
 * lint-clean (subscription via useSyncExternalStore, no setState-in-effect).
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
