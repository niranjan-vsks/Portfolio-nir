import { getSection } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/sections/PageShell";
import dynamic from "next/dynamic";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";
import { WorkWithMe } from "@/components/sections/WorkWithMe";
import type { Metadata } from "next";

// AGain Fixes 2026-07-12: Solaris was glaring — replaced by the outer-space
// starfield, with the Starman holding the right side of the page.
const StarfieldBackdrop = dynamic(() => import("@/components/backgrounds/StarfieldBackdrop"));

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Niranjan VSKS · email, LinkedIn, GitHub, résumé. Remote-first, available to work with teams globally.",
};

function ChannelCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string;
  sub: string;
  href: string;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group block overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/80 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-green/50 hover:shadow-[0_0_40px_-10px_rgba(74,222,128,0.45)]"
    >
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-800/80 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" />
        <span className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 truncate font-mono text-[12px] text-neutral-400">~/{label}.sh</span>
      </div>
      <div className="p-6">
        <div className="font-mono text-[14px] text-green">$ open {label}</div>
        <div className="mt-2.5 break-all text-[17.5px] font-semibold text-white">{value}</div>
        <div className="mt-1.5 text-[14.5px] text-[#4aa8ff]">{sub}</div>
        <div className="mt-5 font-mono text-[13px] text-text-dim transition-colors group-hover:text-green">
          {external ? "opens in a new tab ↗" : "opens your mail client →"}
        </div>
      </div>
    </a>
  );
}

export default function ContactPage() {
  const contact = getSection("contact");
  const fm = (contact?.frontmatter ?? {}) as Record<string, string>;

  const channels = [
    fm.email && {
      label: "email",
      value: fm.email,
      sub: "the direct line, replies in 24-48h",
      href: `mailto:${fm.email}`,
    },
    fm.linkedin && {
      label: "linkedin",
      value: "in/niranjanvsks",
      sub: "the professional trail",
      href: fm.linkedin,
    },
    fm.github && {
      label: "github",
      value: "niranjan-vsks",
      sub: "the code behind the claims",
      href: fm.github,
    },
  ].filter(Boolean) as { label: string; value: string; sub: string; href: string }[];

  return (
    <>
      <StarfieldBackdrop fixed />
      <PageShell eyebrow="contact" title="Get in touch">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="text-[16.5px] leading-relaxed text-neutral-200">
              {contact && (
                <Markdown html={contact.html.replace(/<h2>[\s\S]*?<\/h2>/, "")} />
              )}
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {channels.map((c) => (
                <ChannelCard key={c.label} {...c} />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <HoverBorderGradient href="/Niranjan_VSKS_FDE_P1.pdf" target="_blank" className="text-[15px]">
                ↓ Résumé (PDF)
              </HoverBorderGradient>
              <HoverBorderGradient href="/chat" className="text-[15px]">
                ask_niranjan
              </HoverBorderGradient>
            </div>

            <WorkWithMe />

            <p className="mt-10 font-mono text-[15px] text-[#4aa8ff]">
              {`> ${fm.availability ?? "Remote-first. Available to work with teams globally."}`}
            </p>
          </div>

          {/* Starman on the right — a touch bigger than the landing popup */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 overflow-hidden rounded-2xl border border-white/10 bg-black/80 shadow-2xl">
              <video
                src="/starman/star-man.mp4"
                poster="/starman/star-man.jpg"
                autoPlay
                loop
                muted
                playsInline
                className="block aspect-square w-full object-cover"
              />
              <p className="border-t border-white/5 px-4 py-3 text-center font-mono text-[12.5px] text-text-dim">
                {"> signal me. I read every message."}
              </p>
            </div>
          </aside>
        </div>
      </PageShell>
    </>
  );
}
