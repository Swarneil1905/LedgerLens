import { CompanySearch } from "@/components/workspace/CompanySearch";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { mockWorkspaces } from "@/lib/mock-data";

export default function WorkspaceHomePage() {
  return (
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
        {mockWorkspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </section>
    </div>
  );
}
