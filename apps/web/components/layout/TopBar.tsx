"use client";

import { CalendarRange, Search, SlidersHorizontal } from "lucide-react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";

export function TopBar() {
  const { title, subtitle } = useWorkspaceUi();
  const isTicker = /^[A-Z]{1,6}$/.test(subtitle.trim());

  return (
    <div
      style={{
        height: "var(--ll-topbar-height)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid var(--ll-border-hairline)"
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--ll-font-mono)",
            fontSize: "var(--ll-text-sm)",
            fontWeight: 600,
            color: "var(--ll-text-secondary)",
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "min(420px, 50vw)"
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <span
            style={{
              fontFamily: "var(--ll-font-mono)",
              fontSize: "var(--ll-text-xs)",
              lineHeight: "var(--ll-text-xs-lh)",
              fontWeight: 600,
              color: isTicker ? "var(--ll-accent)" : "var(--ll-text-tertiary)",
              letterSpacing: "0.02em",
              flexShrink: 0
            }}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ToolbarChip icon={Search} label="Sources" />
        <ToolbarChip icon={CalendarRange} label="1Y" />
        <ToolbarChip icon={SlidersHorizontal} label="Signals" />
      </div>
    </div>
  );
}

function ToolbarChip({
  icon: Icon,
  label
}: {
  icon: typeof Search;
  label: string;
}) {
  return (
    <button
      type="button"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: "var(--ll-radius-sm)",
        border: "1px solid var(--ll-border-default)",
        background: "var(--ll-bg-elevated)",
        color: "var(--ll-text-secondary)",
        fontSize: "var(--ll-text-xs)",
        fontWeight: 500,
        letterSpacing: "0.07em",
        textTransform: "uppercase" as const,
        transition: "border-color 100ms ease, color 100ms ease, background 100ms ease",
        cursor: "pointer"
      }}
    >
      <Icon size={14} strokeWidth={1.5} />
      <span>{label}</span>
    </button>
  );
}
