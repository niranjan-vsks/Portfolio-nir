import { logger } from "@/lib/logger";

export const runtime = "nodejs";

type Level = "debug" | "info" | "warn" | "error";
const LEVELS: Level[] = ["debug", "info", "warn", "error"];

/**
 * Receives browser log events and writes them into the same daily log file as
 * the server (instance/logs_dd_mm_yyyy.log), so client and server traces live
 * together. Client-origin lines are scoped "client:<scope>".
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      level?: string;
      scope?: string;
      message?: string;
      meta?: unknown;
    };
    const level: Level = LEVELS.includes(body.level as Level)
      ? (body.level as Level)
      : "info";
    const scope = `client:${body.scope ?? "app"}`;
    logger[level](scope, body.message ?? "", body.meta);
    return new Response(null, { status: 204 });
  } catch {
    return new Response("bad request", { status: 400 });
  }
}
