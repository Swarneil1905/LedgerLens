"use client";

import { useEffect } from "react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";

export function WorkspaceHeaderHydrator({ title, subtitle }: { title: string; subtitle: string }) {
  const { setHeader } = useWorkspaceUi();

  useEffect(() => {
    setHeader(title, subtitle);
  }, [title, subtitle, setHeader]);

  return null;
}
