"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Home } from "lucide-react";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { GooeySearch } from "@/components/ui/GooeySearch";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Top nav  — "Navbar Dark Shadow": dark, elevated, soft layered
 * shadow, fully legible. Logo · centered Search · GitHub · Contact · Résumé.
 *
 * Collapsible: revealed on load and on any scroll (up or down); hovering the
 * top edge (or the nav) also brings it back and keeps it open. It hides only
 * after 5s of idle (no scroll, cursor away). Writes `data-nav="open|collapsed"`
 * on <html> so any page can shift its heading up when the nav tucks away.
 * Pinned open on mobile and under reduced-motion (no hover to bring it back).
 */
const IDLE_HIDE_MS = 5000;

export function SiteNav() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const reduced = useReducedMotion();
  const pinned = isMobile || reduced;
  const [expanded, setExpanded] = useState(true);
  const shown = pinned ? true : expanded; // pinned is always visible, no state write
  const idleTimer = useRef<number | null>(null);

  const expand = useCallback(() => {
    if (idleTimer.current) {
      window.clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
    setExpanded(true);
  }, []);

  const armIdle = useCallback(() => {
    if (pinned) return;
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setExpanded(false), IDLE_HIDE_MS);
  }, [pinned]);

  // Reveal on load + on any scroll, then hide after 5s of idle. Hover keeps it
  // open (handled on the header's mouse events below).
  useEffect(() => {
    if (pinned) return;
    armIdle();
    const onScroll = () => {
      setExpanded(true);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => setExpanded(false), IDLE_HIDE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [pinned, armIdle]);

  // Expose the collapsed state to the rest of the page.
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.nav = shown ? "open" : "collapsed";
    return () => {
      delete el.dataset.nav;
    };
  }, [shown]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50"
      onMouseEnter={expand}
      onMouseLeave={armIdle}
    >
      <div
        className={`mx-auto mt-3 flex h-16 max-w-[1200px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#0c0f0d]/85 px-4 shadow-[0_8px_30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-500 ease-out sm:px-5 ${
          shown ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-[130%] opacity-0"
        }`}
      >
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
          <Link href="/guide" className="hidden text-text-dim transition-colors hover:text-green md:inline">
            Guide
          </Link>
          <Link href="/contact" className="hidden text-text-dim transition-colors hover:text-green md:inline">
            Contact
          </Link>
          <SoundToggle />
          <HoverBorderGradient href="/Niranjan_VSKS_FDE_RN.pdf" target="_blank" className="text-[15px]">
            Résumé
          </HoverBorderGradient>
        </nav>
      </div>

      {/* When collapsed, a slim top strip brings the nav back on hover / tap. */}
      {!pinned && !shown && (
        <button
          type="button"
          aria-label="Show navigation"
          onMouseEnter={expand}
          onClick={expand}
          className="absolute inset-x-0 top-0 h-4 w-full"
        />
      )}
    </header>
  );
}
