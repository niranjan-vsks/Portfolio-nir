"use client";

import { ContainerScroll } from "@/components/sections/ContainerScroll";
import { TerminalCard, type TerminalCardItem } from "@/components/ui/TerminalCard";

/**
 * Project page interactive body (PRD 6.11 + 6.5 + 6.4):
 *  - Container Scroll hero with the real screenshot (or a clean static device
 *    frame when none is provided yet — never a fabricated UI).
 *  - Terminal flip-card deck of the project narrative (project-page flip).
 */
export function ProjectShowcase({
  name,
  tagline,
  image,
  demo,
  cards,
}: {
  name: string;
  tagline: string;
  image?: string;
  demo?: string;
  cards: TerminalCardItem[];
}) {
  const screen = image ? (
    // eslint-disable-next-line @next/next/no-img-element -- served from a dynamic content route, not /public
    <img
      src={image}
      alt={`${name} screenshot`}
      className="h-full w-full object-cover object-left-top"
      draggable={false}
    />
  ) : (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_50%_30%,#0d2018_0%,#070b09_70%)] p-6 text-center">
      <span className="font-mono text-lg text-green">{name}</span>
      {demo && demo.startsWith("http") ? (
        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-green/50 px-3 py-1.5 font-mono text-[12px] text-green hover:bg-green hover:text-bg"
        >
          open live demo ↗
        </a>
      ) : (
        <span className="font-mono text-[12px] text-text-dim">{tagline}</span>
      )}
    </div>
  );

  return (
    <>
      <ContainerScroll
        titleComponent={
          <div className="pb-6">
            <h2 className="font-mono text-2xl font-semibold text-white sm:text-4xl">
              {name}
            </h2>
            <p className="mt-2 font-mono text-sm text-green">{tagline}</p>
          </div>
        }
      >
        {screen}
      </ContainerScroll>

      <section className="mx-auto -mt-24 max-w-3xl px-4 sm:-mt-40">
        <TerminalCard cards={cards} />
      </section>
    </>
  );
}
