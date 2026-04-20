"use client";

import { useEffect } from "react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import type { BreadcrumbItem } from "@/components/layout/WorkspaceStateProvider";

export function WorkspaceHeaderHydrator({
  title,
  subtitle,
  breadcrumb
}: {
  title: string;
  subtitle: string;
  breadcrumb?: BreadcrumbItem[] | null;
}) {
  const { setHeader, setBreadcrumb } = useWorkspaceUi();

  useEffect(() => {
    setHeader(title, subtitle);
    if (breadcrumb === undefined) {
      setBreadcrumb(null);
    } else {
      setBreadcrumb(breadcrumb);
    }
  }, [title, subtitle, breadcrumb, setHeader, setBreadcrumb]);

  return null;
}
