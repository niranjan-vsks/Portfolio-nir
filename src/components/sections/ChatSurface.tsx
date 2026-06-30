"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// FAQ ready-buttons feed the assistant as input (PRD 6.9).
const FAQS = [
  "Walk me through Loop Copilot",
  "How do you approach a cold-start FDE engagement?",
  "What is the toughest RAG problem you've solved?",
  "How do you decide event-sourcing vs vector RAG?",
  "What would you build for an enterprise QE team?",
];

/**
 * ask_niranjan chat surface (PRD 6.9). Own page + stacking context (no overlap
 * bleed from other modes). FAQ ready-buttons feed the assistant. No session
 * history is persisted (state lives only in this component). Thin until
 * interview/*.md is filled · by design, never fabricated.
 */
export function ChatSurface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: Message[] = [...messages, { role: "user", content: q }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (res.status === 429) {
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: "Give me a moment · too many questions at once." };
          return c;
        });
        return;
      }
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
      }
    } catch {
      setMessages((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: "Something went wrong reaching the chat service. Reach me at niranjan.vsks@gmail.com." };
        return c;
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative isolate mx-auto flex h-[calc(100vh-7rem)] max-w-2xl flex-col overflow-hidden rounded-xl border border-green/25 bg-bg/85 backdrop-blur-sm">
      {/* header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-green/40 bg-surface font-mono text-green">
          N
        </div>
        <div>
          <p className="font-mono text-[13px] text-green">ask_niranjan</p>
          <p className="font-mono text-[11px] text-text-dim">
            Senior Agentic AI Engineer · interview simulation
          </p>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px]">
        {messages.length === 0 ? (
          <div className="text-text-dim">
            <p className="mb-3 text-green">
              {"> ask me about my work, decisions, and how I ship into enterprise environments."}
            </p>
            <div className="flex flex-col gap-2">
              {FAQS.map((f) => (
                <button
                  key={f}
                  onClick={() => send(f)}
                  className="rounded border border-border px-3 py-1.5 text-left text-cyan transition-colors hover:border-cyan/50"
                >
                  {`> ${f}`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="mb-4">
              <p className={m.role === "user" ? "text-cyan" : "text-green"}>
                {m.role === "user" ? "> you" : "> niranjan"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-text">
                {m.content || (busy ? "…" : "")}
              </p>
            </div>
          ))
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-border px-4 py-3 font-mono text-[13px]"
      >
        <span className="text-green">$</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ask anything…"
          className="flex-1 bg-transparent text-text caret-green outline-none placeholder:text-text-dim"
          disabled={busy}
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded border border-green/40 px-3 py-1 text-green disabled:opacity-40"
        >
          send
        </button>
      </form>
    </div>
  );
}
