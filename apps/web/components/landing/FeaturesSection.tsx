"use client";

import { motion } from "motion/react";

import { FeaturesGrid } from "@/components/landing/FeaturesGrid";

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

        <FeaturesGrid />
      </div>
    </section>
  );
}
