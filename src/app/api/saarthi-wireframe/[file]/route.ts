import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const FILE_RE = /^[a-zA-Z0-9._-]+\.(png|webp|jpe?g)$/;
const TYPES: Record<string, string> = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

/**
 * Serves Saarthi wireframe screens from
 * portfolio-assets/content/projects/saarthi/wireframes/. The directory is read
 * live per request, so dropping refreshed wireframes into that folder makes
 * them appear on the site with no code change (auto-update pipeline).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const decoded = decodeURIComponent(file);
  if (!FILE_RE.test(decoded)) return new Response("not found", { status: 404 });
  const abs = path.join(
    process.cwd(),
    "portfolio-assets",
    "content",
    "projects",
    "saarthi",
    "wireframes",
    decoded,
  );
  if (!fs.existsSync(abs)) return new Response("not found", { status: 404 });
  const buf = fs.readFileSync(abs);
  const type = TYPES[path.extname(decoded).toLowerCase()] ?? "application/octet-stream";
  return new Response(new Uint8Array(buf), {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=300" },
  });
}
