"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { PhotoCard3D } from "@/components/sections/PhotoCard3D";
import { HubCards, type HubItem } from "@/components/sections/HubCards";
import { DashboardPreview } from "@/components/sections/DashboardPreview";
import { LayoutTextFlip } from "@/components/ui/LayoutTextFlip";
import { EncryptedText } from "@/components/ui/EncryptedText";
import { ChatPanel } from "@/components/sections/ChatPanel";
import { TerminalLoader } from "@/components/ui/TerminalLoader";

// Globe = the only WebGL on Home (PRD 6.1). Lazy, desktop framing.
const GlobeCanvas = dynamic(() => import("@/components/3d/globe/GlobeCanvas"), {
  ssr: false,
  loading: () => <TerminalLoader label="rendering_globe" />,
});

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
  const [askOpen, setAskOpen] = useState(false);

  const items: HubItem[] = [
    { key: "independent", label: "Independent Projects", caption: "Loop Copilot, Saarthi, Rebalancer", cmd: "cd ~/projects", href: "/projects" },
    { key: "work", label: "Work Experience", caption: "Coforge, HPE, Mphasis", cmd: "cd ~/experience", href: "/about#experience" },
    { key: "mindmap", label: "Mind Map", caption: "the whole system, one graph", cmd: "open mind-map", href: "/map" },
    { key: "system", label: "System Design", caption: "how I would build it", cmd: "cat architectures", href: "/system-design" },
    { key: "dashboard", label: "Dashboard", caption: "the signal at a glance", cmd: "open dashboard", href: "/dashboard" },
    { key: "about", label: "About", caption: "seven years, one arc", cmd: "whoami", href: "/about" },
    { key: "contact", label: "Contact", caption: "start a conversation", cmd: "mail niranjan", href: "/contact" },
    { key: "ask", label: "ask_niranjan", caption: "interview the work directly", cmd: "./ask_niranjan", onClick: () => setAskOpen(true) },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Globe background (black space + earth + stars) */}
      <div className="pointer-events-auto absolute inset-0 -z-10 hidden md:block">
        <GlobeCanvas />
      </div>
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_60%_40%,#0a1838_0%,#050505_60%)] md:hidden" />

      <div className="mx-auto max-w-[1200px] px-5 pb-20 pt-24 sm:pt-28">
        {/* Hero row: photo card + heading */}
        <div className="grid items-center gap-10 lg:grid-cols-[340px_1fr]">
          <PhotoCard3D name={name} title={title} summary={summary} />

          <div>
            <LayoutTextFlip
              prefix="I ship"
              words={["agentic systems", "production RAG", "into real environments"]}
              className="font-mono text-3xl font-semibold leading-tight text-white sm:text-4xl"
              wordClassName="text-green"
            />
            <EncryptedText
              as="p"
              text={caption}
              className="mt-5 block max-w-xl font-mono text-[13px] leading-relaxed text-text-dim"
            />
          </div>
        </div>

        {/* Hub portal cards */}
        <div className="mt-16">
          <p className="mb-4 font-mono text-[12px] text-text-dim">{"> where do you want to go?"}</p>
          <HubCards items={items} />
        </div>

        {/* Dashboard preview */}
        <div className="mt-16 flex justify-center lg:justify-start">
          <DashboardPreview />
        </div>
      </div>

      <ChatPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </main>
  );
}
