import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/sections/SiteNav";
import { Footer } from "@/components/sections/Footer";
import { ClientErrorLogger } from "@/components/ClientErrorLogger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://niranjanvsks.xyz"),
  title: {
    default: "Niranjan VSKS — Senior Agentic AI Engineer (Forward Deployed)",
    template: "%s · Niranjan VSKS",
  },
  description:
    "Senior Agentic AI Engineer who ships production agentic and RAG systems into enterprise environments end to end: discovery, architecture, implementation, deployment.",
  openGraph: {
    title: "Niranjan VSKS — Senior Agentic AI Engineer (Forward Deployed)",
    description:
      "Ships production agentic and RAG systems into enterprise environments end to end.",
    type: "website",
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
        <ClientErrorLogger />
        <SiteNav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
