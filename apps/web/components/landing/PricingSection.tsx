"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

import { BorderBeam } from "@/components/effects/BorderBeam";
import { GlowButton } from "@/components/effects/GlowButton";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "For individual analysts getting started.",
    features: [
      "50 queries per month",
      "5 company workspaces",
      "SEC + FRED sources",
      "7-day chat history",
      "Community support"
    ],
    cta: "Start free",
    highlighted: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For analysts who need unlimited depth.",
    features: [
      "Unlimited queries",
      "Unlimited workspaces",
      "SEC + FRED + 3 news sources",
      "Unlimited chat history",
      "Priority retrieval",
      "Export to PDF/memo",
      "Email support"
    ],
    cta: "Start Pro trial",
    highlighted: true
  },
  {
    name: "Team",
    price: "$199",
    period: "/month",
    description: "For research teams and fund analysts.",
    features: [
      "Everything in Pro",
      "Up to 10 seats",
      "Shared workspaces",
      "Team bookmarks",
      "API access (beta)",
      "Slack integration",
      "Dedicated support"
    ],
    cta: "Contact sales",
    highlighted: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-4xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-5xl"
          >
            Simple pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg text-[var(--ll-text-secondary)]"
          >
            Start free. Upgrade when you need more.
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={[
                "relative flex flex-col rounded-[var(--ll-radius-xl)] p-6",
                plan.highlighted
                  ? "border border-[var(--ll-accent-border)] bg-[var(--ll-bg-elevated)] shadow-[var(--ll-glow-card)]"
                  : "border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)]"
              ].join(" ")}
            >
              {plan.highlighted ? <BorderBeam colorTo="var(--ll-accent)" duration={8} /> : null}

              {plan.highlighted ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--ll-accent)] px-3 py-1 text-xs font-semibold tracking-[0.04em] text-[var(--ll-text-inverse)]">
                    Most popular
                  </span>
                </div>
              ) : null}

              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.07em] text-[var(--ll-text-secondary)]">
                  {plan.name}
                </p>
                <div className="mb-2 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold tracking-[-0.03em] text-[var(--ll-text-primary)]">
                    {plan.price}
                  </span>
                  <span className="text-sm text-[var(--ll-text-tertiary)]">{plan.period}</span>
                </div>
                <p className="text-sm text-[var(--ll-text-secondary)]">{plan.description}</p>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={14}
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: plan.highlighted ? "var(--ll-accent)" : "var(--ll-positive)" }}
                    />
                    <span className="text-sm text-[var(--ll-text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <GlowButton
                variant={plan.highlighted ? "primary" : "secondary"}
                size="md"
                className="w-full justify-center"
                href="/work"
              >
                {plan.cta}
              </GlowButton>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
