import Link from "next/link";
import type { Credential } from "@/lib/credentials";

/** Grid of credential cards linking to their dedicated detail pages. */
export function CredentialGrid({ items }: { items: Credential[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((c) => (
        <Link
          key={c.slug}
          href={`/credential/${c.slug}`}
          className="group rounded-lg border border-green/20 bg-surface/60 p-5 backdrop-blur-sm transition-colors hover:border-green/55"
        >
          <h2 className="font-mono text-[15px] text-white group-hover:text-green">
            {c.title}
          </h2>
          {c.org && <p className="mt-1 font-mono text-[12px] text-cyan">{c.org}</p>}
          {c.status && (
            <p className="mt-1 font-mono text-[11px] text-text-dim">{c.status}</p>
          )}
          <p className="mt-3 font-mono text-[11px] text-green">{"> open"}</p>
        </Link>
      ))}
    </div>
  );
}
