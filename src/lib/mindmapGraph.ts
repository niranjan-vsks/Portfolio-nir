import curated from "@data/mindmap-data.json";
import { getAllProjects, getAllFdeSections } from "@/lib/content";

/**
 * Self-improving mind map (FINAL_SHOWDOWN).
 *
 * The curated graph (content/data/mindmap-data.json) is the authored base:
 * root, domains, employers, and hand-tuned skill nodes with descriptions and
 * colors. This builder then reads the live content — every project's tags and
 * every forward-deployed capability page — and GROWS the graph automatically:
 * a new project markdown, a new tag, or a new capability page shows up as
 * nodes and edges with no hand-editing of the JSON. Curated nodes always win
 * on their authored fields; derivation only ADDS what is missing.
 */

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  type: string;
  val: number;
  color: string;
  description?: string;
  href?: string;
}
export interface GraphLink {
  source: string;
  target: string;
}
export interface MindmapGraph {
  _meta?: unknown;
  nodes: GraphNode[];
  links: GraphLink[];
}

const SKILL_COLOR = "#E5E7EB";
const FDE_COLOR = "#A78BFA";

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function getMindmapGraph(): MindmapGraph {
  const base = curated as unknown as MindmapGraph;
  const nodes: GraphNode[] = base.nodes.map((n) => ({ ...n }));
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const linkSet = new Set(base.links.map((l) => `${l.source}->${l.target}`));
  const links: GraphLink[] = base.links.map((l) => ({ ...l }));

  const addNode = (n: GraphNode) => {
    if (byId.has(n.id)) return byId.get(n.id)!;
    byId.set(n.id, n);
    nodes.push(n);
    return n;
  };
  const addLink = (source: string, target: string) => {
    if (source === target) return;
    if (!byId.has(source) || !byId.has(target)) return;
    const k = `${source}->${target}`;
    const rk = `${target}->${source}`;
    if (linkSet.has(k) || linkSet.has(rk)) return;
    linkSet.add(k);
    links.push({ source, target });
  };

  // Index existing skill nodes for tag → node resolution.
  const skillNodes = nodes.filter((n) => n.type === "skill");
  const resolveSkill = (tag: string): string | undefined => {
    const t = norm(tag);
    if (!t) return undefined;
    for (const n of skillNodes) {
      const l = norm(n.label);
      if (l === t) return n.id;
    }
    for (const n of skillNodes) {
      const l = norm(n.label);
      if (l.includes(t) && t.length >= 4) return n.id;
      if (t.includes(l) && l.length >= 4) return n.id;
    }
    return undefined;
  };

  // Match an existing project node by its /projects/<slug> href.
  const projectNodeBySlug = new Map<string, GraphNode>();
  for (const n of nodes) {
    if (n.type === "project" && n.href) {
      const m = n.href.match(/\/projects\/([a-z0-9-]+)/);
      if (m) projectNodeBySlug.set(m[1], n);
    }
  }

  const hasFdeDomain = byId.has("domain_fde");

  // --- Projects: ensure a node + tag-derived skill edges -------------------
  for (const p of getAllProjects()) {
    const slug = (p.frontmatter.slug as string) ?? p.slug;
    let node = projectNodeBySlug.get(slug);
    if (!node) {
      const label = (p.frontmatter.public_name as string) ?? (p.frontmatter.title as string) ?? slug;
      node = addNode({
        id: `proj_${norm(slug)}`,
        label,
        group: "project",
        type: "project",
        val: 9,
        color: "#4ADE80",
        description: (p.frontmatter.tagline as string) ?? undefined,
        href: `/projects/${slug}`,
      });
      addLink("root", node.id);
      projectNodeBySlug.set(slug, node);
    }

    // Resolve stack techs to existing skill nodes (links only, no new nodes,
    // to keep low-level libraries from cluttering the graph).
    for (const tech of p.frontmatter.stack ?? []) {
      const skillId = resolveSkill(tech);
      if (skillId) addLink(node.id, skillId);
    }

    const tags = p.frontmatter.tags ?? [];
    for (const tag of tags) {
      const skillId = resolveSkill(tag);
      if (skillId) {
        addLink(node.id, skillId);
      } else {
        // A new conceptual tag with no curated skill: surface it as a node.
        const id = `skill_kw_${norm(tag)}`;
        addNode({
          id,
          label: tag,
          group: "auto",
          type: "skill",
          val: 4,
          color: SKILL_COLOR,
          description: `${tag} — surfaced from ${node.label}.`,
        });
        skillNodes.push(byId.get(id)!);
        addLink(node.id, id);
      }
    }
  }

  // --- Forward-deployed capability pages -----------------------------------
  for (const f of getAllFdeSections()) {
    const slug = f.frontmatter.slug ?? f.slug;
    const id = `fde_${norm(slug)}`;
    if (!byId.has(id)) {
      addNode({
        id,
        label: f.frontmatter.title ?? slug,
        group: "fde",
        type: "skill",
        val: 5,
        color: FDE_COLOR,
        description: f.frontmatter.caption ?? undefined,
        href: `/forward-deployed/${slug}`,
      });
    }
    addLink(hasFdeDomain ? "domain_fde" : "root", id);
  }

  return { _meta: base._meta, nodes, links };
}
