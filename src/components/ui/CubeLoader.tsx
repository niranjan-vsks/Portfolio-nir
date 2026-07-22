"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks/useReducedMotion";
import styles from "./CubeLoader.module.css";

/**
 * Cube loader (built, recolored to the
 * space palette). Six sub-cubes sit on the faces of a slowly rotating cube; a
 * single sub-cube glows and presses in at a time, cycling automatically — no
 * hover or click required (both still work as enhancements). Reduced-motion
 * freezes the rotation and the auto-cycle.
 */

// Face position class + inner-cube class, index-aligned (front, back, left, right, top, bottom).
const FACES = ["front", "back", "left", "right", "top", "bottom"] as const;
const CUBES = ["cubeFront", "cubeBack", "cubeLeft", "cubeRight", "cubeTop", "cubeBottom"] as const;

export function CubeLoader() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setActive((a) => (a + 1) % CUBES.length), 620);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div className={styles.loader} aria-hidden="true">
      <div className={styles.cube}>
        {FACES.map((pos, i) => (
          <div key={pos} className={`${styles.face} ${styles.middle} ${styles[pos]}`}>
            <div className={`${styles.cube} ${styles[CUBES[i]]} ${active === i ? styles.glow : ""}`}>
              <div className={`${styles.face} ${styles.front}`} />
              <div className={`${styles.face} ${styles.back}`} />
              <div className={`${styles.face} ${styles.left}`} />
              <div className={`${styles.face} ${styles.right}`} />
              <div className={`${styles.face} ${styles.top}`} />
              <div className={`${styles.face} ${styles.bottom}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
