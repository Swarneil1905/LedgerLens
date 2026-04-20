"use client";

import type { ReactNode } from "react";

import { GridPattern } from "@/components/effects/GridPattern";
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
    <div className="relative flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden bg-[var(--ll-bg-base)]">
      <GridPattern
        dotColor="rgba(255,255,255,0.03)"
        gap={32}
        fade="none"
        className="pointer-events-none fixed inset-0 z-0"
      />

      <div
        className="pointer-events-none fixed left-0 top-0 z-0 h-[400px] w-[600px]"
        style={{
          background:
            "radial-gradient(ellipse at top left, rgba(45,212,191,0.04) 0%, transparent 70%)"
        }}
        aria-hidden
      />

      <div className="relative z-20 h-[var(--ll-topbar-height)] flex-shrink-0 border-b border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/95 backdrop-blur-xl">
        <TopBar />
      </div>

      <div className="relative z-10 flex flex-1 overflow-hidden">
        <aside className="flex h-full w-[var(--ll-sidebar-width)] flex-shrink-0 flex-col overflow-y-auto border-r border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/95">
          <Sidebar workspaceHref={workspaceHref ?? "/workspace/apple"} />
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--ll-bg-base)]">{children}</main>

        <aside className="flex h-full w-[var(--ll-drawer-width)] flex-shrink-0 flex-col overflow-y-auto border-l border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/95">
          <RightDrawer />
        </aside>
      </div>
    </div>
  );
}
