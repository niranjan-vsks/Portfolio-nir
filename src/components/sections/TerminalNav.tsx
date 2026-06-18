"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Command {
  cmd: string;
  desc: string;
  run: (router: ReturnType<typeof useRouter>) => string | void;
}

const COMMANDS: Command[] = [
  { cmd: "cinematic", desc: "open the cinematic landing", run: (r) => r.push("/") },
  { cmd: "map", desc: "open the 3D mind map", run: (r) => r.push("/map") },
  { cmd: "about", desc: "bio + 7-year experience arc", run: (r) => r.push("/about") },
  { cmd: "projects", desc: "all projects", run: (r) => r.push("/projects") },
  { cmd: "loop-copilot", desc: "project: AI CRM copilot (live)", run: (r) => r.push("/projects/loop-copilot") },
  { cmd: "saarthi", desc: "project: voice-first financial copilot", run: (r) => r.push("/projects/saarthi") },
  { cmd: "rebalancer", desc: "project: portfolio rebalancing agent", run: (r) => r.push("/projects/rebalancer") },
  { cmd: "qe-platform", desc: "project: agentic QE platform", run: (r) => r.push("/projects/qe-platform") },
  { cmd: "system-design", desc: "reference architectures", run: (r) => r.push("/system-design") },
  { cmd: "skills", desc: "skills overview", run: (r) => r.push("/skills/all") },
  { cmd: "contact", desc: "contact + résumé", run: (r) => r.push("/contact") },
  { cmd: "resume", desc: "download résumé (pdf)", run: () => { window.open("/NiranjanVSKS_FDE.pdf", "_blank"); } },
  { cmd: "ask", desc: "ask_niranjan chatbot", run: (r) => r.push("/?ask=1") },
];

const BANNER = [
  "niranjan.vsks :: terminal mode",
  "Senior Agentic AI Engineer (Forward Deployed)",
  "type a command and press enter. 'help' lists everything. tab to autocomplete.",
];

export function TerminalNav() {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [cursor, setCursor] = useState(0); // selected command for arrow nav
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  function exec(raw: string) {
    const value = raw.trim().toLowerCase();
    if (!value) return;
    const out: string[] = [`> ${value}`];
    if (value === "help" || value === "ls") {
      out.push(...COMMANDS.map((c) => `  ${c.cmd.padEnd(16)} ${c.desc}`));
    } else if (value === "clear") {
      setHistory([]);
      return;
    } else {
      const match = COMMANDS.find((c) => c.cmd === value);
      if (match) {
        out.push(`  opening ${match.cmd} ...`);
        match.run(router);
      } else {
        out.push(`  command not found: ${value}. type 'help'.`);
      }
    }
    setHistory((h) => [...h, ...out]);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      exec(input);
      setInput("");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, COMMANDS.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Tab") {
      e.preventDefault();
      const hit = COMMANDS.find((c) => c.cmd.startsWith(input.toLowerCase()));
      if (hit) setInput(hit.cmd);
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-10 font-mono text-[13px]">
      <div
        className="min-h-[70vh] rounded-lg border border-border bg-surface/40 p-5 leading-relaxed"
        onClick={() => inputRef.current?.focus()}
      >
        {BANNER.map((line, i) => (
          <p key={i} className={i === 0 ? "text-green" : "text-text-dim"}>
            {line}
          </p>
        ))}

        <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
          {COMMANDS.map((c, i) => (
            <button
              key={c.cmd}
              onClick={() => exec(c.cmd)}
              onMouseEnter={() => setCursor(i)}
              className={`flex gap-3 rounded px-2 py-0.5 text-left transition-colors ${
                cursor === i ? "bg-green/10 text-green" : "text-text-dim hover:text-green"
              }`}
            >
              <span className="w-32 shrink-0">{`> ${c.cmd}`}</span>
              <span className="truncate">{c.desc}</span>
            </button>
          ))}
        </div>

        {history.length > 0 && (
          <pre className="mt-5 whitespace-pre-wrap text-text">
            {history.join("\n")}
          </pre>
        )}

        <div className="mt-4 flex items-center gap-2 text-green">
          <span>niranjan@portfolio:~$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="terminal command input"
            className="flex-1 bg-transparent text-text caret-green outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div ref={endRef} />
      </div>
      <p className="mt-3 text-text-dim">
        {`> enter`} runs · {`tab`} autocompletes · {`arrows`} move · {`'help'`} lists all · {`'clear'`} resets
      </p>
    </div>
  );
}
