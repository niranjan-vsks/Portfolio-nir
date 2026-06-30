"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { TerminalLoader } from "@/components/ui/TerminalLoader";

const BrainIntro = dynamic(() => import("@/components/3d/brain/BrainIntro"), {
  ssr: false,
  loading: () => <TerminalLoader label="waking_the_network" />,
});
const MindMap3D = dynamic(() => import("@/components/3d/mindmap/MindMap3D"), {
  ssr: false,
  loading: () => <TerminalLoader label="loading_mind_map" />,
});

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
          <BrainIntro onComplete={() => setPhase("graph")} />
          <div className="pointer-events-none absolute inset-x-0 bottom-16 flex flex-col items-center gap-2 px-6 text-center">
            <p className="font-mono text-sm text-copper sm:text-base">
              {"> seven years of building, drawn as one mind"}
            </p>
            <p className="font-mono text-[11px] text-text-dim">
              click the brain to enter · or wait
            </p>
          </div>
        </>
      )}

      {phase === "graph" && (
        <div className="h-full w-full animate-[fadeIn_0.8s_ease]">
          <MindMap3D />
        </div>
      )}
    </main>
  );
}
