import type { Metadata } from "next";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";
import { CredentialGrid } from "@/components/sections/CredentialGrid";
import { CERTIFICATIONS } from "@/lib/credentials";

export const metadata: Metadata = {
  title: "Certifications",
  description: "Niranjan's certifications in product management for GenAI and agentic AI architecture.",
};

export default function CertificationsPage() {
  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <PageShell eyebrow="certifications" title="Certifications">
        <CredentialGrid items={CERTIFICATIONS} />
      </PageShell>
    </>
  );
}
