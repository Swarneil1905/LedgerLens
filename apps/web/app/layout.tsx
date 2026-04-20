import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { siteUrl } from "@/lib/site-url";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap"
});

import "./globals.css";

const base = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "LedgerLens — AI Analyst Workspace for Financial Intelligence",
    template: "%s | LedgerLens"
  },
  description:
    "Grounded financial analysis powered by SEC filings, FRED macro data, and live news. Ask questions, get cited answers. Built for analysts who need precision.",
  keywords: [
    "financial analysis AI",
    "SEC filing analysis",
    "earnings analysis",
    "investment research",
    "FRED macroeconomic data",
    "RAG finance"
  ],
  authors: [{ name: "LedgerLens" }],
  creator: "LedgerLens",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: base,
    title: "LedgerLens — AI Analyst Workspace",
    description:
      "Ask anything about any company. Get grounded answers from SEC filings, macro data, and news.",
    siteName: "LedgerLens",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LedgerLens — AI Financial Analysis"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "LedgerLens — AI Analyst Workspace",
    description: "Ask anything about any company. Get grounded answers.",
    images: ["/og-image.png"],
    creator: "@ledgerlens"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[var(--ll-bg-base)] text-[var(--ll-text-primary)] antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
