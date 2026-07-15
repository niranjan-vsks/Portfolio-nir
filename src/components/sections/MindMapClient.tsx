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
const StarfieldBackdrop = dynamic(() => import("@/components/backgrounds/StarfieldBackdrop"), { ssr: false });

const GUIDE_STEPS = [
  "Every node is a project, employer, skill or capability. Its color marks which of those it is.",
  "Click a node to open it: projects and capability pages route straight to their page.",
  "Hover a node to light up its neighbourhood, the parent it belongs to and the children it connects.",
  "Drag to orbit the graph, scroll to zoom, and use the on-screen controls to recenter.",
  "Arriving from a project tag or search drops you straight onto that exact node, already in focus.",
];

/**
 * Persistent heading + usage guide for the mind map (FINAL: the one section
 * that had no heading). Same visual language as the node description card,
 * a touch larger, pinned left, with a collapsible how-to.
 */
function MindMapGuide() {
  const [openHow, setOpenHow] = useState(false);
  return (
    <div className="pointer-events-none absolute left-4 top-16 z-20 w-[300px] max-w-[82vw] sm:left-6 sm:top-20">
      <div className="pointer-events-auto rounded-xl border border-green/30 bg-bg/85 p-4 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <h1 className="font-mono text-[16px] font-semibold text-green">Visual Knowledge Mind Map</h1>
        <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-300">
          Seven years of work as one connected graph: projects, skills, employers, and the capabilities that link them.
        </p>
        <p className="mt-2 font-mono text-[11.5px] text-cyan">zoom in for the best experience</p>

        <button
          onClick={() => setOpenHow((v) => !v)}
          aria-expanded={openHow}
          className="mt-3 flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 font-mono text-[12px] text-text-dim transition-colors hover:border-green/50 hover:text-green"
        >
          <span>how to use</span>
          <span className={`transition-transform ${openHow ? "rotate-90" : ""}`}>›</span>
        </button>
        {openHow && (
          <ol className="mt-2 space-y-2">
            {GUIDE_STEPS.map((s, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] leading-relaxed text-neutral-300">
                <span className="mt-px font-mono text-green">{i + 1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/**
 * Mind Map (PRD 6.2). Brain particle intro hands off to the react-force-graph
 * engine. On desktop the brain scatters/fades into the graph; on mobile and
 * reduced-motion we skip the morph and load the graph after a brief loader
 * (pre-authorized path, logged in STATE.md §5/R5).
 *
 * NOW_FIXES UX: the brain intro plays only on the FIRST /map visit of the
 * session, and never when arriving through a ?node= deep link (tag chips,
 * search) — the visitor's intent there is a specific node, not a cinematic.
 */
const BRAIN_SEEN_KEY = "brain-intro-seen";

/**
 * FINAL_SHOWDOWN intro contract:
 * - First-ever /map visit this session: brain intro, 4s auto-dissolve
 *   (whatever the entry point, including tag-chip / search deep links).
 * - Repeat visit FROM the landing Mind Map card (?intro=landing): brain
 *   intro again but fast (~1s auto-dissolve).
 * - Every other repeat navigation (keywords, nav, search): no intro.
 */
function brainPlan(): { show: boolean; autoMs: number } {
  try {
    const seen = sessionStorage.getItem(BRAIN_SEEN_KEY) === "1";
    const fromLanding =
      new URLSearchParams(window.location.search).get("intro") === "landing";
    if (!seen) return { show: true, autoMs: 4000 };
    if (fromLanding) return { show: true, autoMs: 1000 };
    return { show: false, autoMs: 0 };
  } catch {
    return { show: true, autoMs: 4000 };
  }
}

export function MindMapClient({ graph }: { graph?: unknown } = {}) {
  const reduced = useReducedMotion();
  const isMobile = useIsMobile();
  const [phase, setPhase] = useState<"brain" | "graph">("brain");
  // computed once on the client at first render (SSR falls back to default)
  const [plan] = useState(() =>
    typeof window === "undefined" ? { show: true, autoMs: 4000 } : brainPlan(),
  );

  useEffect(() => {
    if (isMobile || !plan.show) {
      const t = setTimeout(() => setPhase("graph"), isMobile ? 700 : 0);
      return () => clearTimeout(t);
    }
    try {
      sessionStorage.setItem(BRAIN_SEEN_KEY, "1");
    } catch {
      // storage unavailable: the intro just replays, which is harmless
    }
  }, [isMobile, plan.show]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(ellipse_at_50%_45%,#0a1a3a_0%,#060a18_55%,#04060f_100%)] pt-12">
      {phase === "brain" && !isMobile && (
        <>
          <BrainScene autoAdvanceMs={plan.autoMs} onComplete={() => setPhase("graph")} />
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
          {/* intense starfield ONLY behind the transparent graph — the plume
              was rejected too (AGain Fixes 2026-07-12): keep space, no effects */}
          <StarfieldBackdrop count={reduced ? 3000 : 7000} />
          <div className="relative z-10 h-full w-full">
            <MindMap3D data={graph as never} />
          </div>
          <MindMapGuide />
        </div>
      )}
    </main>
  );
}
