import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { mockWorkspaces } from "@/lib/mock-data";

export default function SavedPage() {
  return (
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
        {mockWorkspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </section>
    </div>
  );
}
