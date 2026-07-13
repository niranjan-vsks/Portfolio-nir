import { PRODUCT_SECTIONS } from "./productData";

/**
 * Product-thinking section (FINAL_SHOWDOWN): terminal-style cards (JTBD,
 * prioritization, success metrics, SWOT, value prop) for Saarthi, Loop
 * Copilot and the QE platform. Renders nothing for other slugs.
 */
export function ProductSection({ slug }: { slug: string }) {
  const spec = PRODUCT_SECTIONS[slug];
  if (!spec) return null;

  return (
    <section className="mt-16 max-w-4xl">
      <h2 className="mb-3 font-mono text-xl text-green">{"> product"}</h2>
      <p className="mb-6 max-w-3xl text-[17px] leading-[1.75] text-neutral-300">{spec.intro}</p>

      <div className="grid gap-4 md:grid-cols-2">
        {spec.cards.map((card) => (
          <div
            key={card.title}
            className="overflow-hidden rounded-xl border border-green/20 bg-surface/70 backdrop-blur-sm transition-colors hover:border-green/45"
          >
            {/* terminal chrome */}
            <div className="flex items-center gap-2 border-b border-white/8 bg-black/40 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-[12px] text-text-dim">{card.title}</span>
            </div>
            <div className="p-5">
              <h3 className="mb-3 font-mono text-[14px] font-semibold text-green">
                {card.heading}
              </h3>
              <dl className="space-y-3">
                {card.rows.map((r) => (
                  <div key={r.label}>
                    <dt className="font-mono text-[12px] uppercase tracking-wide text-cyan">
                      {r.label}
                    </dt>
                    <dd className="mt-1 text-[14.5px] leading-relaxed text-neutral-300">
                      {r.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
