"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Slider Spectra (PRD 13 View tab), faithful port of
 * template_repos/textura_templates/slider_spectra/slider_spectra.md:
 * CSS-3D coverflow fan, momentum drag, keyboard, autoplay (pauses on hover/
 * drag/hidden tab), halo keyed to the centre card, reduced-motion snap.
 * Renovation-surgical deltas: eyewear demo chrome (glasses mark, Enter Store
 * CTA) removed; glow hues constrained to the green↔cyan lane; a per-slide
 * caption + description renders under the fan for the centre card.
 */

export interface SpectraSlide {
  name: string;
  img?: string;
  caption?: string;
  description?: string;
}

// template geometry, verbatim
const GEO = { gap: 164, rotate: 38, depth: 150, drop: 24, shrink: 0.14, fade: 0.26, dim: 0.2, visible: 3 };
const CARD_W = 260, CARD_H = 330, PERSP = 1680;
const AUTOPLAY_MS = 3200, EASE = 0.14, SENSITIVITY = 0.0072;

// green↔cyan lane replaces the template's per-card eyewear hues (frontend.md)
const LANE = [
  { c1: "#166534", c2: "#04140a", glow: "#4ade80" },
  { c1: "#0e7490", c2: "#041418", glow: "#22d3ee" },
  { c1: "#15803d", c2: "#071a10", glow: "#34d399" },
  { c1: "#0891b2", c2: "#03181d", glow: "#00e5ff" },
  { c1: "#047857", c2: "#051713", glow: "#2dd4bf" },
];

