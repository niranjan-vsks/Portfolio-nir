"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/components/providers/SoundProvider";

/** Visible global sound toggle (PRD 1.5 / acceptance #8). Muted by default. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const { enabled, toggle } = useSound();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute sound" : "Enable sound"}
      title={enabled ? "Mute sound" : "Enable sound"}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-text-dim transition-colors hover:text-green ${className}`}
    >
      {enabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
    </button>
  );
}
