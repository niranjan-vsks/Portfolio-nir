"use client";

import { useCallback, useEffect, useState } from "react";
import { ChatSurface } from "./ChatSurface";

type WinState = "normal" | "max" | "min";

/**
 * ask_niranjan modal (landing entry). Hosts the premium ChatSurface and wires
 * its terminal traffic-lights to real window controls: red closes, yellow
 * minimizes to a corner pill (page stays usable), green maximizes to a larger
 * fully-visible view. The panel is always centered and size-capped to the
 * viewport, so it never renders half off-screen.
 */
export function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [win, setWin] = useState<WinState>("normal");

  // Close resets the window to normal, so the next open starts fresh (no effect).
  const close = useCallback(() => {
    setWin("normal");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  // Minimized: collapse to a corner pill; no backdrop so the page stays usable.
  if (win === "min") {
    return (
      <button
        type="button"
        onClick={() => setWin("normal")}
        aria-label="Restore chat"
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 rounded-full border border-green/40 bg-[#080b09]/95 px-4 py-2.5 font-mono text-[12.5px] text-green shadow-[0_0_30px_-8px_rgba(74,222,128,0.6)] backdrop-blur transition-transform hover:scale-105"
      >
        <span className="h-2 w-2 rounded-full bg-green" />
        ask_niranjan
      </button>
    );
  }

  const panelSize =
    win === "max"
      ? "h-[100dvh] w-full sm:h-[calc(100dvh-3rem)] sm:max-w-5xl"
      : "h-[100dvh] w-full sm:h-[660px] sm:max-w-2xl";

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-0 sm:items-center sm:justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      <div className={`relative ${panelSize}`}>
        <ChatSurface
          embedded
          onClose={close}
          onMinimize={() => setWin("min")}
          onMaximize={() => setWin((w) => (w === "max" ? "normal" : "max"))}
          maximized={win === "max"}
        />
      </div>
    </div>
  );
}
