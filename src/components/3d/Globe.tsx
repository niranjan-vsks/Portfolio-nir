"use client";

import dynamic from "next/dynamic";
import { TerminalLoader } from "@/components/ui/TerminalLoader";

// Real R3F blue-marble globe is ported in GlobeScene (Phase C/J). Lazy + ssr:false.
const GlobeScene = dynamic(() => import("@/components/3d/GlobeScene"), {
  ssr: false,
  loading: () => <TerminalLoader label="rendering_globe" />,
});

export function Globe() {
  return (
    <div className="relative h-full min-h-[360px] w-full overflow-hidden rounded-lg border border-border bg-bg">
      <GlobeScene />
      <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[11px] text-cyan">
        {`> location: Hyderabad, IN · remote-first, global`}
      </div>
    </div>
  );
}
