"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface SoundContextValue {
  /** Global sound state. Muted by default (PRD 1.5: never autoplay). */
  enabled: boolean;
  toggle: () => void;
  /** Play a sound file from /public. No-ops when muted or asset missing. */
  play: (src: string) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false); // muted by default
  const cache = useRef<Map<string, HTMLAudioElement>>(new Map());

  const toggle = useCallback(() => setEnabled((e) => !e), []);

  const play = useCallback(
    (src: string) => {
      if (!enabled || typeof window === "undefined") return;
      let audio = cache.current.get(src);
      if (!audio) {
        audio = new Audio(src);
        cache.current.set(src, audio);
      }
      audio.currentTime = 0;
      // Swallow autoplay-policy rejections and missing-asset errors.
      void audio.play().catch(() => {});
    },
    [enabled],
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within <SoundProvider>");
  return ctx;
}
