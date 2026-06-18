import Image from "next/image";
import fs from "node:fs";
import path from "node:path";

/**
 * Signature visual per project (bullseye/04 + 06):
 *  - loop-copilot  -> macbook-scroll frame
 *  - saarthi       -> phone-mockup frame
 *  - others        -> static-architecture (rendered on /system-design)
 *
 * Screenshots are a human TODO (public/projects/<slug>.png). Until present we
 * render an on-brand device frame with a terminal placeholder so layout holds.
 */
function screenshotFor(slug: string): string | null {
  const rel = `projects/${slug}.png`;
  const abs = path.join(process.cwd(), "public", rel);
  return fs.existsSync(abs) ? `/${rel}` : null;
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg font-mono text-[12px] text-text-dim">
      <span className="text-green">{`> ${label}`}</span>
    </div>
  );
}

function Screen({ slug, label }: { slug: string; label: string }) {
  const src = screenshotFor(slug);
  if (src) {
    return (
      <Image
        src={src}
        alt={`${slug} screenshot`}
        fill
        className="object-cover object-top"
        sizes="(max-width: 768px) 100vw, 900px"
      />
    );
  }
  return <Placeholder label={label} />;
}

export function ProjectVisual({
  visual,
  slug,
}: {
  visual?: string;
  slug: string;
}) {
  if (visual === "macbook-scroll") {
    return (
      <div className="mb-12 flex flex-col items-center">
        <div className="w-full max-w-[820px] rounded-t-xl border border-border bg-surface p-2 shadow-2xl">
          <div className="mb-1.5 flex gap-1.5 px-1">
            <span className="h-2.5 w-2.5 rounded-full bg-magenta/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-cyan/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
          </div>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-border">
            <Screen slug={slug} label="loopcopilot.cc" />
          </div>
        </div>
        <div className="h-3 w-[88%] rounded-b-xl border border-t-0 border-border bg-border/40" />
      </div>
    );
  }

  if (visual === "phone-mockup") {
    return (
      <div className="mb-12 flex justify-center">
        <div className="w-[260px] rounded-[2.2rem] border-2 border-border bg-surface p-2.5 shadow-2xl">
          <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.6rem] border border-border">
            <Screen slug={slug} label="voice_copilot" />
          </div>
        </div>
      </div>
    );
  }

  // static-architecture and others: no device frame at the top of the page.
  return null;
}
