import type { Metadata } from "next";

import { AboutPageContent } from "@/components/landing/AboutPageContent";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export const metadata: Metadata = {
  title: "About",
  description:
    "LedgerLens is a cited-first analyst workspace for filings, FRED macro, and news. Principles, capability map, and how we think about grounded research."
};

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <AboutPageContent />
      <Footer />
    </>
  );
}
