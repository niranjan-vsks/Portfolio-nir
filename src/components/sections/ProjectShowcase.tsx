import type { TerminalCardItem } from "@/components/ui/TerminalCard";

/**
 * Project page body : the narrative reads DIRECTLY on
 * the page — no boxed terminal deck, no Container Scroll frame (banned outside
 * Saarthi per PRD 13.4) — at a readable size. Extra screenshots keep their
 * lightbox-style gallery.
 */
export function ProjectShowcase({
  name,
  images = [],
  cards,
}: {
  name: string;
  tagline: string;
  images?: string[];
  demo?: string;
  cards: TerminalCardItem[];
}) {
  const gallery = images.slice(1);

  return (
    <>
      <section className="mt-12 max-w-3xl space-y-10">
        {cards.map((c) => {
          // card titles arrive as "<project name> · <section>"; the page
          // already names the project, so the heading is just the section
          const title = c.title.split(" · ").slice(-1)[0];
          return (
            <div key={c.title}>
              <h2 className="mb-3 font-mono text-xl text-green">{`> ${title.toLowerCase()}`}</h2>
              <div
                className="prose-nir text-[17px] leading-[1.75] [&_li]:text-[16.5px] [&_li]:text-neutral-300 [&_p]:text-[17px] [&_p]:text-neutral-300"
                dangerouslySetInnerHTML={{ __html: c.html }}
              />
            </div>
          );
        })}
      </section>

      {gallery.length > 0 && (
        <section className="mt-16 max-w-4xl">
          <h3 className="mb-4 font-mono text-sm text-green">{"> screens"}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-lg border border-green/20 bg-surface/40 transition-colors hover:border-green/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- served from a dynamic content route, not /public */}
                <img
                  src={src}
                  alt={`${name} screen ${i + 2}`}
                  loading="lazy"
                  className="w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
