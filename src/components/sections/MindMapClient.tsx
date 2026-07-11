"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { TerminalLoader } from "@/components/ui/TerminalLoader";

const BrainScene = dynamic(() => import("@/components/3d/brain/BrainScene"), {
  ssr: false,
  loading: () => <TerminalLoader label="waking_the_network" />,
});
const MindMap3D = dynamic(() => import("@/components/3d/mindmap/MindMap3D"), {
  ssr: false,
  loading: () => <TerminalLoader label="loading_mind_map" />,
});
const PlumeBackdrop = dynamic(() => import("@/components/3d/plume/PlumeBackdrop"), { ssr: false });

/**
 * Mind Map (PRD 6.2). Brain particle intro hands off to the react-force-graph
 * engine. On desktop the brain scatters/fades into the graph; on mobile and
 * reduced-motion we skip the morph and load the graph after a brief loader
 * (pre-authorized path, logged in STATE.md §5/R5).
 */
export function MindMapClient() {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<"brain" | "graph">("brain");

  useEffect(() => {
    if (isMobile) {
      const t = setTimeout(() => setPhase("graph"), 700);
      return () => clearTimeout(t);
    }
  }, [isMobile]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#0a1a3a_0%,#060a18_55%,#04060f_100%)] pt-12">
      {phase === "brain" && !isMobile && (
        <>
          <BrainScene onComplete={() => setPhase("graph")} />
          <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-base font-medium text-[#9fc4ff] sm:text-lg [text-shadow:0_2px_20px_rgba(0,0,0,0.8)]">
              Seven years of building, drawn as one mind.
            </p>
            <p className="font-mono text-[12px] text-text-dim">
              click to enter, or wait
            </p>
          </div>
        </>
      )}

      {phase === "graph" && (
        <div className="absolute inset-0 animate-[fadeIn_0.8s_ease]">
          {/* subtle plume (left) + starfield behind the transparent graph —
              replaces the glaring plasma burst (Right_Now fixes 2026-07-11);
              static frame on mobile / reduced-motion */}
          <PlumeBackdrop staticFrame={isMobile || reduced} />
          <div className="relative z-10 h-full w-full">
            <MindMap3D />
          </div>
        </div>
      )}
    </main>
  );
}
