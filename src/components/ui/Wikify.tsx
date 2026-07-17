import { Fragment } from "react";
import { WikiLink } from "@/components/ui/WikiLink";

/**
 * Wikipedia-style inline linking (PRD 11.1): scans plain prose for known
 * project names / click-worthy keywords and renders them as WikiLink
 * hyperlinks with the hover caption dialog. Server-safe; longest match wins.
 */
const LINKS: { pattern: RegExp; href: string; caption: string }[] = [
  { pattern: /AI-Infused (?:Agentic )?QE Platform|quality[- ]engineering platform/i, href: "/projects/qe-platform", caption: "Click to explore this project in detail" },
  { pattern: /WealthOS/, href: "/projects/wealthos", caption: "Click to explore this project in detail" },
  { pattern: /Loop Copilot/, href: "/projects/loop-copilot", caption: "Click to explore this project in detail" },
  { pattern: /Saarthi/, href: "/projects/saarthi", caption: "Click to explore this project in detail" },
  { pattern: /National Census Digital Assistant/, href: "/projects/global-census-chatbot", caption: "Click to explore this project in detail" },
  { pattern: /Financial Risk (?:&|and) Fraud Intelligence/, href: "/projects/mphasis-ml-risk", caption: "Click to explore this project in detail" },
  { pattern: /conversational (?:system|RAG)/i, href: "/projects/hpe-rag-chatbot", caption: "Click to explore this project in detail" },
  { pattern: /GraphRAG/, href: "/map?node=skill_graphrag", caption: "See GraphRAG in the Mind Map" },
  { pattern: /system design/i, href: "/system-design", caption: "Architectures, requirements, and tradeoffs" },
];

export function Wikify({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    let best: { index: number; match: string; href: string; caption: string } | null = null;
    for (const l of LINKS) {
      const m = rest.match(l.pattern);
      if (m && m.index !== undefined && (!best || m.index < best.index)) {
        best = { index: m.index, match: m[0], href: l.href, caption: l.caption };
      }
    }
    if (!best) {
      nodes.push(<Fragment key={key++}>{rest}</Fragment>);
      break;
    }
    if (best.index > 0) nodes.push(<Fragment key={key++}>{rest.slice(0, best.index)}</Fragment>);
    nodes.push(
      <WikiLink key={key++} href={best.href} caption={best.caption}>
        {best.match}
      </WikiLink>,
    );
    rest = rest.slice(best.index + best.match.length);
  }
  return <>{nodes}</>;
}
