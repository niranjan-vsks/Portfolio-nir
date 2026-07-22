"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";

/**
 * Layout Text Flip : a fixed prefix followed by a rotating word that
 * flips in/out with a shared layout animation. Reduced motion holds the first
 * word static. All words stay in the accessible label.
 */
export function LayoutTextFlip({
  prefix,
  words,
  interval = 2200,
  className = "",
  wordClassName = "",
  wordClassNames,
}: {
  prefix: string;
  words: string[];
  interval?: number;
  className?: string;
  wordClassName?: string;
  /** per-word color classes, cycled by index; overrides wordClassName when set */
  wordClassNames?: string[];
}) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  const wordColor =
    wordClassNames && wordClassNames.length > 0
      ? wordClassNames[i % wordClassNames.length]
      : wordClassName;

  useEffect(() => {
    if (reduced || words.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [reduced, words.length, interval]);

  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-x-3 ${className}`}
      aria-label={`${prefix} ${words.join(", ")}`}
    >
      <span>{prefix}</span>
      <span className="relative inline-block">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={words[i]}
            initial={reduced ? false : { y: "100%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reduced ? undefined : { y: "-100%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`inline-block ${wordColor}`}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
