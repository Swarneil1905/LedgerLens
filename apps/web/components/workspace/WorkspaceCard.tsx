import Link from "next/link";
import type { Workspace } from "@ledgerlens/types/workspace";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/workspace/${workspace.id}`} className="panel" style={{ padding: 18, display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 700 }}>{workspace.company.name}</div>
          <div className="muted mono" style={{ marginTop: 4, fontSize: 13 }}>
            {workspace.company.ticker} · {workspace.company.sector}
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--ll-radius-md)",
            display: "grid",
            placeItems: "center",
            background: "var(--ll-accent-subtle)",
            color: "var(--ll-accent)"
          }}
        >
          {workspace.company.name.slice(0, 1)}
        </div>
      </div>
      <div className="muted" style={{ marginTop: 18, fontSize: 14 }}>
        Latest filing {workspace.summary.latestFilingDate}
      </div>
      <div className="muted" style={{ marginTop: 6, fontSize: 14 }}>
        {workspace.bookmarkCount} saved evidence items
      </div>
    </Link>
  );
}
