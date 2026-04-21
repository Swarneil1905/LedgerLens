"use client";

import { motion } from "motion/react";

const PRINCIPLES = [
  {
    title: "Citations you can audit",
    body: "Answers are built from retrieved filings, macro series, and news (not from undocumented model memory), so you can verify claims against the underlying sources."
  },
  {
    title: "One workspace, not twelve tabs",
    body: "SEC context, FRED indicators, and headlines stay in a single thread so you spend less time tab-hopping and more time on judgment."
  },
  {
    title: "Streaming with evidence in view",
    body: "As the model responds, supporting material stays visible alongside the answer so you never wonder where a number or quote came from."
  }
];

export function PrinciplesSection() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="mb-12 text-center text-3xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-4xl"
        >
          Research-grade by design
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PRINCIPLES.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] p-6"
            >
              <h3 className="mb-3 text-base font-semibold tracking-[-0.02em] text-[var(--ll-text-primary)]">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{item.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
