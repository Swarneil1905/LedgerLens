import type { CSSProperties, ReactNode } from "react";
import { RightDrawer } from "@/components/layout/RightDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const panelBg: CSSProperties = { background: "var(--ll-bg-surface)", minWidth: 0 };

export function WorkspaceShell({
  children,
  workspaceHref
}: {
  children: ReactNode;
  workspaceHref?: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "var(--ll-sidebar-width) 1fr var(--ll-drawer-width)",
        gridTemplateRows: "var(--ll-topbar-height) 1fr",
        height: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        gap: "var(--ll-panel-gap)",
        backgroundColor: "var(--ll-border-hairline)"
      }}
    >
      <header style={{ gridColumn: "1 / -1", gridRow: "1 / 2", ...panelBg, margin: 0 }}>
        <TopBar />
      </header>
      <aside style={{ gridColumn: "1 / 2", gridRow: "2 / 3", ...panelBg, overflow: "hidden" }}>
        <Sidebar workspaceHref={workspaceHref ?? "/workspace/apple"} />
      </aside>
      <main
        style={{
          gridColumn: "2 / 3",
          gridRow: "2 / 3",
          ...panelBg,
          overflowY: "auto",
          overflowX: "hidden",
          padding: "20px 24px 24px",
          scrollBehavior: "smooth"
        }}
      >
        {children}
      </main>
      <aside style={{ gridColumn: "3 / 4", gridRow: "2 / 3", ...panelBg, overflow: "hidden" }}>
        <RightDrawer />
      </aside>
    </div>
  );
}
