"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

import { SpotlightCard } from "@/components/effects/SpotlightCard";
import { cn } from "@/lib/utils";
import type { Workspace } from "@ledgerlens/types/workspace";

const AVATAR_COLORS = [
  "var(--ll-accent)",
  "var(--ll-source-sec)",
  "var(--ll-source-fred)",
  "var(--ll-source-news)"
] as const;

export function WorkspaceCard({ workspace, index = 0 }: { workspace: Workspace; index?: number }) {
  const initial = workspace.company.name.slice(0, 1);
  const color = AVATAR_COLORS[workspace.company.name.charCodeAt(0) % AVATAR_COLORS.length];
  const spotlight = `color-mix(in oklch, ${color} 10%, transparent)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.12 + index * 0.08 }}
    >
      <SpotlightCard spotlightColor={spotlight} className="cursor-pointer p-0 transition-shadow duration-200">
        <Link href={`/workspace/${workspace.id}`} className="group block p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-base font-bold tracking-[-0.02em] text-[var(--ll-text-primary)]">
                {workspace.company.name}
              </p>
              <p className="mt-1 font-mono text-xs text-[var(--ll-text-tertiary)]">
                {workspace.company.ticker} · {workspace.company.sector}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--ll-radius-md)] text-sm font-bold transition-transform duration-200 group-hover:scale-105"
              )}
              style={{
                background: `color-mix(in oklch, ${color} 12%, transparent)`,
                border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
                color
              }}
            >
              {initial}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--ll-border-hairline)] pt-3">
            <div>
              <p className="mb-0.5 text-[11px] text-[var(--ll-text-tertiary)]">Latest filing</p>
              <p className="font-mono text-xs font-medium text-[var(--ll-text-secondary)]">
                {workspace.summary.latestFilingDate}
              </p>
            </div>
            <div className="text-right">
              <p className="mb-0.5 text-[11px] text-[var(--ll-text-tertiary)]">Saved evidence</p>
              <p className="font-mono text-xs font-medium text-[var(--ll-text-secondary)]">
                {workspace.bookmarkCount} items
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[var(--ll-text-tertiary)] transition-colors duration-150 hover:text-[var(--ll-accent)]">
            <ArrowRight size={12} />
            Open workspace
          </div>
        </Link>
      </SpotlightCard>
    </motion.div>
  );
}
