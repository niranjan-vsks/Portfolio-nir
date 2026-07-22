import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9-]+$/;
const FILE_RE = /^[a-zA-Z0-9._-]+\.(png|webp|jpe?g)$/;
const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/**
 * Serves project screenshots that live in portfolio-assets/content/projects/
 * <slug>/  — they are outside /public, so Next can't serve them
 * directly. Strict slug/file validation prevents path traversal.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; file: string }> },
) {
  const { slug, file } = await params;
  const decoded = decodeURIComponent(file);
  if (!SLUG_RE.test(slug) || !FILE_RE.test(decoded)) {
    return new Response("not found", { status: 404 });
  }
  const abs = path.join(
    process.cwd(),
    "portfolio-assets",
    "content",
    "projects",
    slug,
    decoded,
  );
  if (!fs.existsSync(abs)) return new Response("not found", { status: 404 });
  const buf = fs.readFileSync(abs);
  const type = TYPES[path.extname(decoded).toLowerCase()] ?? "application/octet-stream";
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600" },
  });
}
