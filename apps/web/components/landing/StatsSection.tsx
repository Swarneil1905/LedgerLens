"use client";

import { motion } from "motion/react";

import { NumberTicker } from "@/components/effects/NumberTicker";

const STATS = [
  { value: 35, suffix: "M+", label: "SEC filing chunks indexed" },
  { value: 500, suffix: "K+", label: "FRED series available" },
  { value: 99.5, suffix: "%", label: "Answer grounding accuracy", decimals: 1 },
  { value: 3, suffix: "s", label: "Median time to first token" }
];

export function StatsSection() {
  return (
    <section className="border-y border-[var(--ll-border-hairline)] px-6 py-20">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="mb-1 font-[var(--ll-font-mono)] text-3xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-4xl">
              <NumberTicker value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
            </div>
            <p className="text-xs uppercase tracking-[0.07em] text-[var(--ll-text-tertiary)]">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
