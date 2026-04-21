"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { MeshGradient } from "@/components/effects/MeshGradient";
import { GlowButton } from "@/components/effects/GlowButton";

export function CTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-32">
      <MeshGradient className="opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(45,212,191,0.06),transparent)]" />

      <div className="relative mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6 text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-6xl"
        >
          Stop guessing.
          <br />
          <span className="text-[var(--ll-accent)]">Start knowing.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-[var(--ll-text-secondary)]"
        >
          Every answer is grounded in evidence. Every claim is cited. Start your analysis in seconds. Free, no card
          required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <GlowButton variant="primary" size="lg" href="/work" className="inline-flex">
            Get started free
            <ArrowRight size={16} />
          </GlowButton>
        </motion.div>
      </div>
    </section>
  );
}
