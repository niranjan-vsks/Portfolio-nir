import { getSection } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/sections/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach Niranjan VSKS — email, LinkedIn, GitHub, résumé. Remote-first, available to work with teams globally.",
};

export default function ContactPage() {
  const contact = getSection("contact");
  const fm = (contact?.frontmatter ?? {}) as Record<string, string>;

  const links = [
    { label: "email", value: fm.email, href: `mailto:${fm.email}` },
    { label: "linkedin", value: "in/niranjanvsks", href: fm.linkedin },
    { label: "github", value: "niranjanvsks", href: fm.github },
  ].filter((l) => l.href);

  return (
    <>
      <PageBackground variant="particle-sphere" />
      <PageShell eyebrow="contact" title="Get in touch">
        <div className="max-w-2xl">
          {contact && <Markdown html={contact.html} />}

          <div className="mt-8 space-y-3 font-mono text-[13px]">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href?.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-text-dim hover:text-green"
              >
                <span className="w-20 text-green">{`> ${l.label}`}</span>
                <span>{l.value}</span>
              </a>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink
              href="/NiranjanVSKS_FDE.pdf"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
              size="md"
            >
              ↓ Download Résumé (PDF)
            </ButtonLink>
            <ButtonLink href="/chat" variant="outline" size="md">
              ask_niranjan
            </ButtonLink>
          </div>

          <p className="mt-8 font-mono text-[13px] text-purple">
            {`> ${fm.availability ?? "Remote-first. Available to work with teams globally."}`}
          </p>
        </div>
      </PageShell>
    </>
  );
}
