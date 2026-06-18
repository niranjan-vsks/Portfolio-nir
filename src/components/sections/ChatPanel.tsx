"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "Walk me through Loop Copilot",
  "How do you approach a cold-start FDE engagement?",
  "Toughest RAG problem you've solved?",
];

export function ChatPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
      if (!res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Something went wrong reaching the chat service. Reach me at niranjan.vsks@gmail.com.",
        };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-end p-0 sm:items-center sm:justify-center sm:p-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative flex h-[100dvh] w-full flex-col border border-green/30 bg-bg font-mono sm:h-[640px] sm:max-w-2xl sm:rounded-lg">
        {/* header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-green/40 bg-surface text-green">
              N
            </div>
            <div>
              <p className="text-[13px] text-green">ask_niranjan</p>
              <p className="text-[11px] text-text-dim">
                Senior Agentic AI Engineer · interview simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-dim hover:text-green"
            aria-label="close chat"
          >
            [esc] ✕
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 text-[13px]">
          {messages.length === 0 && (
            <div className="text-text-dim">
              <p className="mb-3 text-green">
                {`> ask me about my work, decisions, and how I ship into enterprise environments.`}
              </p>
              <p className="mb-2">{`> try:`}</p>
              <div className="flex flex-col gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded border border-border px-3 py-1.5 text-left text-cyan hover:border-cyan/50"
                  >
                    {`> ${s}`}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className="mb-4">
              <p
                className={
                  m.role === "user" ? "text-cyan" : "text-green"
                }
              >
                {m.role === "user" ? "> you" : "> niranjan"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-text">
                {m.content || (busy ? "…" : "")}
              </p>
            </div>
          ))}
        </div>

        {/* input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-border px-4 py-3 text-[13px]"
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
    </div>
  );
}
