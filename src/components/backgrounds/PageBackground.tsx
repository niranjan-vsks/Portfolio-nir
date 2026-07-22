"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { BackgroundCanvas } from "@/components/backgrounds/BackgroundCanvas";

const FlowWaveScene = dynamic(
  () => import("@/components/backgrounds/FlowWaveScene").then((m) => m.FlowWaveScene),
  { ssr: false },
);
const WaveGalaxyScene = dynamic(
  () => import("@/components/backgrounds/WaveGalaxyScene").then((m) => m.WaveGalaxyScene),
  { ssr: false },
);
const ParticleSphereScene = dynamic(
  () =>
    import("@/components/backgrounds/ParticleSphereScene").then(
      (m) => m.ParticleSphereScene,
    ),
  { ssr: false },
);

export type BackgroundVariant = "flow-wave" | "wave-galaxy" | "particle-sphere";

const CAMERA: Record<
  BackgroundVariant,
  { position: [number, number, number]; fov: number }
> = {
  "flow-wave": { position: [0, 7, 16], fov: 45 },
  "wave-galaxy": { position: [0, 2.5, 13], fov: 50 },
  "particle-sphere": { position: [0, 0, 12], fov: 45 },
};

// Static dark fallbacks (mobile + while JS loads): on-brand, never blank.
const FALLBACK_BG: Record<BackgroundVariant, string> = {
  "flow-wave":
    "radial-gradient(ellipse at 50% 120%, #06281a 0%, #02160c 45%, #050505 100%)",
  "wave-galaxy":
    "radial-gradient(ellipse at 50% 40%, #0a1838 0%, #060b1c 55%, #050505 100%)",
  "particle-sphere":
    "radial-gradient(ellipse at 50% 30%, #2a0b3d 0%, #11071f 55%, #050505 100%)",
};

function useIsMobile() {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

/**
 * The single heavy WebGL background for a page . Renders the static
 * gradient fallback on mobile; lazy-mounts the WebGL scene on desktop.
 */
export function PageBackground({ variant }: { variant: BackgroundVariant }) {
  const isMobile = useIsMobile();

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-20"
        style={{ background: FALLBACK_BG[variant] }}
        aria-hidden
      />
      {!isMobile && (
        <BackgroundCanvas camera={CAMERA[variant]}>
          {variant === "flow-wave" && <FlowWaveScene />}
          {variant === "wave-galaxy" && <WaveGalaxyScene />}
          {variant === "particle-sphere" && <ParticleSphereScene />}
        </BackgroundCanvas>
      )}
    </>
  );
}
