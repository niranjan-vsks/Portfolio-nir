"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { TerminalLoader } from "@/components/ui/TerminalLoader";

// Lazy, ssr:false (bullseye/02 + 3d-performance rules).
const MindMap3D = dynamic(
  () => import("@/components/3d/mindmap/MindMap3D"),
  {
    ssr: false,
    loading: () => <TerminalLoader label="loading_map_mode" />,
  },
);

export default function MapPage() {
  return (
    <main className="h-screen w-screen overflow-hidden pt-12">
      <Suspense fallback={<TerminalLoader label="loading_map_mode" />}>
        <MindMap3D />
      </Suspense>
    </main>
  );
}
