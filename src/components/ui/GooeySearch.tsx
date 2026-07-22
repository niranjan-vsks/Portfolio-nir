"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { SEARCH_INDEX, SUGGESTIONS } from "@/lib/searchIndex";

/**
 * Top-nav smart search : client-side fuzzy (Fuse.js), no LLM. Expands
 * with a glowing border, suggests phrases, routes to the best match. Keyboard:
 * ↑/↓ to move, Enter to open, Esc to close.
 */
export function GooeySearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(SEARCH_INDEX, {
        keys: ["label", "keywords", "group"],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [],
  );

  const results = useMemo(() => {
    if (!q.trim()) return SEARCH_INDEX.filter((e) => e.group === "section").slice(0, 6);
    return fuse.search(q).slice(0, 7).map((r) => r.item);
  }, [q, fuse]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      // `/` opens; Cmd+K / Ctrl+K toggles 
      if (!e.key) return; // dead/IME/media keys can fire with no `key`
      if (e.key === "/" && !open && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    if (href.endsWith(".pdf")) window.open(href, "_blank");
    else router.push(href);
  };

  return (
    <div ref={wrapRef} className="relative">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          aria-label="Search"
          className="flex h-9 items-center gap-2.5 rounded-full border border-border px-4 font-mono text-[13px] text-text-dim transition-colors hover:border-green/50 hover:text-green"
        >
          <Search size={15} /> <span className="hidden sm:inline">search</span>
          <span className="hidden rounded border border-border px-1.5 text-[10px] sm:inline">/</span>
        </button>
      ) : (
        <div className="absolute right-0 top-0 z-50 w-[min(92vw,26rem)]">
          <div className="flex items-center gap-2 rounded-full border border-green/60 bg-bg px-3 py-1.5 shadow-[0_0_22px_-4px_rgba(74,222,128,0.6)]">
            <Search size={15} className="text-green" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setCursor(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setCursor((c) => Math.min(c + 1, results.length - 1)); }
                else if (e.key === "ArrowUp") { e.preventDefault(); setCursor((c) => Math.max(c - 1, 0)); }
                else if (e.key === "Enter" && results[cursor]) go(results[cursor].href);
                else if (e.key === "Escape") setOpen(false);
              }}
              placeholder="search projects, sections, skills…"
              className="flex-1 bg-transparent font-mono text-[13px] text-text outline-none placeholder:text-text-dim"
              spellCheck={false}
            />
            <button onClick={() => setOpen(false)} aria-label="Close search" className="text-text-dim hover:text-green">
              <X size={14} />
            </button>
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-green/25 bg-bg/95 backdrop-blur-sm">
            {results.length > 0 ? (
              results.map((r, i) => (
                <button
                  key={r.href}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left font-mono text-[12px] ${
                    cursor === i ? "bg-green/10 text-green" : "text-text-dim"
                  }`}
                >
                  <span>{r.label}</span>
                  <span className="text-[10px] text-text-dim">{r.group}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 font-mono text-[12px] text-text-dim">no matches</p>
            )}
          </div>

          {!q && (
            <div className="mt-2 flex flex-wrap gap-1.5 px-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-text-dim hover:border-green/50 hover:text-green"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
