"use client";

import { useEffect } from "react";
import { ChatSurface } from "./ChatSurface";

/**
 * ask_niranjan modal (landing entry). FINAL_SHOWDOWN: the old plain-text
 * panel is gone; the modal now hosts the same premium ChatSurface as /chat
 * (terminal chrome, avatar bubbles, typing dots, glowing input).
 */
export function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-0 sm:items-center sm:justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative h-[100dvh] w-full sm:h-[660px] sm:max-w-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-2.5 z-10 font-mono text-[12px] text-text-dim transition-colors hover:text-green"
          aria-label="close chat"
        >
          [esc] ✕
        </button>
        <ChatSurface embedded />
      </div>
    </div>
  );
}
