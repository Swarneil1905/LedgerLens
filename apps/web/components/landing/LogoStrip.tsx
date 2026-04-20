"use client";

import { motion, useReducedMotion } from "motion/react";

const LOGOS = [
  "SEC EDGAR",
  "FRED",
  "Reuters",
  "Bloomberg",
  "S&P 500",
  "Nasdaq",
  "FactSet",
  "Refinitiv",
  "Morningstar",
  "Pitchbook"
];

export function LogoStrip() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="overflow-hidden border-y border-[var(--ll-border-hairline)] py-16">
      <p className="mb-8 text-center text-xs uppercase tracking-[0.1em] text-[var(--ll-text-tertiary)]">
        Data sourced from trusted providers
      </p>
      <div className="relative flex">
        <div className="absolute bottom-0 left-0 top-0 z-10 w-32 bg-gradient-to-r from-[var(--ll-bg-base)] to-transparent" />
        <div className="absolute bottom-0 right-0 top-0 z-10 w-32 bg-gradient-to-l from-[var(--ll-bg-base)] to-transparent" />

        {reduceMotion ? (
          <div className="flex w-full flex-wrap justify-center gap-x-16 gap-y-4 px-8">
            {LOGOS.map((logo) => (
              <span
                key={logo}
                className="select-none whitespace-nowrap text-sm font-semibold uppercase tracking-[0.06em] text-[var(--ll-text-tertiary)]"
              >
                {logo}
              </span>
            ))}
          </div>
        ) : (
          <motion.div
            className="flex items-center gap-16"
            animate={{ x: [0, -50 * LOGOS.length] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <span
                key={`${logo}-${i}`}
                className="select-none whitespace-nowrap text-sm font-semibold uppercase tracking-[0.06em] text-[var(--ll-text-tertiary)]"
              >
                {logo}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
