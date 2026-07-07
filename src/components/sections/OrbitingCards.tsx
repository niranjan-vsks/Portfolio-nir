"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Orbiting terminal-card carousel (PRD 9.1, jordan.dev reference). Terminal
 * cards on a 3D ring around the fixed globe. Front card is focused (clear,
 * scaled, legible, clickable); the rest sit blurred behind. Drag or arrows
 * rotate; click the front card to open its section (DG-1: each card = a
 * section). Auto-advances until hovered; reduced-motion holds still.
 */
export interface OrbitItem {
  label: string;
  caption: string;
  path: string; // e.g. "projects.sh"
  href?: string;
  onClick?: () => void;
}

function CardFace({ item, active }: { item: OrbitItem; active: boolean }) {
  const reduced = useReducedMotion();
  const [typed, setTyped] = useState(reduced ? item.caption : "");

  useEffect(() => {
    if (!active || reduced) {
      if (reduced) setTyped(item.caption);
      return;
    }
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(item.caption.slice(0, i));
      if (i >= item.caption.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [active, item.caption, reduced]);

  return (
    <div className="h-full w-full overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 shadow-2xl">
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-800/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-1.5 truncate font-mono text-[10.5px] text-neutral-400">~/{item.path}</span>
      </div>
      <div className="p-4 font-mono text-[12px] leading-relaxed">
        <div>
          <span className="text-emerald-400">$ cat</span>{" "}
          <span className="text-cyan-300">section.yml</span>
        </div>
        <div>
          <span className="text-sky-400">name:</span>{" "}
          <span className="font-semibold text-white">{item.label}</span>
        </div>
        <div className="my-1.5 text-neutral-600">---</div>
        <div className="min-h-[2.5rem] text-neutral-300">
          {active ? typed : item.caption}
          {active && !reduced && typed.length < item.caption.length && (
            <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-neutral-300" />
          )}
        </div>
      </div>
    </div>
  );
}

export function OrbitingCards({ items }: { items: OrbitItem[] }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const n = items.length;
  const step = 360 / n;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; start: number } | null>(null);

  // auto-advance
  useEffect(() => {
    if (reduced || paused) return;
    const id = setInterval(() => setActive((a) => a + 1), 4200);
    return () => clearInterval(id);
  }, [reduced, paused]);

  const openActive = () => {
    const it = items[((active % n) + n) % n];
    if (it.onClick) it.onClick();
    else if (it.href) router.push(it.href);
  };

  return (
    <div
      className="relative mx-auto flex h-[440px] w-full max-w-[820px] items-center justify-center [perspective:1500px] select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, start: active };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drag.current) return;
        const dx = e.clientX - drag.current.x;
        setActive(drag.current.start - Math.round(dx / 90));
      }}
      onPointerUp={() => (drag.current = null)}
    >
      <div
        className="relative h-[150px] w-[210px] transition-transform duration-700 ease-out [transform-style:preserve-3d]"
        style={{ transform: `translateZ(-440px) rotateX(16deg) rotateY(${-active * step}deg)` }}
      >
        {items.map((item, i) => {
          const isActive = ((i - active) % n + n) % n === 0;
          return (
            <button
              key={item.label}
              onClick={() => (isActive ? openActive() : setActive(i))}
              aria-label={item.label}
              className={`absolute inset-0 origin-center rounded-xl transition-all duration-700 ease-out ${
                isActive ? "z-10 opacity-100 [filter:none]" : "opacity-45 [filter:blur(2px)]"
              }`}
              style={{
                transform: `rotateY(${i * step}deg) translateZ(440px) scale(${isActive ? 1.02 : 0.8})`,
                pointerEvents: "auto",
              }}
              tabIndex={isActive ? 0 : -1}
            >
              <div className={isActive ? "shadow-[0_0_40px_-10px_rgba(74,222,128,0.5)] rounded-xl" : ""}>
                <CardFace item={item} active={isActive} />
              </div>
            </button>
          );
        })}
      </div>

      {/* controls */}
      <button
        onClick={() => setActive((a) => a - 1)}
        aria-label="Previous"
        className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-text-dim backdrop-blur hover:text-green"
      >
        ‹
      </button>
      <button
        onClick={() => setActive((a) => a + 1)}
        aria-label="Next"
        className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 p-2 text-text-dim backdrop-blur hover:text-green"
      >
        ›
      </button>
    </div>
  );
}
