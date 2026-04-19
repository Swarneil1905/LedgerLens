"use client";

import { CalendarRange, Search, SlidersHorizontal } from "lucide-react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";

export function TopBar() {
  const { title, subtitle } = useWorkspaceUi();

  return (
    <header
      style={{
        gridColumn: "2 / 4",
        gridRow: "1 / 2",
        height: "var(--ll-topbar-height)",
        borderBottom: "1px solid var(--ll-border-subtle)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 20px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div className="muted mono" style={{ fontSize: 12 }}>
          {subtitle}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ToolbarChip icon={Search} label="Source filters" />
        <ToolbarChip icon={CalendarRange} label="1Y range" />
        <ToolbarChip icon={SlidersHorizontal} label="Signals" />
      </div>
    </header>
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
        gap: 8,
        padding: "8px 10px",
        borderRadius: "var(--ll-radius-sm)",
        border: "1px solid var(--ll-border-default)",
        background: "var(--ll-bg-elevated)",
        color: "var(--ll-text-secondary)"
      }}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}
