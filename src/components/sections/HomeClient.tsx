"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsibleAvatar } from "@/components/sections/CollapsibleAvatar";
import type { OrbitItem } from "@/components/3d/globe/GlobeStage";
import { LayoutTextFlip } from "@/components/ui/LayoutTextFlip";
import { EncryptedText } from "@/components/ui/EncryptedText";
import { CubeLoaderScreen } from "@/components/ui/CubeLoaderScreen";
import { ChatPanel } from "@/components/sections/ChatPanel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const GlobeStage = dynamic(() => import("@/components/3d/globe/GlobeStage"), { ssr: false });

const ITEMS: OrbitItem[] = [
  { label: "Independent Projects", caption: "Loop Copilot, Saarthi, WealthOS, Operator OS, Agentic Codebase Intelligence", path: "projects.sh", href: "/projects" },
  { label: "Work Experience", caption: "Coforge, HPE, Mphasis", path: "experience.sh", href: "/experience" },
  { label: "Forward Deployed Engineering", caption: "how I ship into enterprises", path: "fde.sh", href: "/forward-deployed" },
  { label: "Mind Map", caption: "the whole system, one graph", path: "mindmap.sh", href: "/map?intro=landing" },
  { label: "System Design", caption: "architectures, requirements, tradeoffs", path: "architecture.sh", href: "/system-design" },
  { label: "Dashboard", caption: "the signal at a glance", path: "dashboard.sh", href: "/dashboard" },
  { label: "About", caption: "seven years, one arc", path: "about.sh", href: "/about" },
  { label: "Contact", caption: "start a conversation", path: "contact.sh", href: "/contact" },
];

const FIRST_VISIT_KEY = "nv_first_visit_done";

/**
 * First-visit gate: shows the cube loader over the (already-mounting) scene.
 * The 7-8s dwell happens ONLY on a visitor's first-ever load — long enough for
 * the globe + cards to warm up behind it, so the reveal is one clean crossfade.
 * Returning visitors get a brief hold and reduced-motion is near-instant.
 */
function FirstVisitLoader({ onReveal }: { onReveal: () => void }) {
  const reduced = useReducedMotion();
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let first = false;
    try {
      first = !localStorage.getItem(FIRST_VISIT_KEY);
    } catch {
      /* storage blocked: treat as returning, keep it short */
    }
    const holdMs = reduced ? 300 : first ? 7500 : 800;

    const reveal = setTimeout(() => {
      try {
        localStorage.setItem(FIRST_VISIT_KEY, "1");
      } catch {}
      setFading(true);
      onReveal();
      setTimeout(() => setGone(true), 650);
    }, holdMs);

    return () => clearTimeout(reveal);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;
  return (
    <div className={`transition-opacity duration-[650ms] ${fading ? "opacity-0" : "opacity-100"}`}>
      <CubeLoaderScreen />
    </div>
  );
}

export function HomeClient({
  name,
  title,
  summary,
  caption,
}: {
  name: string;
  title: string;
  summary: string;
  caption: string;
}) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const [askOpen, setAskOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [navLabel, setNavLabel] = useState<string | null>(null);
  // Intro heading and avatar auto-open on every load (not gated to first-ever
  // visit) and auto-collapse shortly after so they never sit in the way.
  const [headerOpen, setHeaderOpen] = useState(true);
  const onReveal = useCallback(() => setRevealed(true), []);

  // Card click: flash the cube loader with a section-specific label so the user
  // sees their click registered, then route. Fixes the "no feedback, random
  // redirect" glitch. Non-active cards revolve to front (handled in the globe).
  const onCardNavigate = useCallback(
    (item: OrbitItem) => {
      if (item.onClick) {
        item.onClick();
        return;
      }
      if (!item.href) return;
      setNavLabel(`loading ${item.label.toLowerCase()}…`);
      window.setTimeout(() => router.push(item.href!), 650);
    },
    [router],
  );

  // Intro heading appears on reveal, then auto-collapses after 6s so it stops
  // covering the globe and orbit cards. Reduced-motion leaves it open.
  useEffect(() => {
    if (!revealed || reduced) return;
    const t = setTimeout(() => setHeaderOpen(false), 6000);
    return () => clearTimeout(t);
  }, [revealed, reduced]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#060a16_0%,#03040a_60%,#000_100%)]">
      {/* Unified stage — mounts immediately (desktop) so the heavy WebGL scene
          warms up behind the cube loader and the reveal is a single crossfade. */}
      {!isMobile && (
        <div className="absolute inset-0 z-10 animate-[fadeIn_1.2s_ease]">
          <GlobeStage items={ITEMS} onNavigate={onCardNavigate} />
        </div>
      )}

      {/* heading — overlaid, non-blocking so the orbit cards stay clickable */}
      <div
        className={`pointer-events-none relative z-20 mx-auto max-w-[1200px] px-6 pt-24 transition-all duration-500 sm:pt-28 [html[data-nav=collapsed]_&]:pt-16 ${
          revealed ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          type="button"
          onClick={() => setHeaderOpen((o) => !o)}
          aria-label={headerOpen ? "Hide intro" : "Show intro"}
          aria-expanded={headerOpen}
          className="pointer-events-auto mb-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1 font-mono text-[11px] text-text-dim backdrop-blur transition-colors hover:border-green/40 hover:text-green"
        >
          <span className="text-green">$</span> intro
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${headerOpen ? "" : "-rotate-90"}`} />
        </button>

        <div
          className={`grid transition-all duration-500 ${
            headerOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <LayoutTextFlip
              prefix="I ship"
              words={["agentic systems", "production RAG pipelines", "into real customer environments"]}
              className="text-4xl font-semibold leading-tight text-white sm:text-5xl [text-shadow:0_-1px_0_rgba(255,255,255,0.28),0_1px_0_rgba(0,0,0,0.8),0_2px_0_rgba(0,0,0,0.72),0_3px_0_rgba(0,0,0,0.6),0_4px_0_rgba(0,0,0,0.5),0_7px_14px_rgba(0,0,0,0.75)]"
              wordClassNames={["text-green", "text-[#00E5FF]", "text-[#4aa8ff]"]}
            />
            <EncryptedText
              as="p"
              text={caption}
              className="mt-4 block max-w-2xl text-[17px] leading-relaxed text-neutral-200 [text-shadow:0_1px_20px_rgba(0,0,0,0.95)]"
            />
          </div>
        </div>
      </div>

      {isMobile && (
        <div className="relative z-20 mx-auto max-w-[1200px] px-6 pb-24 pt-10">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <Link
                key={it.label}
                href={it.href ?? "#"}
                className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 font-mono text-[13px] transition-colors hover:border-green/50"
              >
                <span className="text-green">$ cd</span> <span className="text-white">{it.label}</span>
                <span className="mt-1 block text-[12px] text-text-dim">{it.caption}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Avatar mounts only after the reveal, so it never glitches over the
          loader or the still-settling cards. */}
      {revealed && (
        <CollapsibleAvatar
          name={name}
          title={title}
          summary={summary}
          onAsk={() => setAskOpen(true)}
        />
      )}
      <ChatPanel open={askOpen} onClose={() => setAskOpen(false)} />

      {!revealed && <FirstVisitLoader onReveal={onReveal} />}
      {/* Card-click loader flash (feedback that the click registered). */}
      {navLabel && <CubeLoaderScreen label={navLabel} />}
    </main>
  );
}
