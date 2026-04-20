"use client";

import { motion } from "motion/react";
import { BarChart3, BookMarked, Brain, FileSearch, Newspaper, Zap } from "lucide-react";

import { SpotlightCard } from "@/components/effects/SpotlightCard";

const FEATURES = [
  {
    icon: FileSearch,
    title: "SEC Filing Analysis",
    description:
      "Instantly surface what changed between 10-K and 10-Q filings. Risk factors, revenue mix, management commentary — all searchable.",
    color: "var(--ll-source-sec)",
    spotlight: "color-mix(in oklch, var(--ll-source-sec) 14%, transparent)"
  },
  {
    icon: BarChart3,
    title: "FRED Macro Context",
    description:
      "Every answer is automatically contextualized with relevant macro indicators — interest rates, CPI, employment, industrial output.",
    color: "var(--ll-source-fred)",
    spotlight: "color-mix(in oklch, var(--ll-source-fred) 14%, transparent)"
  },
  {
    icon: Newspaper,
    title: "Live News Synthesis",
    description:
      "Three independent news sources cross-referenced against filing data. Breaking developments surface before they hit consensus.",
    color: "var(--ll-source-news)",
    spotlight: "color-mix(in oklch, var(--ll-source-news) 14%, transparent)"
  },
  {
    icon: Brain,
    title: "Grounded Answers Only",
    description:
      "Every claim is cited. The model cannot fabricate — it can only synthesize from retrieved evidence. Citation superscripts link to sources.",
    color: "var(--ll-accent)",
    spotlight: "color-mix(in oklch, var(--ll-accent) 14%, transparent)"
  },
  {
    icon: BookMarked,
    title: "Persistent Workspaces",
    description: "Save company workspaces, bookmark key answers, and resume sessions. Your research persists across logins.",
    color: "var(--ll-source-sec)",
    spotlight: "color-mix(in oklch, var(--ll-source-sec) 12%, transparent)"
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    description:
      "Answers stream token by token. Sources populate as they're retrieved. No waiting for a full response before you start reading.",
    color: "var(--ll-source-fred)",
    spotlight: "color-mix(in oklch, var(--ll-source-fred) 12%, transparent)"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-[var(--ll-accent)]"
          >
            Built for analysts
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4 text-4xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-5xl"
          >
            Everything in one workspace
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mx-auto max-w-xl text-lg text-[var(--ll-text-secondary)]"
          >
            Stop switching between Bloomberg, EDGAR, and news tabs. LedgerLens brings it all into one grounded AI
            workspace.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
            >
              <SpotlightCard spotlightColor={feature.spotlight} className="h-full p-6">
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-[var(--ll-radius-md)]"
                  style={{
                    background: `color-mix(in oklch, ${feature.color} 12%, transparent)`,
                    border: `1px solid color-mix(in oklch, ${feature.color} 35%, transparent)`
                  }}
                >
                  <feature.icon size={20} style={{ color: feature.color }} />
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-[-0.01em] text-[var(--ll-text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{feature.description}</p>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
