import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/sections/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { ClientErrorLogger } from "@/components/ClientErrorLogger";
import { SoundProvider } from "@/components/providers/SoundProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import { MobileWebHint } from "@/components/sections/MobileWebHint";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "Niranjan VSKS · Senior Agentic AI Engineer";
const SITE_DESC =
  "Ships production RAG and agentic systems for enterprise clients, discovery through deployment. Forward Deployed: full-stack agentic engineering, from RAG platforms to multi-agent operations tooling.";

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
        {/* Warm the Contact-page Starman poster in the background (low priority)
            so the avatar is ready the moment the contact route paints. The mp4
            itself is left to load on the contact page to avoid an unused-preload
            warning on every other route. */}
        <link rel="prefetch" href="/starman/star-man.jpg" />
        <PostHogProvider>
          <SoundProvider>
            <ClientErrorLogger />
            <SiteNav />
            {children}
            <Footer />
            <MobileWebHint />
          </SoundProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
