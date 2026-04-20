import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { WorkspaceHomeContent } from "@/components/workspace/WorkspaceHomeContent";
import { apiGetJson } from "@/lib/api-client";
import { mapWorkspace } from "@/lib/mappers";
import { mockWorkspaces } from "@/lib/mock-data";
import type { Workspace } from "@ledgerlens/types/workspace";

async function loadWorkspaces(): Promise<Workspace[]> {
  try {
    const rows = await apiGetJson<unknown[]>("/workspace");
    return rows.map((row) => mapWorkspace(row as Record<string, unknown>));
  } catch {
    return mockWorkspaces;
  }
}

export default async function WorkspaceHomePage() {
  const workspaces = await loadWorkspaces();

  return (
    <>
      <WorkspaceHeaderHydrator
        title="LedgerLens"
        subtitle="Workspace home"
        breadcrumb={[{ label: "LedgerLens" }, { label: "Workspace home" }]}
      />
      <WorkspaceHomeContent workspaces={workspaces} />
    </>
  );
}
