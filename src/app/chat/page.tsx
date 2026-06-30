import type { Metadata } from "next";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { ChatSurface } from "@/components/sections/ChatSurface";

export const metadata: Metadata = {
  title: "ask_niranjan",
  description:
    "Interview Niranjan VSKS directly: ask about his agentic AI and RAG work, decisions, and how he ships into enterprise environments.",
};

export default function ChatPage() {
  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <main className="mx-auto max-w-3xl px-4 pb-10 pt-24">
        <ChatSurface />
      </main>
    </>
  );
}
