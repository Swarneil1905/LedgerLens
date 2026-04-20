"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, TrendingUp } from "lucide-react";

import { GlowButton } from "@/components/effects/GlowButton";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Data sources", href: "#data-sources" },
  { label: "Pricing", href: "#pricing" }
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/90 backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-[var(--ll-radius-md)]",
                "border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)] transition-colors duration-200 group-hover:bg-[var(--ll-accent)]"
              )}
            >
              <TrendingUp
                size={16}
                className="text-[var(--ll-accent)] group-hover:text-[var(--ll-text-inverse)]"
              />
            </div>
            <span className="text-[1.05rem] font-semibold tracking-[-0.02em] text-[var(--ll-text-primary)]">
              LedgerLens
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-[var(--ll-radius-md)] px-4 py-2 text-sm font-medium text-[var(--ll-text-secondary)]",
                  "transition-all duration-150 hover:bg-[var(--ll-bg-elevated)] hover:text-[var(--ll-text-primary)]"
                )}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/work"
              className="text-sm font-medium text-[var(--ll-text-secondary)] transition-colors hover:text-[var(--ll-text-primary)]"
            >
              Sign in
            </Link>
            <GlowButton variant="primary" size="sm" href="/work">
              Start free →
            </GlowButton>
          </div>

          <button
            type="button"
            className="p-2 text-[var(--ll-text-secondary)] hover:text-[var(--ll-text-primary)] md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed inset-x-0 top-16 z-40 flex flex-col gap-1 border-b border-[var(--ll-border-hairline)] p-4 md:hidden",
              "bg-[var(--ll-bg-surface)]/95 backdrop-blur-xl"
            )}
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "rounded-[var(--ll-radius-md)] px-4 py-3 text-sm font-medium text-[var(--ll-text-secondary)]",
                  "transition-all duration-150 hover:bg-[var(--ll-bg-elevated)] hover:text-[var(--ll-text-primary)]"
                )}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-1 border-t border-[var(--ll-border-hairline)] pt-2">
              <GlowButton variant="primary" size="md" className="w-full" href="/work">
                Start free →
              </GlowButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
