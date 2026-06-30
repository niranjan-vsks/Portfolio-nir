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
        <div className="max-w-2xl">
          {c.org && <p className="font-mono text-sm text-cyan">{c.org}</p>}
          {c.status && (
            <p className="mt-1 font-mono text-[13px] text-text-dim">{c.status}</p>
          )}

          {/* Description is a content slot Niranjan fills; omitted until then. */}
          {c.description && (
            <p className="mt-6 leading-relaxed text-text">{c.description}</p>
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
