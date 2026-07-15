"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

/**
 * Product analytics (visitors + clicks). No-op unless NEXT_PUBLIC_POSTHOG_KEY
 * is set, so local and preview builds stay clean. Autocapture records clicks
 * automatically; this also sends a $pageview on every route change.
 */
const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!KEY) return;
    let url = window.origin + pathname;
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!KEY || typeof window === "undefined") return;
    if ((posthog as unknown as { __loaded?: boolean }).__loaded) return;
    posthog.init(KEY, {
      api_host: HOST,
      capture_pageview: false, // handled manually per route change below
      autocapture: true, // clicks, form interactions
      capture_pageleave: true,
    });
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </>
  );
}
