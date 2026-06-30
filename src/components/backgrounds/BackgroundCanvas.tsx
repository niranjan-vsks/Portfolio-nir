"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";

/**
 * Shared fixed-position background host for the one heavy WebGL effect on a page
 * (PRD 1.5). Pins behind content, caps DPR, and pauses the render loop when the
 * tab/canvas is not visible (frameloop="demand" is set per-scene via invalidate;
 * here we cap pixel ratio and keep the context lightweight).
 */
export function BackgroundCanvas({
  children,
  camera,
  className = "",
}: {
  children: ReactNode;
  camera?: { position?: [number, number, number]; fov?: number };
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 ${className}`}
      aria-hidden
    >
      <Canvas
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
        camera={{
          position: camera?.position ?? [0, 0, 12],
          fov: camera?.fov ?? 45,
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
