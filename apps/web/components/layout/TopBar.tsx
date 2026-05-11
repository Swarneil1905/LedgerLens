"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { BarChart2, Bell, ChevronRight, Search } from "lucide-react";

import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { title, subtitle, breadcrumb } = useWorkspaceUi();
  const isTicker = subtitle.trim().length > 0 && /^[A-Z]{1,6}$/.test(subtitle.trim());

  const crumbs = breadcrumb && breadcrumb.length > 0 ? breadcrumb : null;

  return (
    <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6">
      {crumbs ? (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-w-0 flex-1 items-center gap-1.5"
        >
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="flex min-w-0 items-center gap-1.5">
              {i > 0 ? <ChevronRight size={12} className="flex-shrink-0 text-[var(--ll-text-tertiary)]" /> : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className={cn(
                    "truncate rounded-[var(--ll-radius-sm)] text-sm tracking-[-0.01em] outline-none",
                    i === crumbs.length - 1
                      ? "font-semibold text-[var(--ll-text-primary)]"
                      : "font-medium text-[var(--ll-text-tertiary)] hover:text-[var(--ll-text-secondary)]",
                    "focus-visible:ring-2 focus-visible:ring-[var(--ll-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ll-bg-base)]"
                  )}
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    "truncate text-sm tracking-[-0.01em]",
                    i === crumbs.length - 1
                      ? "font-semibold text-[var(--ll-text-primary)]"
                      : "font-medium text-[var(--ll-text-tertiary)]"
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-w-0 flex-1 items-baseline gap-3.5"
        >
          <div
            className="max-w-[min(420px,50vw)] truncate text-sm font-semibold tracking-[-0.01em] text-[var(--ll-text-secondary)]"
          >
            {title}
          </div>
          {subtitle ? (
            <span
              className={cn(
                "flex-shrink-0 text-xs font-semibold tracking-wide tabular-nums",
                isTicker ? "text-[var(--ll-accent)]" : "text-[var(--ll-text-tertiary)]"
              )}
            >
              {subtitle}
            </span>
          ) : null}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-shrink-0 items-center gap-2"
      >
        <TopBarButton icon={Search} label="Sources" />
        <TopBarButton icon={BarChart2} label="1Y" />
        <TopBarButton icon={Bell} label="Signals" />
      </motion.div>
    </div>
  );
}

function TopBarButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      className={cn(
        "flex h-9 cursor-pointer items-center gap-1.5 rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)]",
        "bg-[var(--ll-bg-elevated)] px-2.5 text-xs font-medium text-[var(--ll-text-secondary)] sm:h-8 sm:rounded-[var(--ll-radius-md)] sm:px-3",
        "outline-none transition-[border-color,background-color,color,box-shadow] duration-200 hover:border-[var(--ll-accent-border)] hover:bg-[var(--ll-bg-overlay)] hover:text-[var(--ll-text-primary)] hover:shadow-[0_0_20px_oklch(0.72_0.17_200/0.08)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--ll-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ll-bg-base)]"
      )}
    >
      <Icon size={14} strokeWidth={1.75} />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );
}
