"use client";

import { motion } from "motion/react";
import { ArrowRight, FileText, Newspaper, TrendingUp } from "lucide-react";

import { MeshGradient } from "@/components/effects/MeshGradient";
import { GridPattern } from "@/components/effects/GridPattern";
import { GlowButton } from "@/components/effects/GlowButton";
import { BorderBeam } from "@/components/effects/BorderBeam";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-16">
      <MeshGradient className="opacity-100" />
      <GridPattern dotColor="rgba(255,255,255,0.06)" gap={32} fade="edges" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(45,212,191,0.06),transparent)]" />
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[var(--ll-bg-base)] to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 inline-flex items-center gap-2"
        >
          <span
            className={cn(
              "rounded-full border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)] px-3 py-1",
              "text-xs font-medium tracking-[0.04em] text-[var(--ll-accent)]"
            )}
          >
            Now in beta. SEC · FRED · News
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="mb-6 text-5xl font-bold leading-[1.05] tracking-[-0.03em] text-[var(--ll-text-primary)] md:text-7xl"
        >
          Ask anything about
          <br />
          <span className="text-[var(--ll-accent)]">any company.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[var(--ll-text-secondary)] md:text-xl"
        >
          Grounded answers from SEC filings, FRED macro data, and live news, all in one workspace. Every claim is
          cited. Nothing is fabricated.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <GlowButton variant="primary" size="lg" href="/work">
            Start for free
            <ArrowRight size={16} />
          </GlowButton>
          <GlowButton variant="secondary" size="lg" href="#demo">
            Watch demo
          </GlowButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 text-xs text-[var(--ll-text-tertiary)]"
        >
          No credit card required · Free tier includes 50 queries/month
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className={cn(
            "relative mx-auto mt-16 max-w-3xl overflow-hidden rounded-[var(--ll-radius-xl)]",
            "border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] shadow-[var(--ll-shadow-3)]"
          )}
        >
          <BorderBeam colorTo="var(--ll-accent)" duration={10} />

          <div
            className={cn(
              "flex items-center gap-2 border-b border-[var(--ll-border-hairline)] bg-[var(--ll-bg-elevated)] px-4 py-3"
            )}
          >
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-[var(--ll-text-tertiary)]">ledgerlens / AAPL workspace</span>
          </div>

          <div className="space-y-4 p-6 text-left">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)]">
                <span className="text-[10px] font-bold text-[var(--ll-accent)]">U</span>
              </div>
              <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">
                What changed in Apple&apos;s latest 10-K? Focus on revenue mix and new risk factors.
              </p>
            </div>

            <div className="h-px bg-[var(--ll-border-hairline)]" />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[var(--ll-radius-sm)] bg-[var(--ll-accent)]">
                  <TrendingUp size={12} className="text-[var(--ll-text-inverse)]" />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm leading-relaxed text-[var(--ll-text-primary)]">
                    Apple&apos;s FY2024 10-K shows revenue of{" "}
                    <span className="font-mono text-[var(--ll-accent)]">$391.0B</span>, a{" "}
                    <span className="text-[var(--ll-positive)]">+2.1%</span> increase YoY. Services revenue grew{" "}
                    <span className="text-[var(--ll-positive)]">+13%</span> to{" "}
                    <span className="font-mono text-[var(--ll-accent)]"> $96.2B</span>, now representing 24.6% of total
                    revenue
                    <sup className="ml-0.5 cursor-pointer font-mono text-[10px] text-[var(--ll-accent)]">[1]</sup>.
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--ll-text-primary)]">
                    New risk factors include EU Digital Markets Act compliance costs and DOJ antitrust scrutiny of App
                    Store practices
                    <sup className="ml-0.5 font-mono text-[10px] text-[var(--ll-accent)]">[2]</sup>.
                  </p>
                </div>
              </div>

              <div className="ml-9 flex flex-wrap gap-2">
                {[
                  { icon: FileText, label: "AAPL 10-K 2024", type: "sec" as const },
                  { icon: Newspaper, label: "Reuters · Apr 12", type: "news" as const }
                ].map((source) => (
                  <div
                    key={source.label}
                    className={cn(
                      "flex items-center gap-1.5 rounded-[var(--ll-radius-sm)] border border-[var(--ll-border-default)]",
                      "bg-[var(--ll-bg-overlay)] px-2.5 py-1"
                    )}
                  >
                    <source.icon
                      size={11}
                      style={{
                        color: source.type === "sec" ? "var(--ll-source-sec)" : "var(--ll-source-news)"
                      }}
                    />
                    <span className="text-[11px] font-medium text-[var(--ll-text-secondary)]">{source.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
