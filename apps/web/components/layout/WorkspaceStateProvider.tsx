"use client";

import type { CompanyChart } from "@ledgerlens/types/chart";
import type { SourceCard } from "@ledgerlens/types/source";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type BreadcrumbItem = { label: string; href?: string };

type WorkspaceUiState = {
  title: string;
  subtitle: string;
  breadcrumb: BreadcrumbItem[] | null;
  drawerSources: SourceCard[];
  drawerChart: CompanyChart | null;
  setHeader: (title: string, subtitle: string) => void;
  setBreadcrumb: (items: BreadcrumbItem[] | null) => void;
  setDrawer: (sources: SourceCard[], chart: CompanyChart | null) => void;
  resetDrawer: () => void;
};

const WorkspaceUiContext = createContext<WorkspaceUiState | null>(null);

export function WorkspaceStateProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("LedgerLens");
  const [subtitle, setSubtitle] = useState("Analyst workspace");
  const [breadcrumb, setBreadcrumbState] = useState<BreadcrumbItem[] | null>(null);
  const [drawerSources, setDrawerSources] = useState<SourceCard[]>([]);
  const [drawerChart, setDrawerChart] = useState<CompanyChart | null>(null);

  const setHeader = useCallback((nextTitle: string, nextSubtitle: string) => {
    setTitle(nextTitle);
    setSubtitle(nextSubtitle);
  }, []);

  const setBreadcrumb = useCallback((items: BreadcrumbItem[] | null) => {
    setBreadcrumbState(items?.length ? items : null);
  }, []);

  const setDrawer = useCallback((sources: SourceCard[], chart: CompanyChart | null) => {
    setDrawerSources(sources);
    setDrawerChart(chart);
  }, []);

  const resetDrawer = useCallback(() => {
    setDrawerSources([]);
    setDrawerChart(null);
  }, []);

  const value = useMemo(
    () => ({
      title,
      subtitle,
      breadcrumb,
      drawerSources,
      drawerChart,
      setHeader,
      setBreadcrumb,
      setDrawer,
      resetDrawer
    }),
    [title, subtitle, breadcrumb, drawerSources, drawerChart, setHeader, setBreadcrumb, setDrawer, resetDrawer]
  );

  return <WorkspaceUiContext.Provider value={value}>{children}</WorkspaceUiContext.Provider>;
}

export function useWorkspaceUi() {
  const ctx = useContext(WorkspaceUiContext);
  if (!ctx) {
    throw new Error("useWorkspaceUi must be used within WorkspaceStateProvider");
  }
  return ctx;
}
