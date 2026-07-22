"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
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

// ---------------------------------------------------------------------------
// Flowchart-convention shapes: nodes are no longer identical rectangles. Their
// shape + icon + size follow what the node IS (terminal, gateway, data store,
// decision/guard, model, or a plain process), so the diagram reads as a real
// flow chart instead of a grid of boxes.
// ---------------------------------------------------------------------------
type Shape = "terminal" | "gateway" | "store" | "decision" | "model" | "process";

const SHAPE_META: Record<Shape, { icon: string; clip?: string; radius: number; width: number }> = {
  terminal: { icon: "◉", radius: 999, width: 158 }, // actors / clients / users (stadium)
  gateway: { icon: "⇆", clip: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)", radius: 6, width: 176 }, // LB / API gateway (parallelogram)
  store: { icon: "▤", radius: 6, width: 168 }, // databases / caches / indexes (with a cylinder cue bar)
  decision: { icon: "◆", clip: "polygon(14% 0, 86% 0, 100% 50%, 86% 100%, 14% 100%, 0 50%)", radius: 6, width: 182 }, // guardrails / veto / eval (hexagon)
  model: { icon: "✦", radius: 12, width: 168 }, // LLM / model endpoints
  process: { icon: "▷", radius: 8, width: 168 }, // default process
};

function roleOf(data: FlowNodeData): Shape {
  const t = `${data.label} ${data.primitive ?? ""}`.toLowerCase();
  if (/\b(user|users|citizen|citizens|client|engineer|support|customer|human)\b/.test(t)) return "terminal";
  if (/(load balancer|alb|front door|api management|apim|gateway|waf|ingress|networking)/.test(t)) return "gateway";
  if (/(database|db|store|graph|cache|redis|cosmos|mongo|postgres|s3|index|registry|event log|event store|events|queue|bus|memory|knowledge)/.test(t)) return "store";
  if (/(guard|guardrail|veto|risk|compliance|eval|rbac|safety|audit|policy)/.test(t)) return "decision";
  if (/(llm|bedrock|openai|model|generation|gemini|inference|rerank|re-rank)/.test(t)) return "model";
  return "process";
}

function RoleNode({ data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const plane = d.plane ?? "control";
  const color = PLANE_COLOR[plane];
  const shape = roleOf(d);
  const meta = SHAPE_META[shape];
  const isPolygon = Boolean(meta.clip);

  return (
    <div
      style={{
        width: meta.width,
        // hexagon/parallelogram need vertical breathing room so text clears the cut corners
        padding: isPolygon ? "14px 22px" : "9px 12px",
        borderRadius: meta.radius,
        clipPath: meta.clip,
        background: shape === "store"
          ? `linear-gradient(90deg, ${color}22 0 6px, #111317 6px)`
          : "#111317",
        border: `${selected ? 2 : 1.4}px solid ${color}`,
        color: "#e5e7eb",
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 11,
        lineHeight: 1.35,
        textAlign: "center",
        boxShadow: `0 0 0 1px ${color}18, 0 6px 18px -12px ${color}`,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ background: color, width: 6, height: 6, border: "none" }} />
      <span style={{ color, marginRight: 6 }}>{meta.icon}</span>
      <span>{d.label}</span>
      <Handle type="source" position={Position.Bottom} style={{ background: color, width: 6, height: 6, border: "none" }} />
    </div>
  );
}

const NODE_TYPES = { role: RoleNode };

export function FlowDiagram({
  nodes,
  edges,
  height = 460,
  title,
}: {
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  height?: number;
  title?: string;
}) {
  const [active, setActive] = useState<Set<Plane>>(
    new Set<Plane>(["data", "control", "observability"]),
  );
  const [hover, setHover] = useState<FlowNodeData | null>(null);
  // Click the diagram (or the expand button) to maximize it fullscreen.
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [expanded]);

  const styledNodes = useMemo<Node<FlowNodeData>[]>(
    () =>
      nodes.map((n) => {
        const plane = n.data.plane ?? "control";
        return {
          ...n,
          type: "role",
          hidden: !active.has(plane),
        };
      }),
    [nodes, active],
  );

  const styledEdges = useMemo<Edge[]>(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smoothstep",
        style: { stroke: "#4ade80", strokeWidth: 1.5, ...e.style },
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

  const frame = (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[120] bg-bg"
          : "relative rounded-lg border border-border bg-bg"
      }
      style={expanded ? undefined : { height }}
      title={expanded ? undefined : "click to expand fullscreen"}
    >
      <div className="absolute right-3 top-3 z-10 flex gap-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "close fullscreen diagram" : "expand diagram fullscreen"}
          className="rounded border border-green/40 bg-bg/90 px-2 py-1 font-mono text-[11px] text-green transition-colors hover:bg-green hover:text-bg"
        >
          {expanded ? "✕ close (esc)" : "⛶ fullscreen"}
        </button>
      </div>
      {expanded && title && (
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 font-mono text-[13px] text-text-dim">
          {title}
        </div>
      )}
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
        key={expanded ? "fullscreen" : "inline"}
        nodes={styledNodes}
        edges={styledEdges}
        nodeTypes={NODE_TYPES}
        fitView
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        onNodeMouseEnter={(_, n) => setHover(n.data as FlowNodeData)}
        onNodeMouseLeave={() => setHover(null)}
        onPaneClick={() => {
          if (!expanded) setExpanded(true);
        }}
        minZoom={0.4}
        maxZoom={expanded ? 2 : 1.5}
      >
        <Background color="#1f2937" gap={20} />
        <Controls showInteractive={false} className="!bg-surface" />
      </ReactFlow>
    </div>
  );

  return frame;
}
