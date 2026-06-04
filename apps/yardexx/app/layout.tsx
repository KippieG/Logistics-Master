import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";
import CookieBanner from "@/components/ui/CookieBanner";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://yardexx.com";

export const metadata: Metadata = {
  title: {
    default: "YardExx — Terminalcapaciteit Marketplace",
    template: "%s | YardExx",
  },
  description:
    "Koop en verkoop surplus terminalcapaciteit anoniem. Container, RoRo, bulk, tank. België-first.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "YardExx — Terminalcapaciteit Marketplace",
    description: "Anonieme B2B marketplace voor Europese terminals.",
    type: "website",
    url: BASE_URL,
    siteName: "YardExx",
  },
  twitter: {
    card: "summary_large_image",
    title: "YardExx — Terminalcapaciteit Marketplace",
    description: "Anonieme B2B marketplace voor Europese terminals.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="nl">
      <body>
        <Navbar session={session} />
        <main>{children}</main>
        <CookieBanner />
      </body>
    </html>
  );
}
