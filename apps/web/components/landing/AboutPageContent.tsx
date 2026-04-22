"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  BookMarked,
  BookOpen,
  LineChart,
  Newspaper,
  Scale,
  ShieldCheck,
  Sparkles,
  Workflow
} from "lucide-react";

import { GridPattern } from "@/components/effects/GridPattern";
import { GlowButton } from "@/components/effects/GlowButton";
import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { cn } from "@/lib/utils";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Evidence first",
    body: "Answers are assembled from retrieved filings, macro series, and news. Citations exist so you can reopen the source, not so we can sound confident without proof."
  },
  {
    icon: Workflow,
    title: "One thread",
    body: "Company workspaces keep chat, saved evidence, and context in one place. The goal is fewer tabs and less copy-paste between EDGAR, charts, and headlines."
  },
  {
    icon: Sparkles,
    title: "Fast feedback",
    body: "Responses stream while sources load in parallel. You read early tokens while the model still grounds itself, instead of waiting on a single opaque blob."
  }
] as const;

const CAPABILITIES = [
  {
    icon: Scale,
    title: "Filings in context",
    text: "10-K and 10-Q style workflows: diffs, risk language, and segment commentary surfaced next to your question, with paths back to the filing."
  },
  {
    icon: LineChart,
    title: "Macro next to micro",
    text: "FRED-style series sit beside company facts so rate and inflation moves inform the same answer as issuer-specific detail."
  },
  {
    icon: Newspaper,
    title: "News as a third leg",
    text: "Multiple wire and desk sources are cross-checked against filings so breaking items do not live in a separate browser silo."
  },
  {
    icon: BookMarked,
    title: "Bookmarks that stick",
    text: "Save evidence cards and reopen them from Saved or the workspace so a strong citation survives the end of a session."
  }
] as const;

function AboutWorkspaceDiagram({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-[var(--ll-radius-xl)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] shadow-[var(--ll-shadow-2)]",
        className
      )}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, color-mix(in oklch, var(--ll-accent) 14%, transparent), transparent 55%)"
        }}
      />
      <svg viewBox="0 0 480 300" className="relative h-full w-full text-[var(--ll-border-strong)]">
        <rect x="12" y="16" width="456" height="40" rx="6" fill="var(--ll-bg-elevated)" stroke="currentColor" strokeWidth="1" />
        <rect x="24" y="28" width="72" height="12" rx="3" fill="color-mix(in oklch, var(--ll-accent) 35%, transparent)" />
        <rect x="104" y="28" width="120" height="12" rx="3" fill="var(--ll-border-default)" opacity="0.9" />
        <rect x="12" y="68" width="200" height="212" rx="8" fill="var(--ll-bg-elevated)" stroke="currentColor" strokeWidth="1" />
        <rect x="220" y="68" width="248" height="100" rx="8" fill="var(--ll-bg-elevated)" stroke="currentColor" strokeWidth="1" />
        <rect x="220" y="180" width="248" height="100" rx="8" fill="var(--ll-bg-elevated)" stroke="currentColor" strokeWidth="1" />
        <text x="32" y="118" fill="var(--ll-text-tertiary)" fontSize="11" fontFamily="var(--ll-font-ui), system-ui, sans-serif">
          Workspace
        </text>
        <text x="236" y="108" fill="var(--ll-text-tertiary)" fontSize="11" fontFamily="var(--ll-font-ui), system-ui, sans-serif">
          Chat
        </text>
        <text x="236" y="220" fill="var(--ll-text-tertiary)" fontSize="11" fontFamily="var(--ll-font-ui), system-ui, sans-serif">
          Sources
        </text>
        <motion.rect
          x="236"
          y="124"
          width="180"
          height="6"
          rx="3"
          fill="var(--ll-accent)"
          initial={{ opacity: 0.35, width: 40 }}
          animate={{ opacity: [0.35, 0.85, 0.35], width: [40, 180, 120] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="236"
          y="236"
          width="100"
          height="6"
          rx="3"
          fill="var(--ll-source-sec)"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.75, 0.3], x: [236, 260, 236] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
    </div>
  );
}

