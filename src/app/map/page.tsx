import type { Metadata } from "next";
import { MindMapClient } from "@/components/sections/MindMapClient";

export const metadata: Metadata = {
  title: "Mind Map",
  description:
    "Seven years of agentic AI and enterprise delivery as one interactive graph: projects, skills, employers, and reference architectures.",
};

export default function MindMapPage() {
  return <MindMapClient />;
}
