"use client";

import Link from "next/link";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { GooeySearch } from "@/components/ui/GooeySearch";

/**
 * Minimal utility nav (PRD 5.2): Logo · Search · GitHub · Contact · Résumé ·
 * sound. Section navigation lives in the Home hub cards + search, not here.
 * Persistent on every page incl. mobile.
 */
export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/80 font-mono backdrop-blur-md">
      <nav className="mx-auto flex h-12 max-w-[1200px] items-center justify-between px-4 text-[13px]">
        <Link href="/" className="font-medium tracking-tight text-green">
          niranjan.vsks<span className="text-text-dim">:~$</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <GooeySearch />
          <a
            href="https://github.com/niranjanvsks"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-text-dim transition-colors hover:text-green sm:block"
          >
            github
          </a>
          <Link
            href="/contact"
            className="hidden text-text-dim transition-colors hover:text-green sm:block"
          >
            contact
          </Link>
          <SoundToggle />
          <a
            href="/NiranjanVSKS_FDE.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-green/50 px-2.5 py-1 text-green transition-colors hover:bg-green hover:text-bg"
          >
            résumé
          </a>
        </div>
      </nav>
    </header>
  );
}
