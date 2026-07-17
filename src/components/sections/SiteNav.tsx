"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { GooeySearch } from "@/components/ui/GooeySearch";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";

/**
 * Top nav (PRD 8.1) — "Navbar Dark Shadow": dark, elevated, soft layered
 * shadow, fully legible (Geist, not mono). Logo · centered Search · GitHub ·
 * Contact · Résumé (the one button). Persistent on every route incl. mobile.
 */
export function SiteNav() {
  const router = useRouter();
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-3 flex h-16 max-w-[1200px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c0f0d]/85 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl sm:px-5">
        {/* left cluster: back + home */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back to the previous page"
            title="Back"
            className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-text-dim transition-colors hover:border-green/40 hover:text-green"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
          <Link
            href="/"
            aria-label="Go to home"
            title="Home"
            className="flex items-center gap-2 font-mono text-[15px] font-medium tracking-tight text-green"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-green/40 bg-green/10 text-green">
              <Home className="h-[17px] w-[17px]" />
            </span>
            <span className="hidden sm:inline">niranjan.vsks<span className="text-text-dim">:~$</span></span>
          </Link>
        </div>

        {/* centered search */}
        <div className="flex flex-1 justify-center">
          <GooeySearch />
        </div>

        {/* actions */}
        <nav className="flex shrink-0 items-center gap-4 text-[16px]">
          <a
            href="https://github.com/niranjan-vsks"
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
          <HoverBorderGradient href="/Niranjan_VSKS_FDE_P1.pdf" target="_blank" className="text-[15px]">
            Résumé
          </HoverBorderGradient>
        </nav>
      </div>
    </header>
  );
}
