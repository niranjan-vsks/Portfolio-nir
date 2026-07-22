"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SD_SECTIONS, type InterviewNotes, type SDSection } from "@/components/sections/systemDesignData";
import { useRouter } from "next/navigation";
import { TerminalLoader } from "@/components/ui/TerminalLoader";
import { MovingBorderButton } from "@/components/ui/MovingBorderButton";

const FlowDiagram = dynamic(
  () =>
    import("@/components/sections/FlowDiagram").then((m) => m.FlowDiagram),
  { ssr: false, loading: () => <TerminalLoader label="loading_diagram" /> },
);

// Tag chips route to the Mind Map , deep-linking straight to the
// matching node so the graph zooms into it on arrival .
const TAG_NODE: Record<string, string> = {
  graphrag: "skill_graphrag",
  "agentic rag": "skill_agentic_rag",
  reranking: "skill_reranking",
  "hybrid search": "skill_hybrid_search",
  "llm observability": "skill_llm_observability",
  "tenant-aware rbac": "skill_multi_tenant_rbac",
  "multi-crm shell": "skill_crm_integration",
  "multi-agent": "skill_multi_agent",
  "async api": "skill_fastapi",
  "tenant trust model": "skill_sso_oauth",
  "production rag": "skill_hybrid_search",
  "system design": "skill_system_design",
  mcp: "skill_mcp_servers",
};

function TagChips({ tags }: { tags: string[] }) {
  const router = useRouter();
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tags.map((t) => {
        const node = TAG_NODE[t.toLowerCase()];
        return (
          <MovingBorderButton
            key={t}
            onClick={() => router.push(node ? `/map?node=${node}` : "/map")}
          >
            {t}
          </MovingBorderButton>
        );
      })}
    </div>
  );
}

/**
 * Presentation-grade architecture render (official product
 * icons). Click (or the button) maximizes it fullscreen; Esc collapses.
 */
function ArchImage({ src, title }: { src: string; title: string }) {
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

  return (
    <div
      className={
        expanded
          ? "fixed inset-0 z-[120] flex items-center justify-center overflow-auto bg-bg p-6"
          : "relative mb-4 cursor-zoom-in overflow-hidden rounded-lg border border-border bg-[#0f172a]"
      }
      title={expanded ? undefined : "architecture diagram · click to expand fullscreen"}
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
      {/* eslint-disable-next-line @next/next/no-img-element -- large static render, natural size matters */}
      <img
        src={src}
        alt={`${title} architecture diagram`}
        loading="lazy"
        className={expanded ? "max-h-[94vh] w-auto max-w-[96vw] object-contain" : "w-full"}
      />
    </div>
  );
}

const INTERVIEW_BLOCKS: { key: keyof InterviewNotes; label: string; hover: string }[] = [
  { key: "functional", label: "functional requirements", hover: "What the system must do: the requirement set the architecture answers to." },
  { key: "nonFunctional", label: "non-functional requirements", hover: "Scale, reliability, security, and quality bars the design is held to." },
  { key: "capacity", label: "scale + capacity", hover: "Sizing, load assumptions, and where the system flexes under growth." },
  { key: "tradeoffs", label: "key tradeoffs", hover: "The calls that cost something, and why they were worth it." },
];

type ViewItem =
  | { id: string; label: string; kind: "image"; image: string }
  | { id: string; label: string; kind: "flow" };

/** Build the toggleable view list for a section from its data. */
function buildViews(s: SDSection): ViewItem[] {
  const views: ViewItem[] = [];
  if (s.image) {
    views.push({ id: "img1", label: s.imageLabel ?? "Architecture", kind: "image", image: s.image });
  }
  if (s.image2) {
    views.push({ id: "img2", label: s.image2Label ?? "Orchestration", kind: "image", image: s.image2 });
  }
  if (s.kind === "flow" && s.nodes && s.edges) {
    views.push({ id: "flow", label: s.flowLabel ?? "Interactive explorer", kind: "flow" });
  }
  return views;
}

/**
 * Toggleable architecture views: a segmented control switches between the
 * deployment/platform render, a second render (e.g. orchestration flow), and
 * the interactive explorer. Only the active view renders — no stacked boxes.
 */
function SectionViews({ section }: { section: SDSection }) {
  const views = buildViews(section);
  const [active, setActive] = useState(0);
  if (views.length === 0) return null;
  const view = views[Math.min(active, views.length - 1)];

  return (
    <div>
      {views.length > 1 && (
        <div className="mb-4 inline-flex rounded-lg border border-border/70 bg-surface/40 p-1 font-mono text-[12px]">
          {views.map((v, i) => (
            <button
              key={v.id}
              onClick={() => setActive(i)}
              className={`rounded-md px-3.5 py-1.5 transition-colors ${
                i === active ? "bg-green text-bg" : "text-text-dim hover:text-green"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      )}
      {view.kind === "image" ? (
        <ArchImage src={view.image} title={section.title} />
      ) : (
        section.nodes &&
        section.edges && (
          <FlowDiagram
            nodes={section.nodes}
            edges={section.edges}
            height={section.height ?? 520}
            title={section.title}
          />
        )
      )}
    </div>
  );
}

/** System-design-interview notes: FRs, NFRs, capacity, tradeoffs. */
function InterviewGrid({ notes }: { notes: InterviewNotes }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {INTERVIEW_BLOCKS.map(({ key, label, hover }) => (
        <div key={key} title={hover} className="rounded-lg border border-border/70 bg-surface/30 p-5">
          <h3 className="mb-3 font-mono text-[13px] uppercase tracking-wider text-green">
            {"> "}
            {label}
          </h3>
          <ul className="space-y-2">
            {notes[key].map((item) => (
              <li key={item} className="flex gap-2 text-[15.5px] leading-relaxed text-neutral-300">
                <span aria-hidden className="mt-[2px] text-cyan">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SystemDesignClient() {
  return (
    <div className="space-y-20">
      {SD_SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className="scroll-mt-20">
          <div className="mb-4 flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-[13px] text-text-dim">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="font-mono text-xl text-white">{s.title}</h2>
            <span className="rounded border border-cyan/40 px-2 py-0.5 font-mono text-[11px] text-cyan">
              {s.badge}
            </span>
            {s.projectHref && (
              <Link
                href={s.projectHref}
                className="font-mono text-[12px] text-green underline-offset-4 hover:underline"
              >
                project page →
              </Link>
            )}
          </div>
          <p className="mb-4 max-w-3xl text-[16.5px] leading-relaxed text-neutral-300">
            {s.intro}
          </p>
          <TagChips tags={s.tags} />
          <SectionViews section={s} />
          <p className="mt-2 font-mono text-[12px] text-text-dim/80">{s.caption}</p>
          <InterviewGrid notes={s.interview} />
        </section>
      ))}
    </div>
  );
}
