"use client";

import Image from "next/image";
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
 * ask_niranjan chat surface — R8 premium rebuild (PRD 15.2). Symmetric
 * terminal-window frame (traffic-light chrome), avatar-anchored assistant
 * bubbles, right-aligned user bubbles, glowing input bar, FAQ chips,
 * aria-live streaming, blinking caret while the model streams. Own stacking
 * context; no session history persisted. Honest-but-thin until interview
 * content lands (by design, never fabricated).
 */
export function ChatSurface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [busy]);

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

  const Avatar = ({ size = 34 }: { size?: number }) => (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-green/40"
      style={{ width: size, height: size }}
    >
      <Image src="/niranjan-photo.jpg" alt="" fill sizes={`${size}px`} className="object-cover" />
    </div>
  );

  return (
    <div className="relative isolate mx-auto flex h-[calc(100vh-7.5rem)] max-w-2xl flex-col overflow-hidden rounded-2xl border border-green/25 bg-[#080b09]/92 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9),0_0_50px_-25px_rgba(74,222,128,0.4)] backdrop-blur-md">
      {/* terminal chrome header */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-neutral-900/80 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-yellow-500" />
          <span className="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span className="font-mono text-[12px] text-neutral-400">~/ask_niranjan.sh</span>
        <div className="ml-auto flex items-center gap-2.5">
          <Avatar size={30} />
          <div className="text-right">
            <p className="font-mono text-[12.5px] leading-tight text-green">niranjan_vsks</p>
            <p className="font-mono text-[10.5px] leading-tight text-text-dim">
              <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green align-middle" />
              interview simulation
            </p>
          </div>
        </div>
      </div>

      {/* messages */}
      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 overflow-y-auto px-4 py-5 sm:px-6"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-center">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-4 w-fit">
                <Avatar size={56} />
              </div>
              <p className="text-[16px] font-medium text-white">
                Ask me about my work, decisions, and how I ship into enterprise environments.
              </p>
              <p className="mt-1.5 font-mono text-[12px] text-text-dim">
                answers ground in real project content · nothing invented
              </p>
            </div>
            <div className="mx-auto mt-7 flex max-w-md flex-col gap-2.5">
              {FAQS.map((f) => (
                <button
                  key={f}
                  onClick={() => send(f)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-left font-mono text-[13px] text-cyan-300 transition-all hover:-translate-y-px hover:border-green/50 hover:text-green hover:shadow-[0_0_18px_-6px_rgba(74,222,128,0.5)]"
                >
                  {`> ${f}`}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="mb-5 flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md border border-cyan-400/20 bg-cyan-400/[0.07] px-4 py-2.5 text-[14px] leading-relaxed text-neutral-100">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={i} className="mb-5 flex items-start gap-3">
                <Avatar />
                <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-green/15 bg-green/[0.05] px-4 py-2.5 text-[14px] leading-relaxed text-neutral-200">
                  <span className="whitespace-pre-wrap">{m.content}</span>
                  {busy && i === messages.length - 1 && (
                    <span className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-green" />
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-white/5 bg-neutral-900/60 px-4 py-3.5"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-green/30 bg-bg px-4 py-2 transition-shadow focus-within:border-green/60 focus-within:shadow-[0_0_22px_-6px_rgba(74,222,128,0.55)]">
          <span className="font-mono text-[14px] text-green">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ask anything…"
            aria-label="Ask Niranjan a question"
            className="flex-1 bg-transparent text-[14px] text-text caret-green outline-none placeholder:text-text-dim"
            disabled={busy}
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-full bg-green px-4 py-1.5 font-mono text-[12.5px] font-semibold text-bg transition-transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          >
            {busy ? "…" : "send ↵"}
          </button>
        </div>
        <p className="mt-2 text-center font-mono text-[10.5px] text-text-dim">
          no chat history is stored · rate limited · answers cite real work only
        </p>
      </form>
    </div>
  );
}
