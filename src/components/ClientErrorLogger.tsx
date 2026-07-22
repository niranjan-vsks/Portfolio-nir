"use client";

import { useEffect } from "react";
import { installClientErrorLogging } from "@/lib/client-logger";

/** Mount-once hook that wires browser error capture to the daily log file. */
export function ClientErrorLogger() {
  useEffect(() => {
    installClientErrorLogging();
  }, []);
  return null;
}
