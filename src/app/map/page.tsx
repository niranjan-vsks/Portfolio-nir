import type { Metadata } from "next";
import { MindMapClient } from "@/components/sections/MindMapClient";
import { getMindmapGraph } from "@/lib/mindmapGraph";

export const metadata: Metadata = {
  title: "Mind Map",
  description:
    "Seven years of agentic AI and enterprise delivery as one interactive graph: projects, skills, employers, and reference architectures.",
};

export default function MindMapPage() {
  // Built server-side from the curated base + live content, so new projects,
  // tags, and capability pages grow the graph automatically.
  const graph = getMindmapGraph();
  return <MindMapClient graph={graph} />;
}
