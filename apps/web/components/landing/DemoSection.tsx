"use client";

import { motion } from "motion/react";
import { Play } from "lucide-react";

import { GlowButton } from "@/components/effects/GlowButton";
import { GridPattern } from "@/components/effects/GridPattern";

export function DemoSection() {
  return (
    <section id="demo" className="relative px-6 py-32">
      <GridPattern className="opacity-40" dotColor="rgba(255,255,255,0.05)" gap={24} fade="center" />
      <div className="relative mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-3xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-4xl"
        >
          See LedgerLens in action
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mb-10 text-[var(--ll-text-secondary)]"
        >
          Open the workspace, pick a ticker, and watch citations attach to every number in the answer stream.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto flex aspect-video max-h-[360px] items-center justify-center overflow-hidden rounded-[var(--ll-radius-xl)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] shadow-[var(--ll-shadow-2)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--ll-accent-dim)] to-transparent" />
          <div className="relative flex flex-col items-center gap-4 px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--ll-accent-border)] bg-[var(--ll-bg-elevated)] text-[var(--ll-accent)]">
              <Play size={28} className="ml-1" fill="currentColor" />
            </div>
            <p className="text-sm text-[var(--ll-text-tertiary)]">Product walkthrough · 2 min</p>
            <GlowButton variant="primary" size="md" href="/work">
              Try the workspace
            </GlowButton>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
