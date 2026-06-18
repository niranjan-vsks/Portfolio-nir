"use client";

import { useEffect, useRef, useState } from "react";

let initialized = false;

/** Renders a Mermaid diagram in the dark/green lane (static diagrams, bullseye/06). */
export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

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

  return (
    <div
      ref={ref}
      className="overflow-x-auto rounded-lg border border-border bg-surface/40 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
