"use client";

import Link from "next/link";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { GooeySearch } from "@/components/ui/GooeySearch";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";

/**
 * Top nav (PRD 8.1) — "Navbar Dark Shadow": dark, elevated, soft layered
 * shadow, fully legible (Geist, not mono). Logo · centered Search · GitHub ·
 * Contact · Résumé (the one button). Persistent on every route incl. mobile.
 */
export function SiteNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex h-14 max-w-[1200px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c0f0d]/85 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:px-5">
        {/* logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-mono text-[13px] font-medium tracking-tight text-green">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-green/40 bg-green/10 text-green">N</span>
          <span className="hidden sm:inline">niranjan.vsks<span className="text-text-dim">:~$</span></span>
        </Link>

        {/* centered search */}
        <div className="flex flex-1 justify-center">
          <GooeySearch />
        </div>

        {/* actions */}
        <nav className="flex shrink-0 items-center gap-3 text-[14px]">
          <a
            href="https://github.com/niranjanvsks"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-text-dim transition-colors hover:text-green md:inline"
          >
            GitHub
          </a>
          <Link href="/contact" className="hidden text-text-dim transition-colors hover:text-green md:inline">
            Contact
          </Link>
          <SoundToggle />
          <HoverBorderGradient href="/NiranjanVSKS_FDE.pdf" target="_blank" className="text-[13px]">
            Résumé
          </HoverBorderGradient>
        </nav>
      </div>
    </header>
  );
}
