import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { CompanySearch } from "@/components/workspace/CompanySearch";
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

export default async function WorkspaceHomePage() {
  const workspaces = await loadWorkspaces();

  return (
    <>
      <WorkspaceHeaderHydrator title="LedgerLens" subtitle="Workspace home" />
      <div className="page-grid">
        <div>
          <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            HOME
          </p>
          <h1 style={{ margin: "10px 0 0", fontSize: 30, letterSpacing: "-0.02em" }}>
            Start with a company, not a prompt.
          </h1>
        </div>
        <CompanySearch />
        <section className="page-grid" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </section>
      </div>
    </>
  );
}
