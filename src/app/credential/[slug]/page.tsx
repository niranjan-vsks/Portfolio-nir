import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";
import {
  CERTIFICATIONS,
  EDUCATION,
  findCredential,
} from "@/lib/credentials";

export function generateStaticParams() {
  return [...CERTIFICATIONS, ...EDUCATION].map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = findCredential(slug);
  return { title: c?.title ?? "Credential" };
}

export default async function CredentialPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = findCredential(slug);
  if (!c) notFound();

  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <PageShell eyebrow="credential" title={c.title}>
        <div className="max-w-3xl">
          {c.org && <p className="font-mono text-sm text-cyan">{c.org}</p>}
          {c.status && (
            <p className="mt-1 font-mono text-[13px] text-text-dim">{c.status}</p>
          )}

          {c.paragraphs ? (
            <div className="mt-6 space-y-4">
              {c.paragraphs.map((p) => (
                <p key={p.slice(0, 32)} className="text-[17px] leading-[1.75] text-neutral-300">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            c.description && (
              <p className="mt-6 text-[17px] leading-[1.75] text-neutral-300">{c.description}</p>
            )
          )}

          {c.highlights && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {c.highlights.map((h) => (
                <div key={h.title} className="rounded-xl border border-green/20 bg-surface/60 p-4">
                  <div className="font-mono text-[13px] text-green">{h.title}</div>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-neutral-300">{h.body}</p>
                </div>
              ))}
            </div>
          )}

          {c.image && (
            <figure className="mt-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.image.src}
                alt={c.image.alt}
                className="w-full rounded-xl border border-neutral-800 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]"
              />
              <figcaption className="mt-2 font-mono text-[12px] text-text-dim">
                certificate · {c.org}
              </figcaption>
            </figure>
          )}

          <h2 className="mb-3 mt-10 font-mono text-sm text-green">{"> related work"}</h2>
          <div className="flex flex-wrap gap-3">
            {c.related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="rounded border border-green/40 px-3 py-1.5 font-mono text-[12px] text-green transition-colors hover:bg-green hover:text-bg"
              >
                {r.label} →
              </Link>
            ))}
          </div>
        </div>
      </PageShell>
    </>
  );
}
