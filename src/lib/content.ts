import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Content loader (bullseye/07). Single source of truth lives in
 * portfolio-assets/content/. The site renders from these files and the
 * chatbot RAG embeds the same files. Never hardcode page copy in components.
 */

const CONTENT_ROOT = path.join(process.cwd(), "portfolio-assets", "content");

marked.setOptions({ gfm: true, breaks: false });

export interface ContentDoc<T = Record<string, unknown>> {
  slug: string;
  frontmatter: T;
  body: string; // raw markdown
  html: string; // rendered html
}

export interface ProjectFrontmatter {
  title: string;
  public_name?: string;
  slug: string;
  status?: string;
  demo?: string;
  tagline?: string;
  stack?: string[];
  metric?: string;
  signature_visual?: string;
  order?: number;
}

export interface ExperienceFrontmatter {
  title?: string;
  employer?: string;
  slug?: string;
  role?: string;
  period?: string;
  order?: number;
  [key: string]: unknown;
}

export interface SystemDesignFrontmatter {
  title?: string;
  slug?: string;
  project?: string;
  interactive?: boolean;
  order?: number;
  [key: string]: unknown;
}

function readDoc<T>(absPath: string): ContentDoc<T> {
  const raw = fs.readFileSync(absPath, "utf8");
  const { data, content } = matter(raw);
  const slug =
    (data as Record<string, unknown>).slug?.toString() ??
    path.basename(absPath, ".md");
  return {
    slug,
    frontmatter: data as T,
    body: content,
    html: marked.parse(content) as string,
  };
}

function listMd(dir: string): string[] {
  const abs = path.join(CONTENT_ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(abs, f));
}

/** Top-level section: hero, about, skills, contact. */
export function getSection(name: string): ContentDoc | null {
  const abs = path.join(CONTENT_ROOT, `${name}.md`);
  if (!fs.existsSync(abs)) return null;
  return readDoc(abs);
}

export function getProject(slug: string): ContentDoc<ProjectFrontmatter> | null {
  const abs = path.join(CONTENT_ROOT, "projects", `${slug}.md`);
  if (!fs.existsSync(abs)) return null;
  return readDoc<ProjectFrontmatter>(abs);
}

export function getAllProjects(): ContentDoc<ProjectFrontmatter>[] {
  return listMd("projects")
    .map((p) => readDoc<ProjectFrontmatter>(p))
    .sort(
      (a, b) => (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99),
    );
}

export function getExperience(
  slug: string,
): ContentDoc<ExperienceFrontmatter> | null {
  const abs = path.join(CONTENT_ROOT, "experience", `${slug}.md`);
  if (!fs.existsSync(abs)) return null;
  return readDoc<ExperienceFrontmatter>(abs);
}

export function getAllExperience(): ContentDoc<ExperienceFrontmatter>[] {
  return listMd("experience")
    .map((p) => readDoc<ExperienceFrontmatter>(p))
    .sort(
      (a, b) => (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99),
    );
}

export function getSystemDesign(
  slug: string,
): ContentDoc<SystemDesignFrontmatter> | null {
  const abs = path.join(CONTENT_ROOT, "system-design", `${slug}.md`);
  if (!fs.existsSync(abs)) return null;
  return readDoc<SystemDesignFrontmatter>(abs);
}

export function getAllSystemDesign(): ContentDoc<SystemDesignFrontmatter>[] {
  return listMd("system-design")
    .map((p) => readDoc<SystemDesignFrontmatter>(p))
    .sort(
      (a, b) => (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99),
    );
}

/**
 * Interview corpus: the highest-value chatbot retrieval source (bullseye/07).
 * May contain TODO(niranjan) placeholders until he fills his first-person voice.
 */
export function getInterviewCorpus(): ContentDoc[] {
  return listMd("interview").map((p) => readDoc(p));
}

/** Every content doc flattened: used by the RAG ingestion (bullseye/08). */
export function getAllContentDocs(): { source: string; doc: ContentDoc }[] {
  const out: { source: string; doc: ContentDoc }[] = [];
  const top = ["hero", "about", "skills", "contact"];
  for (const t of top) {
    const d = getSection(t);
    if (d) out.push({ source: `${t}.md`, doc: d });
  }
  for (const dir of ["projects", "experience", "system-design", "interview"]) {
    for (const p of listMd(dir)) {
      out.push({ source: `${dir}/${path.basename(p)}`, doc: readDoc(p) });
    }
  }
  return out;
}
