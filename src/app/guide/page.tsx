import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";

export const metadata: Metadata = {
  title: "Guide",
  description:
    "How to use this portfolio: section-by-section tips for the landing globe, mind map, projects, system design, the chatbot, and more.",
};

interface GuideSection {
  name: string;
  path: string;
  href: string;
  tips: string[];
}

/**
 * Portfolio usage tutorial. Meta/UI guidance (not portfolio copy), so it lives
 * here rather than the content loader. One terminal card per section with a few
 * plain-language tips and a link straight to it.
 */
const SECTIONS: GuideSection[] = [
  {
    name: "Home",
    path: "~/home.sh",
    href: "/",
    tips: [
      "Terminal cards orbit the globe; the one in the center is in focus.",
      "Hover any card to pause the rotation, then single-click the focused card to open it.",
      "Scroll sideways (or use the arrows) to spin the orbit yourself.",
      "The $ intro chevron shows or hides the heading.",
    ],
  },
  {
    name: "Mind Map",
    path: "~/map.sh",
    href: "/map",
    tips: [
      "Every node is a project, employer, skill, or capability; its color marks which.",
      "Click a node to open its page or focus its neighbourhood; hover to light up connections.",
      "Drag to orbit, scroll to zoom. Best experienced on a wider screen.",
    ],
  },
  {
    name: "Projects",
    path: "~/projects.sh",
    href: "/projects",
    tips: [
      "Grouped into Independent and Work. Click a card to open the full write-up.",
      "Each page carries the overview, key decisions, and the architecture behind it.",
    ],
  },
  {
    name: "System Design",
    path: "~/system-design.sh",
    href: "/system-design",
    tips: [
      "Reference architectures with the requirements and tradeoffs behind each call.",
      "Interactive diagrams use flowchart-convention node shapes; hover for detail.",
    ],
  },
  {
    name: "Forward Deployed",
    path: "~/forward-deployed.sh",
    href: "/forward-deployed",
    tips: [
      "Capability pages for how I ship into enterprises: RAG, observability, guardrails, cost, and more.",
      "Framed as how I would build it, reference-pattern, no client internals.",
    ],
  },
  {
    name: "Dashboard & Experience",
    path: "~/signal.sh",
    href: "/dashboard",
    tips: [
      "Dashboard is the signal at a glance; every number links to its source.",
      "Experience carries the FDE track record and the employer timeline, with inline links to related projects.",
    ],
  },
  {
    name: "ask_niranjan",
    path: "~/ask_niranjan.sh",
    href: "/chat",
    tips: [
      "Open the chatbot from the landing avatar or the ask_niranjan button. Ask about my work, decisions, and how I approach a build.",
      "It answers from real project content and will point you to the right page.",
      "Window controls are live: red closes, yellow minimizes to a pill, green maximizes.",
    ],
  },
  {
    name: "Search & Navigation",
    path: "~/nav.sh",
    href: "/contact",
    tips: [
      "Press / or click search to fuzzy-find any section, project, or skill.",
      "The top nav tucks away on its own; hover the top edge to bring it back.",
      "Home icon returns home, the arrow goes back to the previous page.",
    ],
  },
];

export default function GuidePage() {
  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="guide" title="How to use this portfolio">
        <p className="mb-10 max-w-2xl text-text-dim">
          A quick tour of what each section does and how to get the most out of it.
          Everything is one or two clicks away.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <div
              key={s.name}
              className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/70 shadow-2xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-800/80 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <span className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-2 truncate font-mono text-[12px] text-neutral-400">{s.path}</span>
              </div>
              <div className="p-5">
                <h2 className="font-mono text-[15px] font-semibold text-white">
                  <span className="text-green">$</span> {s.name}
                </h2>
                <ul className="mt-3 space-y-2">
                  {s.tips.map((t, i) => (
                    <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-neutral-300">
                      <span className="mt-[2px] shrink-0 text-green">▸</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={s.href}
                  className="mt-4 inline-block font-mono text-[12.5px] text-cyan transition-colors hover:text-green"
                >
                  {"> open"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    </>
  );
}
