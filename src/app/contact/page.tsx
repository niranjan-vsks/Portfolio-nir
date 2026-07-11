import { getSection } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/sections/PageShell";
import dynamic from "next/dynamic";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";

// Solaris (R9/DG-3): the breathing particle sun replaces Particle Sphere.
const SolarisBackdrop = dynamic(() => import("@/components/backgrounds/SolarisBackdrop"));
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Niranjan VSKS · email, LinkedIn, GitHub, résumé. Remote-first, available to work with teams globally.",
};

/* Premium contact rebuild (Right_Now fixes 2026-07-11): channel CARDS instead
   of bare text lines; copper-blue + green contrast against the particle bg
   (purple-on-purple was rejected); bigger, legible type; the one true button. */

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
      <div className="flex items-center gap-1.5 border-b border-white/5 bg-neutral-800/80 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <span className="ml-1.5 truncate font-mono text-[11px] text-neutral-400">~/{label}.sh</span>
      </div>
      <div className="p-5">
        <div className="font-mono text-[13px] text-green">$ open {label}</div>
        <div className="mt-2 break-all text-[16px] font-semibold text-white">{value}</div>
        <div className="mt-1 text-[13.5px] text-[#4aa8ff]">{sub}</div>
        <div className="mt-4 font-mono text-[12px] text-text-dim transition-colors group-hover:text-green">
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
      <SolarisBackdrop />
      <PageShell eyebrow="contact" title="Get in touch">
        <div className="max-w-3xl">
          <div className="text-[16px] leading-relaxed text-neutral-200">
            {/* the PageShell already titles the page; drop the body's own H2 */}
            {contact && (
              <Markdown html={contact.html.replace(/<h2>[\s\S]*?<\/h2>/, "")} />
            )}
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

          <p className="mt-10 font-mono text-[15px] text-[#4aa8ff]">
            {`> ${fm.availability ?? "Remote-first. Available to work with teams globally."}`}
          </p>
        </div>
      </PageShell>
    </>
  );
}
