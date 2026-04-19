"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { FileSearch, LineChart } from "lucide-react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { BookmarkEvidenceButton } from "@/components/sources/BookmarkEvidenceButton";
import { SourceCard } from "@/components/sources/SourceCard";

type DrawerTab = "sources" | "charts";

export function RightDrawer() {
  const { drawerSources, drawerChart } = useWorkspaceUi();
  const [tab, setTab] = useState<DrawerTab>("sources");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--ll-border-hairline)",
          background: "var(--ll-bg-surface)"
        }}
      >
        <DrawerTabButton
          active={tab === "sources"}
          icon={FileSearch}
          label="Sources"
          onClick={() => setTab("sources")}
        />
        <DrawerTabButton
          active={tab === "charts"}
          icon={LineChart}
          label="Charts"
          onClick={() => setTab("charts")}
        />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 14px 20px" }}>
        {tab === "sources" ? (
          <SourcesPane sources={drawerSources} />
        ) : (
          <ChartsPane chart={drawerChart} />
        )}
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
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 8px",
        border: "none",
        borderBottom: active ? "2px solid var(--ll-accent)" : "2px solid transparent",
        marginBottom: -1,
        background: "transparent",
        color: active ? "var(--ll-text-primary)" : "var(--ll-text-tertiary)",
        fontSize: "var(--ll-text-xs)",
        fontWeight: active ? 600 : 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase" as const,
        cursor: "pointer",
        fontFamily: "var(--ll-font-ui)",
        transition: "color 100ms ease, border-color 100ms ease"
      }}
    >
      <Icon size={14} strokeWidth={1.5} />
      {label}
    </button>
  );
}

function SourcesPane({ sources }: { sources: ReturnType<typeof useWorkspaceUi>["drawerSources"] }) {
  if (!sources.length) {
    return (
      <div style={{ padding: "8px 4px" }}>
        <EmptyBlock
          icon={FileSearch}
          title="No sources in view"
          body="Run an analysis query. Retrieved evidence will land here with SEC, macro, and news context."
        />
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {sources.map((source, index) => (
        <div
          key={source.id}
          style={{
            animation: "ll-card-in 200ms ease-out forwards",
            animationDelay: `${Math.min(index, 8) * 60}ms`,
            opacity: 0
          }}
        >
          <SourceCard source={source} />
          <BookmarkEvidenceButton sourceId={source.id} />
        </div>
      ))}
    </div>
  );
}

function ChartsPane({ chart }: { chart: ReturnType<typeof useWorkspaceUi>["drawerChart"] }) {
  if (!chart) {
    return (
      <EmptyBlock
        icon={LineChart}
        title="No chart context"
        body="When the model returns chart-ready series, they will appear in this tab."
      />
    );
  }
  return <ChartPanel chart={chart} />;
}

function EmptyBlock({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--ll-border-default)",
        borderRadius: "var(--ll-radius-md)",
        padding: "20px 16px",
        textAlign: "center" as const
      }}
    >
      <Icon
        size={24}
        strokeWidth={1.5}
        style={{
          display: "block",
          margin: "0 auto 12px",
          color: "var(--ll-text-tertiary)"
        }}
      />
      <div style={{ fontSize: "var(--ll-text-base)", fontWeight: 600, color: "var(--ll-text-secondary)" }}>{title}</div>
      <div
        style={{
          marginTop: 8,
          fontSize: "var(--ll-text-sm)",
          lineHeight: "var(--ll-text-sm-lh)",
          color: "var(--ll-text-tertiary)",
          maxWidth: 260,
          marginLeft: "auto",
          marginRight: "auto"
        }}
      >
        {body}
      </div>
    </div>
  );
}
