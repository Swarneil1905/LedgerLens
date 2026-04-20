"use client";

import { motion } from "motion/react";

const QUOTES = [
  {
    quote:
      "I stopped copy-pasting between EDGAR and my notes. The citations are tight enough that I trust the first draft.",
    name: "Research analyst",
    firm: "Long/short equity"
  },
  {
    quote: "Macro context from FRED next to filing deltas is the workflow I didn’t know I was missing.",
    name: "PM",
    firm: "Multi-strategy fund"
  },
  {
    quote: "Streaming answers with sources appearing in lockstep — that’s how research tools should feel in 2026.",
    name: "Associate",
    firm: "Investment banking"
  }
];

export function TestimonialsSection() {
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
          Built with analysts, not demos
        </motion.h2>
        <div className="grid gap-6 md:grid-cols-3">
          {QUOTES.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] p-6"
            >
              <p className="mb-6 text-sm leading-relaxed text-[var(--ll-text-primary)]">&ldquo;{t.quote}&rdquo;</p>
              <footer>
                <p className="text-sm font-semibold text-[var(--ll-text-primary)]">{t.name}</p>
                <p className="text-xs text-[var(--ll-text-tertiary)]">{t.firm}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
