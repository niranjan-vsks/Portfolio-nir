import fs from "node:fs";
import path from "node:path";

/**
 * Server-side file logger (Python-logger style) for local traceability.
 *
 * Writes to instance/logs_dd_mm_yyyy.log (one file per day) AND mirrors to the
 * console. Always attempts the file write; if the filesystem is read-only
 * (e.g. Vercel production) the write is swallowed and only the console output
 * remains. Browser logs reach this file via the /api/log route.
 *
 * Usage (server only): logger.debug("scope", "message", { meta }).
 */

type Level = "DEBUG" | "INFO" | "WARN" | "ERROR";

const INSTANCE_DIR = path.join(process.cwd(), "instance");

function fileName(d = new Date()): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `logs_${dd}_${mm}_${yyyy}.log`;
}

function write(level: Level, scope: string, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  const metaStr =
    meta === undefined
      ? ""
      : " " +
        (() => {
          try {
            return typeof meta === "string" ? meta : JSON.stringify(meta);
          } catch {
            return String(meta);
          }
        })();
  const line = `[${ts}] [${level.padEnd(5)}] [${scope}] ${message}${metaStr}`;

  // Console mirror (shows in the dev terminal / platform stdout).
  const sink =
    level === "ERROR"
      ? console.error
      : level === "WARN"
        ? console.warn
        : console.log;
  sink(line);

  // File write: best-effort, never throws into the caller.
  try {
    fs.mkdirSync(INSTANCE_DIR, { recursive: true });
    fs.appendFileSync(path.join(INSTANCE_DIR, fileName()), line + "\n");
  } catch {
    /* read-only FS (e.g. serverless prod) — console output already emitted */
  }
}

export const logger = {
  debug: (scope: string, message: string, meta?: unknown) =>
    write("DEBUG", scope, message, meta),
  info: (scope: string, message: string, meta?: unknown) =>
    write("INFO", scope, message, meta),
  warn: (scope: string, message: string, meta?: unknown) =>
    write("WARN", scope, message, meta),
  error: (scope: string, message: string, meta?: unknown) =>
    write("ERROR", scope, message, meta),
};
