import type { ReactNode } from "react";
import { RightDrawer } from "@/components/layout/RightDrawer";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

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
        height: "100vh",
        overflow: "hidden"
      }}
    >
      <Sidebar workspaceHref={workspaceHref ?? "/workspace/apple"} />
      <TopBar />
      <main style={{ gridColumn: "2 / 3", gridRow: "2 / 3", overflowY: "auto", padding: 24 }}>
        {children}
      </main>
      <RightDrawer />
    </div>
  );
}