export function SliderSpectra({ slides }: { slides: SpectraSlide[] }) {
  const N = slides.length;
  const sectionRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const goRef = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);

  const state = useRef({
    pos: 0, target: 0, dragging: false, moved: false,
    lastX: 0, startX: 0, vel: 0, scale: 1, hovering: false,
  });

  useEffect(() => {
    const section = sectionRef.current, stage = stageRef.current;
    if (!section || !stage || N === 0) return;
    const s = state.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wrap = (o: number) => { o = ((o % N) + N) % N; return o > N / 2 ? o - N : o; };

    function layout() {
      const vw = window.innerWidth;
      const f = Math.max(0.56, Math.min(1, vw / 1180));
      section!.style.setProperty("--card-w", Math.round(CARD_W * f) + "px");
      section!.style.setProperty("--card-h", Math.round(CARD_H * f) + "px");
      section!.style.setProperty("--persp", Math.max(1050, PERSP * f) + "px");
      s.scale = f;
    }

    function paint() {
      const { gap, rotate, depth, drop, shrink, fade, dim, visible } = GEO;
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const o = wrap(i - s.pos);
        const ao = Math.abs(o);
        if (ao > visible + 0.5) { el.style.opacity = "0"; el.style.pointerEvents = "none"; continue; }
        const sc = Math.max(0.4, 1 - ao * shrink);
        el.style.transform =
          `translateX(${o * gap * s.scale}px) translateY(${ao * drop * s.scale}px) ` +
          `translateZ(${-ao * depth * s.scale}px) rotateY(${-o * rotate}deg) scale(${sc})`;
        el.style.opacity = String(Math.max(0, 1 - ao * fade));
        el.style.filter = `brightness(${Math.max(0.3, 1 - ao * dim)}) saturate(${1 + (1 - Math.min(1, ao)) * 0.25})`;
        el.style.zIndex = String(Math.round(100 - ao * 10));
        el.style.pointerEvents = "auto";
      }
      const a = ((Math.round(s.pos) % N) + N) % N;
      section!.style.setProperty("--halo", LANE[a % LANE.length].glow);
    }

    let raf = 0, lastActive = -1;
    function frame() {
      if (!s.dragging) {
        if (reduce) s.pos = s.target;
        else {
          s.pos += (s.target - s.pos) * EASE;
          if (Math.abs(s.target - s.pos) < 0.001) s.pos = s.target;
        }
      }
      paint();
      const a = ((Math.round(s.pos) % N) + N) % N;
      if (a !== lastActive) { lastActive = a; setActive(a); }
      raf = requestAnimationFrame(frame);
    }

    const go = (i: number) => { const cur = Math.round(s.target); s.target = cur + wrap(i - cur); };
    const next = () => { s.target += 1; };
    const prev = () => { s.target -= 1; };
    goRef.current = go;

    const onDown = (e: PointerEvent) => {
      s.dragging = true; s.moved = false; s.lastX = s.startX = e.clientX; s.vel = 0;
      stage!.classList.add("cursor-grabbing");
      stage!.setPointerCapture(e.pointerId);
      syncAutoplay();
    };
    const onMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const dx = e.clientX - s.lastX; s.lastX = e.clientX;
      if (Math.abs(e.clientX - s.startX) > 5) s.moved = true;
      const d = -dx * SENSITIVITY;
      s.pos += d; s.vel = d;
      paint();
    };
    const release = () => {
      if (!s.dragging) return;
      s.dragging = false;
      stage!.classList.remove("cursor-grabbing");
      s.target = Math.round(s.pos + s.vel * 8);
      s.vel = 0;
      syncAutoplay();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { next(); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { prev(); e.preventDefault(); }
      else if (e.key === "Home") { go(0); e.preventDefault(); }
      else if (e.key === "End") { go(N - 1); e.preventDefault(); }
    };

    let autoTimer: ReturnType<typeof setInterval> | null = null;
    const autoActive = () => AUTOPLAY_MS > 0 && !reduce && !s.hovering && !s.dragging && !document.hidden;
    function syncAutoplay() {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
      if (autoActive()) autoTimer = setInterval(next, AUTOPLAY_MS);
    }
    const onEnter = () => { s.hovering = true; syncAutoplay(); };
    const onLeave = () => { s.hovering = false; syncAutoplay(); };

    const onResize = () => { layout(); paint(); };
    layout();
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", release);
    stage.addEventListener("pointercancel", release);
    stage.addEventListener("mouseenter", onEnter);
    stage.addEventListener("mouseleave", onLeave);
    section.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", syncAutoplay);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);
    syncAutoplay();

    return () => {
      cancelAnimationFrame(raf);
      if (autoTimer) clearInterval(autoTimer);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", release);
      stage.removeEventListener("pointercancel", release);
      stage.removeEventListener("mouseenter", onEnter);
      stage.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", syncAutoplay);
      window.removeEventListener("resize", onResize);
    };
  }, [N]);

  if (N === 0) return null;
  const slide = slides[active];

  return (
    <div
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label={`${slides.length} screens`}
      className="relative flex flex-col items-center gap-6 overflow-hidden py-8"
      style={{ "--halo": LANE[0].glow, "--card-w": "260px", "--card-h": "330px", "--persp": "1680px" } as React.CSSProperties}
    >
      {/* halo keyed to the centre card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] z-0 aspect-square w-[min(70vw,640px)] -translate-x-1/2 -translate-y-1/2 opacity-30 blur-[30px] transition-[background] duration-500"
        style={{ background: "radial-gradient(closest-side, var(--halo), transparent 72%)" }}
      />

      <div
        ref={stageRef}
        role="group"
        aria-label="Drag, swipe or use arrow keys to browse screens"
        className="relative z-[1] grid w-full cursor-grab select-none place-items-center"
        style={{ height: "calc(var(--card-h) + 90px)", perspective: "var(--persp)", perspectiveOrigin: "50% 44%", touchAction: "pan-y" }}
      >
        <div className="relative h-0 w-0 [transform-style:preserve-3d]">
          {slides.map((sl, i) => {
            const lane = LANE[i % LANE.length];
            return (
              <button
                key={i}
                type="button"
                ref={(el) => { cardRefs.current[i] = el; }}
                aria-label={`${sl.name} — screen ${i + 1} of ${N}`}
                onClick={() => {
                  if (!state.current.moved) goRef.current(i);
                }}
                className="absolute m-0 border-0 bg-transparent p-0 [transform-style:preserve-3d] will-change-transform"
                style={{
                  width: "var(--card-w)", height: "var(--card-h)",
                  left: "calc(var(--card-w) / -2)", top: "calc(var(--card-h) / -2)",
                }}
              >
                <span className="absolute inset-0 overflow-hidden rounded-[22px] bg-[#0a0e18] shadow-[0_30px_60px_-22px_rgba(0,0,0,0.85),0_6px_20px_-10px_rgba(0,0,0,0.7)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_0_0_1px_rgba(255,255,255,0.06)]">
                  <span
                    className="absolute inset-0"
                    style={{
                      background: `radial-gradient(115% 78% at 50% 122%, rgba(0,0,0,.82), transparent 52%), radial-gradient(58% 66% at 61% 54%, rgba(0,0,0,.55), transparent 60%), radial-gradient(92% 62% at 46% 6%, color-mix(in srgb, ${lane.c1} 78%, #fff 22%), transparent 66%), linear-gradient(158deg, ${lane.c1}, ${lane.c2})`,
                    }}
                  />
                  {sl.img ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    /* object-contain on black: any screenshot dimension
                       (landscape app shots included) auto-fits the card */
                    <img src={sl.img} alt={`${sl.name} screen`} draggable={false} loading="lazy" className="absolute inset-0 block h-full w-full bg-black object-contain" />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center p-4 text-center font-mono text-[13px] text-white/80">
                      {sl.name}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* per-screen caption + description for the centre card */}
      <div className="relative z-[2] min-h-[3.5rem] max-w-xl text-center">
        <p className="font-mono text-[14px] text-green">{slide.caption ?? slide.name}</p>
        {slide.description && (
          <p className="mt-1 text-[13.5px] leading-relaxed text-text-dim">{slide.description}</p>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{`${slide.name}, ${active + 1} of ${N}`}</p>
    </div>
  );
}
