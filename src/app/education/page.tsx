import type { Metadata } from "next";
import { PageBackground } from "@/components/backgrounds/PageBackground";
import { PageShell } from "@/components/sections/PageShell";
import { CredentialGrid } from "@/components/sections/CredentialGrid";
import { EDUCATION } from "@/lib/credentials";

export const metadata: Metadata = {
  title: "Education",
  description: "Niranjan's education: PG Diploma in ML & AI (IIIT Bangalore) and B.Tech in Computer Science.",
};

export default function EducationPage() {
  return (
    <>
      <PageBackground variant="wave-galaxy" />
      <PageShell eyebrow="education" title="Education">
        <CredentialGrid items={EDUCATION} />
      </PageShell>
    </>
  );
}
