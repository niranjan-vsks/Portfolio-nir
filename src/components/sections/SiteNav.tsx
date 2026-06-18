"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "cinematic" },
  { href: "/map", label: "map" },
  { href: "/terminal", label: "terminal" },
  { href: "/about", label: "about" },
  { href: "/system-design", label: "system_design" },
  { href: "/contact", label: "contact" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md font-mono">
      <nav className="mx-auto flex h-12 max-w-[1100px] items-center justify-between px-4 text-[13px]">
        <Link href="/" className="text-green font-medium tracking-tight">
          niranjan.vsks<span className="text-text-dim">:~$</span>
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded px-2.5 py-1 text-text-dim transition-colors hover:text-green",
                  active && "text-green bg-green/10",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <a
            href="/NiranjanVSKS_FDE.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 rounded border border-green/50 px-2.5 py-1 text-green transition-colors hover:bg-green hover:text-bg"
          >
            résumé.pdf
          </a>
        </div>
        {/* Mobile: condensed links */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/terminal" className="text-text-dim hover:text-green">
            menu
          </Link>
          <a
            href="/NiranjanVSKS_FDE.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-green/50 px-2 py-0.5 text-green"
          >
            résumé
          </a>
        </div>
      </nav>
    </header>
  );
}
