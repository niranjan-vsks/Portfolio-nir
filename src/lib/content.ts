import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

/**
 * Content loader . Single source of truth lives in
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
  tags?: string[];
  metric?: string;
  signature_visual?: string;
  group?: string;
  order?: number;
  results_pending?: boolean; // renders the designed "results publishing shortly" block
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

const PROJECTS_ROOT = path.join(CONTENT_ROOT, "projects");

// Single real path (locked): each project is a folder
// content/projects/<slug>/<slug>.md, alongside its screenshots/assets.
function projectFile(slug: string): string {
  return path.join(PROJECTS_ROOT, slug, `${slug}.md`);
}

// Every project's content file, one per folder.
function listProjectFiles(): { slug: string; file: string }[] {
  if (!fs.existsSync(PROJECTS_ROOT)) return [];
  return fs
    .readdirSync(PROJECTS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => ({ slug: e.name, file: projectFile(e.name) }))
    .filter((p) => fs.existsSync(p.file));
}

/** Top-level section: hero, about, skills, contact. */
export function getSection(name: string): ContentDoc | null {
  const abs = path.join(CONTENT_ROOT, `${name}.md`);
  if (!fs.existsSync(abs)) return null;
  return readDoc(abs);
}

export function getProject(slug: string): ContentDoc<ProjectFrontmatter> | null {
  const abs = projectFile(slug);
  if (!fs.existsSync(abs)) return null;
  return readDoc<ProjectFrontmatter>(abs);
}

export function getAllProjects(): ContentDoc<ProjectFrontmatter>[] {
  return listProjectFiles()
    .map((p) => readDoc<ProjectFrontmatter>(p.file))
    // skip empty / frontmatter-less files so a stray file never crashes a build
    .filter((d) => d.frontmatter.title || d.frontmatter.public_name)
    .sort(
      (a, b) => (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99),
    );
}

/**
 * Screenshot/image files dropped into a project folder . They live
 * in content/, not public/, so they are served via /api/project-image/<slug>/.
 * Returns web URLs, or [] if none yet (page shows the clean framed placeholder).
 */
export function getProjectImages(slug: string): string[] {
  const dir = path.join(PROJECTS_ROOT, slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
    .sort()
    .map((f) => `/api/project-image/${slug}/${encodeURIComponent(f)}`);
}

/**
 * Saarthi wireframe screens, read live from the project's wireframes/ folder.
 * Dropping refreshed wireframes into that folder updates the site with no code
 * change . Served via /api/saarthi-wireframe.
 */
export function getSaarthiWireframes(): string[] {
  const dir = path.join(PROJECTS_ROOT, "saarthi", "wireframes");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(png|webp|jpe?g)$/i.test(f))
    .sort()
    .map((f) => `/api/saarthi-wireframe/${encodeURIComponent(f)}`);
}

export interface ContentSection {
  title: string;
  html: string;
}

/** Split a project/experience body into H2 sections, each rendered to HTML. */
export function splitSections(body: string): ContentSection[] {
  const parts = body.split(/^##\s+/m).filter((s) => s.trim());
  return parts.map((part) => {
    const nl = part.indexOf("\n");
    const title = (nl === -1 ? part : part.slice(0, nl)).trim();
    const rest = nl === -1 ? "" : part.slice(nl + 1);
    return { title, html: marked.parse(rest) as string };
  });
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

export interface FdeFrontmatter {
  title: string;
  slug: string;
  order?: number;
  caption?: string;
  back?: string;
  tags?: { label: string; node: string }[];
}

/** FDE capability sections : /forward-deployed hub + pages. */
export function getFdeSection(slug: string): ContentDoc<FdeFrontmatter> | null {
  const abs = path.join(CONTENT_ROOT, "fde", `${slug}.md`);
  if (!fs.existsSync(abs)) return null;
  return readDoc<FdeFrontmatter>(abs);
}

export function getAllFdeSections(): ContentDoc<FdeFrontmatter>[] {
  return listMd("fde")
    .map((p) => readDoc<FdeFrontmatter>(p))
    .sort((a, b) => (a.frontmatter.order ?? 99) - (b.frontmatter.order ?? 99));
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
 * Interview corpus: the highest-value chatbot retrieval source .
 * May contain TODO(niranjan) placeholders until he fills his first-person voice.
 */
export function getInterviewCorpus(): ContentDoc[] {
  return listMd("interview").map((p) => readDoc(p));
}

/** Every content doc flattened: used by the RAG ingestion . */
export function getAllContentDocs(): { source: string; doc: ContentDoc }[] {
  const out: { source: string; doc: ContentDoc }[] = [];
  const top = ["hero", "about", "skills", "contact"];
  for (const t of top) {
    const d = getSection(t);
    if (d) out.push({ source: `${t}.md`, doc: d });
  }
  for (const { slug, file } of listProjectFiles()) {
    out.push({ source: `projects/${slug}/${slug}.md`, doc: readDoc(file) });
  }
  for (const dir of ["experience", "system-design", "interview"]) {
    for (const p of listMd(dir)) {
      out.push({ source: `${dir}/${path.basename(p)}`, doc: readDoc(p) });
    }
  }
  return out;
}
