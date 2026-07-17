"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";

/**
 * "Work with me": a professional hire CTA that opens an editable email popup.
 * The recruiter names their organization and picks the role from a dropdown;
 * a tailored subject + body are drafted automatically (and stay in sync until
 * the recruiter hand-edits either field), then sent via Gmail, Outlook, or
 * their default mail app.
 */

const TO = "niranjan.vsks@gmail.com";

const ROLES = [
  "Forward Deployed Engineer",
  "Senior Agentic AI Engineer",
  "Senior AI Architect",
  "Senior GenAI / Agentic AI Engineer",
] as const;

function buildSubject(org: string, role: string) {
  const o = org.trim();
  return o ? `${role} opportunity at ${o}` : `${role} opportunity`;
}

function buildBody(org: string, role: string) {
  const who = org.trim() ? `${org.trim()} is` : "We are";
  return `Hi Niranjan,

I came across your portfolio and was impressed by your track record shipping production agentic and RAG systems into enterprise environments, end to end.

${who} hiring for a ${role}, and your experience looks like a strong fit for what we are building. Would you be open to a short conversation this week?

Best regards,
`;
}

export function WorkWithMe() {
  const [open, setOpen] = useState(false);
  const [org, setOrg] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  // null = still tracking org/role; a string = the recruiter hand-edited it.
  const [subjectOverride, setSubjectOverride] = useState<string | null>(null);
  const [bodyOverride, setBodyOverride] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const subject = subjectOverride ?? buildSubject(org, role);
  const body = bodyOverride ?? buildBody(org, role);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const enc = (s: string) => encodeURIComponent(s);
  const links = useMemo(
    () => ({
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(TO)}&su=${enc(subject)}&body=${enc(body)}`,
      outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${enc(TO)}&subject=${enc(subject)}&body=${enc(body)}`,
      mailto: `mailto:${TO}?subject=${enc(subject)}&body=${enc(body)}`,
    }),
    [subject, body],
  );

  return (
    <section className="mt-12">
      <h2 className="mb-3 font-mono text-xl text-green">{"> work_with_me"}</h2>
      <p className="max-w-xl text-[15px] leading-relaxed text-neutral-300">
        Building a forward-deployed, agentic AI, or production RAG team? Let&apos;s
        start the conversation. Tell me your organization and the role you&apos;re
        hiring for, and a tailored introduction is drafted for you in one click.
        Review it, then send with Gmail, Outlook, or your default mail app.
      </p>
      <div className="mt-5">
        <HoverBorderGradient onClick={() => setOpen(true)} className="text-[15px]">
          ✉ Start a hiring conversation
        </HoverBorderGradient>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Compose hiring email"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-green/30 bg-[#0b0e0c] shadow-[0_0_60px_-15px_rgba(74,222,128,0.4)]"
          >
            <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-800/80 px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="ml-1.5 font-mono text-[11.5px] text-neutral-400">~/compose-mail.sh</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="ml-auto text-text-dim transition-colors hover:text-green"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 p-5">
              <div className="flex items-center gap-2 font-mono text-[13px]">
                <span className="w-16 text-text-dim">to:</span>
                <span className="text-green">{TO}</span>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="wwm-org" className="w-16 shrink-0 font-mono text-[13px] text-text-dim">org:</label>
                <input
                  id="wwm-org"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="Your organization"
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[14px] text-white outline-none placeholder:text-neutral-600 focus:border-green/60"
                />
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="wwm-role" className="w-16 shrink-0 font-mono text-[13px] text-text-dim">role:</label>
                <select
                  id="wwm-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[14px] text-white outline-none [color-scheme:dark] focus:border-green/60"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="wwm-subject" className="w-16 shrink-0 font-mono text-[13px] text-text-dim">subject:</label>
                <input
                  id="wwm-subject"
                  value={subject}
                  onChange={(e) => setSubjectOverride(e.target.value)}
                  className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-[14px] text-white outline-none focus:border-green/60"
                />
              </div>
              <textarea
                value={body}
                onChange={(e) => setBodyOverride(e.target.value)}
                rows={9}
                aria-label="Email body"
                className="w-full resize-y rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-[14px] leading-relaxed text-neutral-200 outline-none focus:border-green/60"
              />
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={links.gmail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green px-4 py-2 text-[13.5px] font-medium text-bg transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Send via Gmail
                </a>
                <a
                  href={links.outlook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[#4aa8ff]/60 px-4 py-2 text-[13.5px] font-medium text-[#4aa8ff] transition-colors hover:bg-[#4aa8ff]/10"
                >
                  Send via Outlook
                </a>
                <a
                  href={links.mailto}
                  className="rounded-lg border border-neutral-700 px-4 py-2 text-[13.5px] text-neutral-300 transition-colors hover:border-green/50 hover:text-green"
                >
                  Default mail app
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
