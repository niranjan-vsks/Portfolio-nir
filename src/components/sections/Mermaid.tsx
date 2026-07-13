"use client";

import { useEffect, useRef, useState } from "react";

let initialized = false;

/**
 * Renders a Mermaid diagram in the dark/green lane (static diagrams,
 * bullseye/06). Click (or the fullscreen button) maximizes the diagram to
 * fill the screen; Esc or the close button collapses it back.
 */
export function Mermaid({ chart, hoverCaption }: { chart: string; hoverCaption?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const mermaid = (await import("mermaid")).default;
      if (!initialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          themeVariables: {
            background: "#0a0a0a",
            primaryColor: "#111317",
            primaryBorderColor: "#4ade80",
            primaryTextColor: "#e5e7eb",
            lineColor: "#00e5ff",
            fontFamily: "var(--font-jetbrains-mono), monospace",
          },
        });
        initialized = true;
      }
      try {
        const id = `mmd-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);
        if (active) setSvg(svg);
      } catch {
        if (active) setSvg("");
      }
    })();
    return () => {
      active = false;
    };
  }, [chart]);

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

  return (
    <div
      ref={ref}
      className={
        expanded
          ? "fixed inset-0 z-[120] flex items-center justify-center overflow-auto bg-bg p-8 [&_svg]:h-auto [&_svg]:max-h-[90vh] [&_svg]:w-auto [&_svg]:min-w-[60vw]"
          : "relative cursor-zoom-in overflow-x-auto rounded-lg border border-border bg-surface/40 p-4"
      }
      title={expanded ? undefined : (hoverCaption ?? "click to expand fullscreen")}
      onClick={() => {
        if (!expanded) setExpanded(true);
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        aria-label={expanded ? "close fullscreen diagram" : "expand diagram fullscreen"}
        className="absolute right-3 top-3 z-10 rounded border border-green/40 bg-bg/90 px-2 py-1 font-mono text-[11px] text-green transition-colors hover:bg-green hover:text-bg"
      >
        {expanded ? "✕ close (esc)" : "⛶ fullscreen"}
      </button>
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
