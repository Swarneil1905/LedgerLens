import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
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

export default async function SavedPage() {
  const workspaces = await loadWorkspaces();

  return (
    <>
      <WorkspaceHeaderHydrator title="Saved workspaces" subtitle="Pinned companies" />
      <div className="page-grid">
        <div>
          <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            SAVED
          </p>
          <h1 className="section-title" style={{ marginTop: 8 }}>
            Saved workspaces
          </h1>
        </div>
        <section className="page-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </section>
      </div>
    </>
  );
}
