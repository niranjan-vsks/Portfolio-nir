"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TerminalLoader } from "@/components/ui/TerminalLoader";
import { ChatPanel } from "@/components/sections/ChatPanel";
import type { HeroProject } from "@/components/3d/hero/HeroScene";

const HeroScene = dynamic(() => import("@/components/3d/hero/HeroScene"), {
  ssr: false,
  loading: () => <TerminalLoader label="initializing_cinematic_mode" />,
});

const ENTRY_LABELS = [
  { label: "agentic_ai_and_rag", href: "/projects/qe-platform" },
  { label: "enterprise_delivery", href: "/system-design" },
  { label: "all_projects", href: "/projects" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

function Typewriter({ lines }: { lines: string[] }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState("");
  const full = lines.join("\n");

  useEffect(() => {
    if (reduced) {
      setShown(full);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, 22);
    return () => clearInterval(id);
  }, [full, reduced]);

  return (
    <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-green sm:text-sm">
      {shown}
      <span className="blink-cursor" />
    </pre>
  );
}

export function HeroClient({
  projects,
  introLines,
  tagline,
}: {
  projects: HeroProject[];
  introLines: string[];
  tagline: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [isMobile, setIsMobile] = useState(false);
  const [askOpen, setAskOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (params.get("ask") === "1") setAskOpen(true);
  }, [params]);

  const onRoute = useCallback(
    (slug: string) => router.push(`/projects/${slug}`),
    [router],
  );

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-bg">
      {/* 3D background (desktop only) */}
      {!isMobile && (
        <div className="absolute inset-0">
          <Suspense fallback={<TerminalLoader label="initializing_cinematic_mode" />}>
            <HeroScene projects={projects} onRoute={onRoute} />
          </Suspense>
        </div>
      )}

      {/* Overlay: terminal intro + entry labels */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-6 pt-20 sm:p-10 sm:pt-24">
        <div className="pointer-events-auto max-w-xl rounded-lg border border-green/20 bg-bg/70 p-5 backdrop-blur-sm">
          <Typewriter lines={introLines} />
          <p className="mt-4 max-w-md text-sm text-text-dim">{tagline}</p>
        </div>

        <div className="pointer-events-auto flex flex-col gap-4 pb-4">
          <p className="font-mono text-[13px] text-text-dim">
            {`> what brings you here?`}
          </p>
          <div className="flex flex-wrap gap-3">
            {ENTRY_LABELS.map((e) => (
              <Link
                key={e.label}
                href={e.href}
                className="rounded border border-green/40 bg-bg/60 px-3 py-1.5 font-mono text-[13px] text-green backdrop-blur-sm transition-colors hover:bg-green hover:text-bg"
              >
                {`> ${e.label}`}
              </Link>
            ))}
            <button
              onClick={() => setAskOpen(true)}
              className="rounded border border-cyan/40 bg-bg/60 px-3 py-1.5 font-mono text-[13px] text-cyan backdrop-blur-sm transition-colors hover:bg-cyan hover:text-bg"
            >
              {`> ask_niranjan`}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile fallback content (3d-performance rule: disable 3D < 768px) */}
      {isMobile && (
        <div className="absolute inset-0 flex flex-col justify-center gap-6 p-6 pt-20">
          <p className="font-mono text-[13px] text-text-dim">
            {`> 3D cinematic mode is desktop-only. here is the fast path:`}
          </p>
          <div className="flex flex-col gap-2">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/projects/${p.slug}`}
                className="rounded border border-border bg-surface/60 p-3 font-mono text-[13px] text-green"
              >
                {`> ${p.name}`}
                <span className="block text-[11px] text-text-dim">
                  {p.tagline}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <ChatPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </main>
  );
}
