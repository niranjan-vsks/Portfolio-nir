import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllFdeSections, getFdeSection } from "@/lib/content";
import { PageShell } from "@/components/sections/PageShell";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { Wikify } from "@/components/ui/Wikify";
import { TagChip } from "@/components/ui/TagChip";

export function generateStaticParams() {
  return getAllFdeSections().map((s) => ({ slug: s.frontmatter.slug ?? s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = getFdeSection(slug);
  if (!doc) return { title: "Forward Deployed" };
  return { title: doc.frontmatter.title, description: doc.frontmatter.caption };
}

function lines(text: string): string[] {
  return text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
}

export default async function FdeSectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getFdeSection(slug);
  if (!doc) notFound();

  const parts = doc.body.split(/^##\s+/m);
  const intro = parts[0].trim();
  const sections = parts.slice(1).map((p) => {
    const nl = p.indexOf("\n");
    return { title: p.slice(0, nl).trim(), body: p.slice(nl + 1) };
  });
  const tags = doc.frontmatter.tags ?? [];

  return (
    <>
      <PageBackground variant="flow-wave" />
      <PageShell eyebrow="forward_deployed" title={doc.frontmatter.title}>
        <div className="max-w-3xl">
          {intro && (
            <p className="text-[15.5px] leading-relaxed text-neutral-300">
              <Wikify text={intro} />
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {tags.map((t) => (
                <TagChip key={t.node} label={t.label} node={t.node} />
              ))}
            </div>
          )}

          {sections.map((s) => (
            <section key={s.title} className="mt-10">
              <h2 className="mb-4 font-mono text-lg text-green">{`> ${s.title.toLowerCase()}`}</h2>
              <div className="space-y-3">
                {lines(s.body).map((raw, i) => {
                  const isBullet = raw.startsWith("- ");
                  const text = isBullet ? raw.slice(2) : raw;
                  return isBullet ? (
                    <div key={i} className="flex gap-2 text-[14.5px] leading-relaxed text-neutral-300">
                      <span className="mt-[2px] shrink-0 text-green">▸</span>
                      <span><Wikify text={text} /></span>
                    </div>
                  ) : (
                    <p key={i} className="text-[14.5px] leading-relaxed text-neutral-300">
                      <Wikify text={text} />
                    </p>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="mt-12 border-t border-border pt-6">
            <Link
              href="/forward-deployed"
              className="font-mono text-[13px] text-green hover:text-green/80"
            >
              ← all forward deployed capabilities
            </Link>
          </div>
        </div>
      </PageShell>
    </>
  );
}
