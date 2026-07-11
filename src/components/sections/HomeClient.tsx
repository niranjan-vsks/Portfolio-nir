"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useState } from "react";
import { CollapsibleAvatar } from "@/components/sections/CollapsibleAvatar";
import type { OrbitItem } from "@/components/3d/globe/GlobeStage";
import { LayoutTextFlip } from "@/components/ui/LayoutTextFlip";
import { EncryptedText } from "@/components/ui/EncryptedText";
import { StepLoader } from "@/components/ui/StepLoader";
import { ChatPanel } from "@/components/sections/ChatPanel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const GlobeStage = dynamic(() => import("@/components/3d/globe/GlobeStage"), { ssr: false });

const ITEMS: OrbitItem[] = [
  { label: "Independent Projects", caption: "Loop Copilot, Saarthi, WealthOS", path: "projects.sh", href: "/projects" },
  { label: "Work Experience", caption: "Coforge, HPE, Mphasis", path: "experience.sh", href: "/experience" },
  { label: "Forward Deployed", caption: "how I ship into enterprises", path: "fde.sh", href: "/forward-deployed" },
  { label: "Mind Map", caption: "the whole system, one graph", path: "mindmap.sh", href: "/map" },
  { label: "System Design", caption: "how I would build it", path: "architecture.sh", href: "/system-design" },
  { label: "Dashboard", caption: "the signal at a glance", path: "dashboard.sh", href: "/dashboard" },
  { label: "About", caption: "seven years, one arc", path: "about.sh", href: "/about" },
  { label: "Contact", caption: "start a conversation", path: "contact.sh", href: "/contact" },
];

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
  const isMobile = useIsMobile();
  const [askOpen, setAskOpen] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const onGlobeReady = useCallback(() => setGlobeReady(true), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_40%,#060a16_0%,#03040a_60%,#000_100%)]">
      <StepLoader onDone={onGlobeReady} />

      {/* Unified stage: opaque earth + terminal cards orbiting it (in front of
          AND behind, occluded by the globe) in one 3D scene, over a dense
          starfield. Deferred until the loader finishes so its heavy init never
          starves the loader's own timers. */}
      {!isMobile && globeReady && (
        <div className="absolute inset-0 z-10 animate-[fadeIn_1.2s_ease]">
          <GlobeStage items={ITEMS} />
        </div>
      )}

      {/* heading — overlaid, non-blocking so the orbit cards stay clickable */}
      <div className="pointer-events-none relative z-20 mx-auto max-w-[1200px] px-6 pt-28 sm:pt-32">
        <LayoutTextFlip
          prefix="I ship"
          words={["agentic systems", "production RAG", "into real environments"]}
          className="text-4xl font-semibold leading-tight text-white sm:text-5xl [text-shadow:0_2px_30px_rgba(0,0,0,0.85)]"
          wordClassName="text-green"
        />
        <EncryptedText
          as="p"
          text={caption}
          className="mt-4 block max-w-xl text-[15px] leading-relaxed text-neutral-300 [text-shadow:0_1px_20px_rgba(0,0,0,0.95)]"
        />
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

      <CollapsibleAvatar name={name} title={title} summary={summary} onAsk={() => setAskOpen(true)} />
      <ChatPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </main>
  );
}
