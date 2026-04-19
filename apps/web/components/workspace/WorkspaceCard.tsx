import Link from "next/link";
import type { Workspace } from "@ledgerlens/types/workspace";

export function WorkspaceCard({ workspace }: { workspace: Workspace }) {
  return (
    <Link href={`/workspace/${workspace.id}`} className="panel" style={{ padding: "16px 18px", display: "block" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "var(--ll-text-lg)",
              lineHeight: "var(--ll-text-lg-lh)",
              letterSpacing: "-0.025em",
              color: "var(--ll-text-primary)"
            }}
          >
            {workspace.company.name}
          </div>
          <div
            className="mono muted"
            style={{
              marginTop: 6,
              fontSize: "var(--ll-text-xs)",
              lineHeight: "var(--ll-text-xs-lh)",
              letterSpacing: "0.02em"
            }}
          >
            {workspace.company.ticker} · {workspace.company.sector}
          </div>
        </div>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--ll-radius-sm)",
            display: "grid",
            placeItems: "center",
            background: "var(--ll-accent-dim)",
            color: "var(--ll-accent)",
            fontWeight: 700,
            fontSize: "var(--ll-text-sm)",
            flexShrink: 0
          }}
        >
          {workspace.company.name.slice(0, 1)}
        </div>
      </div>
      <div className="muted" style={{ marginTop: 16, fontSize: "var(--ll-text-sm)" }}>
        Latest filing {workspace.summary.latestFilingDate}
      </div>
      <div className="muted mono" style={{ marginTop: 6, fontSize: "var(--ll-text-xs)" }}>
        {workspace.bookmarkCount} saved evidence items
      </div>
    </Link>
  );
}