export function AboutPageContent() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-[var(--ll-border-hairline)] px-6 pb-16 pt-24 md:pb-20 md:pt-28">
        <GridPattern
          className="opacity-[0.35]"
          dotColor="rgba(255,255,255,0.06)"
          gap={32}
          fade="edges"
        />
        <div className="relative mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="text-sm text-[var(--ll-text-tertiary)]">
            <Link href="/" className="transition-colors hover:text-[var(--ll-text-secondary)]">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--ll-text-primary)]">About</span>
          </nav>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_minmax(0,420px)] lg:items-center lg:gap-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)] px-3 py-1 text-xs font-medium text-[var(--ll-accent)]"
              >
                <BookOpen size={14} strokeWidth={2} />
                Mission
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl font-bold tracking-[-0.035em] text-[var(--ll-text-primary)] md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]"
              >
                Analysis software that respects the footnote
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.12 }}
                className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ll-text-secondary)]"
              >
                LedgerLens is a workspace for public-company research: you pick a ticker, ask in plain language, and
                get answers tied to filings, macro data, and news. We built it for people who still read the primary
                document, but want software to compress the search cost.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
            >
              <AboutWorkspaceDiagram />
              <p className="mt-3 text-center text-xs text-[var(--ll-text-tertiary)] lg:text-left">
                Schematic only: layout of workspace, chat, and sources panels.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-3xl">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="ll-section-label mb-3"
          >
            Overview
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-lg leading-relaxed text-[var(--ll-text-secondary)]"
          >
            Public markets generate more text and time series than any single analyst can reread each quarter. The
            useful unit of work is rarely “more model parameters.” It is faster navigation from a question to the exact
            paragraph, series, or headline that justifies a claim. LedgerLens keeps that chain short: query in the
            center, evidence on the side, bookmarks when something should outlive the chat.
          </motion.p>
          <motion.ul
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mt-8 space-y-3 text-[var(--ll-text-secondary)]"
          >
            {[
              "Designed around SEC-style filings, FRED macro, and desk news, not a generic chat wrapper.",
              "Workspaces are per company so prompts, sources, and saved clips stay scoped to one issuer.",
              "Streaming answers so you can start reading while retrieval and generation still run."
            ].map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-relaxed md:text-base">
                <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--ll-accent)]" />
                {item}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>

      <section className="border-y border-[var(--ll-border-hairline)] bg-[var(--ll-bg-surface)]/40 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4 }}
            className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ll-accent)]"
          >
            Principles
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="mx-auto mb-12 max-w-2xl text-center text-2xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-3xl"
          >
            How we think about product decisions
          </motion.p>
          <div className="grid gap-4 md:grid-cols-3">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
              >
                <SpotlightCard
                  spotlightColor="color-mix(in oklch, var(--ll-accent) 10%, transparent)"
                  className="h-full p-6"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--ll-radius-md)] border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)]">
                    <pillar.icon size={20} className="text-[var(--ll-accent)]" strokeWidth={1.75} />
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-[var(--ll-text-primary)]">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{pillar.body}</p>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="ll-section-label mb-3">Capability map</h2>
          <p className="mb-10 max-w-2xl text-lg text-[var(--ll-text-secondary)]">
            A concise map of what the UI is optimizing for today. Depth varies by ticker and data availability; the
            structure below is what you can rely on in the product.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] p-5 shadow-[var(--ll-shadow-1)]"
              >
                <div className="mb-3 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)]">
                    <cap.icon size={18} className="text-[var(--ll-text-secondary)]" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--ll-text-primary)]">{cap.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{cap.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--ll-border-hairline)] px-6 py-14 md:py-16">
        <div className="mx-auto max-w-3xl rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] px-6 py-8 md:px-8">
          <h2 className="ll-section-label mb-3">Reality check</h2>
          <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">
            LedgerLens is early. Some data is still illustrative or backed by in-memory demos while we wire production
            feeds and auth. The UI and API shape are real; treat numbers and snippets as product previews unless you
            have verified them against live filings and your own compliance process.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20 pt-4 md:pb-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[var(--ll-radius-xl)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] px-6 py-10 md:flex-row md:items-center md:px-10">
          <div>
            <p className="text-xl font-semibold tracking-[-0.02em] text-[var(--ll-text-primary)]">
              See the workspace on a ticker you already follow
            </p>
            <p className="mt-2 max-w-md text-sm text-[var(--ll-text-secondary)]">
              Features page lists capabilities; the workspace is where they show up together.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:w-auto">
            <GlowButton variant="secondary" size="md" href="/features" className="w-full sm:w-auto">
              Read features
            </GlowButton>
            <GlowButton variant="primary" size="md" href="/work" className="w-full sm:w-auto">
              Open workspace
            </GlowButton>
          </div>
        </div>
      </section>
    </main>
  );
}
