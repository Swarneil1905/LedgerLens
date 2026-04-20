"use client";

import { motion } from "motion/react";
import { BarChart3, FileText, Newspaper } from "lucide-react";

const SOURCES = [
  {
    title: "SEC EDGAR",
    body: "10-K, 10-Q, 8-K, and exhibits — chunked, embedded, and retrievable with inline citations.",
    icon: FileText,
    accent: "var(--ll-source-sec)"
  },
  {
    title: "FRED",
    body: "Macro series aligned to your question — rates, inflation, labor, and activity in context.",
    icon: BarChart3,
    accent: "var(--ll-source-fred)"
  },
  {
    title: "Live news",
    body: "Multiple wire and web sources triangulated against filings so narrative never outruns evidence.",
    icon: Newspaper,
    accent: "var(--ll-source-news)"
  }
];

export function DataSourcesSection() {
  return (
    <section id="data-sources" className="border-y border-[var(--ll-border-hairline)] px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center text-4xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-5xl"
        >
          Evidence you can audit
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto mb-14 max-w-2xl text-center text-lg text-[var(--ll-text-secondary)]"
        >
          LedgerLens only answers from retrieved sources. No hallucinated figures, no mystery “model knowledge.”
        </motion.p>

        <div className="grid gap-6 md:grid-cols-3">
          {SOURCES.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08 }}
              className="rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] p-6"
            >
              <div
                className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--ll-radius-md)] border"
                style={{
                  borderColor: `color-mix(in oklch, ${s.accent} 40%, transparent)`,
                  background: `color-mix(in oklch, ${s.accent} 12%, transparent)`
                }}
              >
                <s.icon size={20} style={{ color: s.accent }} />
              </div>
              <h3 className="mb-2 text-base font-semibold text-[var(--ll-text-primary)]">{s.title}</h3>
              <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
