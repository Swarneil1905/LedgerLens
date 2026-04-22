import type { Metadata } from "next";
import Link from "next/link";

import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { GlowButton } from "@/components/effects/GlowButton";
import { LANDING_FEATURES } from "@/lib/landing-features";

export const metadata: Metadata = {
  title: "Features",
  description:
    "SEC filings, FRED macro, live news, cited answers, workspaces, and streaming responses in one LedgerLens workspace."
};

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main>
        <header className="border-b border-[var(--ll-border-hairline)] px-6 pb-10 pt-24 md:pt-28">
          <div className="mx-auto max-w-6xl">
            <nav aria-label="Breadcrumb" className="text-sm text-[var(--ll-text-tertiary)]">
              <Link href="/" className="transition-colors hover:text-[var(--ll-text-secondary)]">
                Home
              </Link>
              <span className="mx-2 text-[var(--ll-text-tertiary)]">/</span>
              <span className="text-[var(--ll-text-primary)]">Features</span>
            </nav>
            <p className="ll-section-label mb-3 mt-8">Product</p>
            <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-5xl">
              Everything in one workspace
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--ll-text-secondary)]">
              Filings, macro series, and headlines feed the same analysis thread. Each capability below is live in the
              workspace today.
            </p>
          </div>
        </header>

        <section className="px-6 py-16 md:py-20" aria-labelledby="features-grid-heading">
          <div className="mx-auto max-w-6xl">
            <h2 id="features-grid-heading" className="sr-only">
              Feature list
            </h2>
            <FeaturesGrid features={LANDING_FEATURES} />
          </div>
        </section>

        <section className="border-t border-[var(--ll-border-hairline)] px-6 py-16">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-semibold tracking-[-0.02em] text-[var(--ll-text-primary)]">
                Try it on a company you follow
              </p>
              <p className="mt-1 text-sm text-[var(--ll-text-secondary)]">
                Open the workspace, run a query, and watch sources line up with the answer.
              </p>
            </div>
            <GlowButton variant="primary" size="md" href="/work">
              Open workspace
            </GlowButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
