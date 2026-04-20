"use client";

import { motion } from "motion/react";
import { Database, FileCheck, Search, Sparkles } from "lucide-react";

const STEPS = [
  {
    num: "01",
    icon: Search,
    title: "Choose a company",
    description:
      "Search any public company by name or ticker. LedgerLens immediately indexes all available filings, macro context, and news."
  },
  {
    num: "02",
    icon: Database,
    title: "Sources are retrieved",
    description:
      "Your question triggers a semantic search across SEC filings, FRED series, and three news providers. Top evidence is assembled."
  },
  {
    num: "03",
    icon: Sparkles,
    title: "Grounded answer streams",
    description:
      "The model synthesizes only from retrieved evidence. Every factual claim gets an inline citation you can click to verify."
  },
  {
    num: "04",
    icon: FileCheck,
    title: "Save and follow up",
    description:
      "Save the workspace, bookmark key answers, and ask follow-up questions. Session memory keeps context across the conversation."
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative px-6 py-32">
      <div className="absolute inset-0 bg-[var(--ll-bg-surface)] opacity-40" />

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-4xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-5xl"
          >
            How it works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-[var(--ll-text-secondary)]"
          >
            From question to grounded answer in seconds.
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={[
                "flex gap-5 rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] p-6",
                "transition-colors duration-200 hover:border-[var(--ll-border-strong)]"
              ].join(" ")}
            >
              <div className="flex-shrink-0">
                <span className="font-mono text-xs font-semibold tracking-[0.06em] text-[var(--ll-accent)]">
                  {step.num}
                </span>
              </div>
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <step.icon size={16} className="text-[var(--ll-accent)]" />
                  <h3 className="text-base font-semibold tracking-[-0.01em] text-[var(--ll-text-primary)]">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
