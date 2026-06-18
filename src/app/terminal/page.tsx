import { TerminalNav } from "@/components/sections/TerminalNav";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terminal" };

export default function TerminalPage() {
  return (
    <main className="min-h-screen pt-12">
      <TerminalNav />
    </main>
  );
}
