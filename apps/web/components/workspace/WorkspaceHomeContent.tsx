"use client";

import { motion } from "motion/react";

import { CompanySearch } from "@/components/workspace/CompanySearch";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { cn } from "@/lib/utils";
import type { Workspace } from "@ledgerlens/types/workspace";

export function WorkspaceHomeContent({ workspaces }: { workspaces: Workspace[] }) {
  return (
    <div className="flex min-h-full flex-col pb-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="px-8 pb-8 pt-10"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--ll-text-tertiary)]">Home</p>
        <h1 className="text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--ll-text-primary)]">
          Start with a company,
          <br />
          <span className="text-[var(--ll-accent)]">not a prompt.</span>
        </h1>
      </motion.div>

      <CompanySearch />

      <div className="mx-8 mb-6 h-px bg-[var(--ll-border-hairline)]" />

      <div className="flex-1 px-8">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ll-text-tertiary)]">
          Workspaces
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {workspaces.map((ws, i) => (
            <WorkspaceCard key={ws.id} workspace={ws} index={i} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12 + workspaces.length * 0.08 }}
          >
            <a
              href="#company-search"
              className={cn(
                "group flex min-h-[140px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--ll-radius-lg)] border border-dashed border-[var(--ll-border-default)] bg-transparent p-5 text-center transition-all duration-200",
                "hover:border-[var(--ll-accent-border)] hover:bg-[var(--ll-accent-dim)]"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-[var(--ll-radius-md)] border border-dashed border-[var(--ll-border-strong)] transition-colors duration-200",
                  "group-hover:border-[var(--ll-accent-border)]"
                )}
              >
                <span className="text-lg leading-none text-[var(--ll-text-tertiary)] transition-colors group-hover:text-[var(--ll-accent)]">
                  +
                </span>
              </div>
              <p className="text-xs font-medium text-[var(--ll-text-tertiary)] transition-colors group-hover:text-[var(--ll-accent)]">
                New workspace
              </p>
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
