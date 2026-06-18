import { getSection } from "@/lib/content";
import { Markdown } from "@/components/ui/Markdown";
import { PageShell } from "@/components/sections/PageShell";
import { ButtonLink } from "@/components/ui/Button";
import { Globe } from "@/components/3d/Globe";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  const contact = getSection("contact");
  const fm = (contact?.frontmatter ?? {}) as Record<string, string>;

  const links = [
    { label: "email", value: fm.email, href: `mailto:${fm.email}` },
    { label: "linkedin", value: "in/niranjanvsks", href: fm.linkedin },
    { label: "github", value: "niranjanvsks", href: fm.github },
  ].filter((l) => l.href);

  return (
    <PageShell eyebrow="contact" title="Get in touch">
      <div className="grid gap-12 md:grid-cols-2">
        <div>
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
            <ButtonLink href="/?ask=1" variant="outline" size="md">
              ask_niranjan
            </ButtonLink>
          </div>
          {fm.availability && (
            <p className="mt-6 font-mono text-[13px] text-cyan">
              {`> ${fm.availability}`}
            </p>
          )}
        </div>
        <div className="relative min-h-[360px]">
          <Globe />
        </div>
      </div>
    </PageShell>
  );
}
