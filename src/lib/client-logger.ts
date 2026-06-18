"use client";

/**
 * Browser logger. Forwards events to /api/log so they land in the same daily
 * file as server logs (instance/logs_dd_mm_yyyy.log). Also mirrors to the
 * devtools console. Fire-and-forget: never blocks the UI.
 */

type Level = "debug" | "info" | "warn" | "error";

export function clientLog(
  level: Level,
  scope: string,
  message: string,
  meta?: unknown,
) {
  // console mirror
  (level === "error" ? console.error : console.log)(
    `[client:${scope}] ${message}`,
    meta ?? "",
  );
  try {
    void fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, scope, message, meta }),
      keepalive: true,
    });
  } catch {
    /* never throw from logging */
  }
}

let installed = false;

/** Capture uncaught errors and promise rejections, forward them to the file. */
export function installClientErrorLogging() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (e) => {
    clientLog("error", "window.onerror", e.message, {
      source: e.filename,
      line: e.lineno,
      col: e.colno,
      stack: e.error?.stack,
    });
  });

  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason;
    clientLog("error", "unhandledrejection", String(reason?.message ?? reason), {
      stack: reason?.stack,
    });
  });
}
