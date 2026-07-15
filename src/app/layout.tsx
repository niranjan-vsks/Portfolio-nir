import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/sections/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { ClientErrorLogger } from "@/components/ClientErrorLogger";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const SITE_TITLE =
  "Niranjan VSKS · Senior Agentic AI Engineer (Forward Deployed)";
const SITE_DESC =
  "Senior Agentic AI Engineer who ships production agentic and RAG systems into enterprise environments end to end: discovery, architecture, implementation, deployment.";

export const metadata: Metadata = {
  metadataBase: new URL("https://niranjanvsks.xyz"),
  title: { default: SITE_TITLE, template: "%s · Niranjan VSKS" },
  description: SITE_DESC,
  keywords: [
    "Agentic AI Engineer",
    "Forward Deployed Engineer",
    "RAG",
    "LLM",
    "Niranjan VSKS",
    "AI systems",
  ],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    type: "website",
    siteName: "Niranjan VSKS",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="min-h-full bg-bg text-text">
        <PostHogProvider>
          <SoundProvider>
            <ClientErrorLogger />
            <SiteNav />
            {children}
            <Footer />
          </SoundProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
