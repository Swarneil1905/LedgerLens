"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, FileText, LineChart } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { BookmarkEvidenceButton } from "@/components/sources/BookmarkEvidenceButton";
import { SourceCard } from "@/components/sources/SourceCard";
import { cn } from "@/lib/utils";

type DrawerTab = "sources" | "charts";

export function RightDrawer() {
  const { drawerSources, drawerChart } = useWorkspaceUi();
  const [tab, setTab] = useState<DrawerTab>("sources");

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/80">
        <div className="flex">
          <DrawerTabButton
            active={tab === "sources"}
            icon={FileText}
            label="Sources"
            onClick={() => setTab("sources")}
          />
          <DrawerTabButton
            active={tab === "charts"}
            icon={BarChart3}
            label="Charts"
            onClick={() => setTab("charts")}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {tab === "sources" ? (
              <SourcesPane sources={drawerSources} />
            ) : (
              <ChartsPane chart={drawerChart} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function DrawerTabButton({
  active,
  label,
  icon: Icon,
  onClick
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 px-4 text-sm font-medium transition-colors duration-150",
        active ? "text-[var(--ll-text-primary)]" : "text-[var(--ll-text-tertiary)] hover:text-[var(--ll-text-secondary)]"
      )}
    >
      <Icon size={12} strokeWidth={1.5} />
      {label}
      {active ? (
        <motion.div
          layoutId="drawer-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--ll-accent)]"
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      ) : null}
    </button>
  );
}

function SourcesPane({ sources }: { sources: ReturnType<typeof useWorkspaceUi>["drawerSources"] }) {
  if (!sources.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)]">
          <div className="absolute inset-0 rounded-[var(--ll-radius-lg)] bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.06),transparent)]" />
          <FileText size={22} className="relative text-[var(--ll-text-tertiary)]" strokeWidth={1.5} />
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold text-[var(--ll-text-secondary)]">No sources in view</p>
          <p className="mx-auto max-w-[190px] text-xs leading-relaxed text-[var(--ll-text-tertiary)]">
            Run an analysis query. Retrieved evidence will land here with SEC, macro, and news context.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {sources.map((source, index) => (
        <motion.div
          key={source.id}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.35,
            delay: Math.min(index, 8) * 0.06,
            ease: [0.33, 1, 0.68, 1]
          }}
        >
          <SourceCard source={source} />
          <BookmarkEvidenceButton sourceId={source.id} />
        </motion.div>
      ))}
    </div>
  );
}

function ChartsPane({ chart }: { chart: ReturnType<typeof useWorkspaceUi>["drawerChart"] }) {
  if (!chart) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <LineChart size={28} className="text-[var(--ll-text-tertiary)]" strokeWidth={1.5} />
        <p className="text-sm font-semibold text-[var(--ll-text-secondary)]">No chart context</p>
        <p className="max-w-[200px] text-xs leading-relaxed text-[var(--ll-text-tertiary)]">
          When the model returns chart-ready series, they will appear in this tab.
        </p>
      </div>
    );
  }
  return <ChartPanel chart={chart} />;
}
