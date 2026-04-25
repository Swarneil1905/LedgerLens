import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { WorkspaceStateProvider } from "@/components/layout/WorkspaceStateProvider";
import { apiGetJson } from "@/lib/api-client";
import { mapWorkspace } from "@/lib/mappers";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  let workspaceHref = "/work";
  try {
    const rows = await apiGetJson<unknown[]>("/workspace");
    const first = rows[0];
    if (first && typeof first === "object") {
      const mapped = mapWorkspace(first as Record<string, unknown>);
      workspaceHref = `/workspace/${mapped.id}`;
    }
  } catch {
    workspaceHref = "/work";
  }

  return (
    <WorkspaceStateProvider>
      <WorkspaceShell workspaceHref={workspaceHref}>{children}</WorkspaceShell>
    </WorkspaceStateProvider>
  );
}
