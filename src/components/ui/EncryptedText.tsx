"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ01<>/_{}#";

/**
 * Encrypted Text reveal : scrambles then resolves to the final
 * string, character by character. Headings/captions only. Reduced motion shows
 * the final text immediately. Real text is always in the DOM for SEO/a11y.
 */
export function EncryptedText({
  text,
  className = "",
  speed = 28,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  speed?: number;
  as?: "span" | "h1" | "h2" | "p";
}) {
  const reduced = useReducedMotion();
  // Seed with the real text: correct for SSR/SEO/no-JS and avoids a synchronous
  // setState in the reduced-motion branch. The scramble (when enabled) overwrites
  // it on the next animation frame.
  const [display, setDisplay] = useState(text);
  const frame = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let revealed = 0;
    frame.current = 0;
    const tick = () => {
      frame.current++;
      if (frame.current % 2 === 0) revealed += 1;
      const out = text
        .split("")
        .map((ch, i) => {
          if (i < revealed || ch === " ") return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(out);
      if (revealed <= text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, reduced, speed]);

  return (
    <Tag className={className} aria-label={text}>
      {display || text}
    </Tag>
  );
}
