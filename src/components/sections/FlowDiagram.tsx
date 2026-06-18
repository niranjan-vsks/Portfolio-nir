"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export type Plane = "data" | "control" | "observability";

export interface FlowNodeData extends Record<string, unknown> {
  label: string;
  rationale?: string;
  plane?: Plane;
  primitive?: string; // generic primitive shown (e.g. "vector store", "message queue")
}

const PLANE_COLOR: Record<Plane, string> = {
  data: "#00e5ff",
  control: "#4ade80",
  observability: "#a78bfa",
};

const PLANES: { id: Plane; label: string }[] = [
  { id: "data", label: "data plane" },
  { id: "control", label: "control plane" },
  { id: "observability", label: "observability" },
];

export function FlowDiagram({
  nodes,
  edges,
  height = 460,
}: {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  height?: number;
}) {
  const [active, setActive] = useState<Set<Plane>>(
    new Set<Plane>(["data", "control", "observability"]),
  );
  const [hover, setHover] = useState<FlowNodeData | null>(null);

  const styledNodes = useMemo<Node<FlowNodeData>[]>(
    () =>
      nodes.map((n) => {
        const plane = n.data.plane ?? "control";
        const visible = active.has(plane);
        const color = PLANE_COLOR[plane];
        return {
          ...n,
          hidden: !visible,
          style: {
            background: "#111317",
            border: `1px solid ${color}`,
            borderRadius: 8,
            color: "#e5e7eb",
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            padding: "8px 10px",
            width: 168,
          },
        };
      }),
    [nodes, active],
  );

  const styledEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        ...e,
        style: { stroke: "#4ade80", strokeWidth: 1.4, ...e.style },
        labelStyle: { fill: "#9ca3af", fontFamily: "monospace", fontSize: 10 },
      })),
    [edges],
  );

  function toggle(p: Plane) {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  }

  return (
    <div className="relative rounded-lg border border-border bg-bg" style={{ height }}>
      <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        {PLANES.map((p) => (
          <button
            key={p.id}
            onClick={() => toggle(p.id)}
            className="rounded border px-2 py-1 font-mono text-[11px] transition-colors"
            style={{
              borderColor: PLANE_COLOR[p.id],
              color: active.has(p.id) ? "#0a0a0a" : PLANE_COLOR[p.id],
              background: active.has(p.id) ? PLANE_COLOR[p.id] : "transparent",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {hover?.rationale && (
        <div className="absolute bottom-3 left-3 z-10 max-w-md rounded border border-green/40 bg-bg/95 p-3 font-mono text-[11px] text-text-dim">
          <span className="text-green">{`> ${hover.label}`}</span>
          {hover.primitive && (
            <span className="ml-2 text-cyan">[{hover.primitive}]</span>
          )}
          <p className="mt-1 leading-relaxed">{hover.rationale}</p>
        </div>
      )}

      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeMouseEnter={(_, n) => setHover(n.data as FlowNodeData)}
        onNodeMouseLeave={() => setHover(null)}
        minZoom={0.4}
        maxZoom={1.5}
      >
        <Background color="#1f2937" gap={20} />
        <Controls showInteractive={false} className="!bg-surface" />
      </ReactFlow>
    </div>
  );
}
