"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Dashboard dead-space fillers (PRD 15.1, R7): two interactive elements under
 * the metric cards — a domain-filterable skills/stack explorer (chips route to
 * mind-map nodes via /map?node=, others to /skills) and a status-filterable
 * projects list. All data flows in from the server page (content loader);
 * nothing hardcoded here beyond UI labels.
 */

export interface ExplorerSkill {
  label: string;
  group: string;
  node?: string; // mind-map node id when one exists
}

export interface ExplorerProject {
  name: string;
  slug: string;
  status: string;
  tagline: string;
}

const STATUS_COLOR: Record<string, string> = {
  live: "text-emerald-400 border-emerald-400/40",
  production: "text-emerald-400 border-emerald-400/40",
  piloting: "text-cyan-300 border-cyan-300/40",
  in_development: "text-amber-300 border-amber-300/40",
};

export function DashboardExplorer({
  skills,
  projects,
}: {
  skills: ExplorerSkill[];
  projects: ExplorerProject[];
}) {
  const router = useRouter();
  const groups = useMemo(() => [...new Set(skills.map((s) => s.group))], [skills]);
  const statuses = useMemo(() => [...new Set(projects.map((p) => p.status))], [projects]);
  const [group, setGroup] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const shownSkills = group ? skills.filter((s) => s.group === group) : skills;
  const shownProjects = status ? projects.filter((p) => p.status === status) : projects;

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-2">
      {/* skills / stack explorer */}
      <section>
        <h2 className="mb-4 font-mono text-lg text-green">{"> stack_explorer"}</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setGroup(null)}
            className={`rounded-full border px-3 py-1 font-mono text-[12px] transition-colors ${
              group === null ? "border-green bg-green/10 text-green" : "border-neutral-700 text-text-dim hover:text-green"
            }`}
          >
            all
          </button>
          {groups.map((g) => (
            <button
              key={g}
              onClick={() => setGroup(g === group ? null : g)}
              className={`rounded-full border px-3 py-1 font-mono text-[12px] transition-colors ${
                group === g ? "border-green bg-green/10 text-green" : "border-neutral-700 text-text-dim hover:text-green"
              }`}
            >
              {g.toLowerCase()}
            </button>
          ))}
        </div>
        <div className="flex max-h-56 flex-wrap content-start gap-2 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
          {shownSkills.map((s) => (
            <button
              key={`${s.group}-${s.label}`}
              onClick={() => router.push(s.node ? `/map?node=${encodeURIComponent(s.node)}` : "/skills")}
              title={s.node ? "open in mind map" : "open skills"}
              className="rounded border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[12px] text-neutral-300 transition-all hover:-translate-y-px hover:border-green/60 hover:text-green"
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* projects by status */}
      <section>
        <h2 className="mb-4 font-mono text-lg text-green">{"> projects_by_status"}</h2>
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setStatus(null)}
            className={`rounded-full border px-3 py-1 font-mono text-[12px] transition-colors ${
              status === null ? "border-green bg-green/10 text-green" : "border-neutral-700 text-text-dim hover:text-green"
            }`}
          >
            all
          </button>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st === status ? null : st)}
              className={`rounded-full border px-3 py-1 font-mono text-[12px] transition-colors ${
                status === st ? "border-green bg-green/10 text-green" : "border-neutral-700 text-text-dim hover:text-green"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {shownProjects.map((p) => (
            <Link
              key={p.slug}
              href={`/projects/${p.slug}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3 transition-colors hover:border-green/50"
            >
              <div className="min-w-0">
                <div className="truncate font-mono text-[13.5px] text-white">{p.name}</div>
                <div className="truncate text-[12.5px] text-text-dim">{p.tagline}</div>
              </div>
              <span
                className={`shrink-0 rounded border px-2 py-0.5 font-mono text-[10.5px] uppercase ${
                  STATUS_COLOR[p.status] ?? "text-neutral-300 border-neutral-600"
                }`}
              >
                {p.status.replace("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
