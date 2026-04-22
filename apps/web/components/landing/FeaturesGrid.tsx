"use client";

import { motion } from "motion/react";

import { SpotlightCard } from "@/components/effects/SpotlightCard";
import type { LandingFeature } from "@/lib/landing-features";

export function FeaturesGrid({ features }: { features: LandingFeature[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature, i) => (
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
  );
}
