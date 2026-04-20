import Link from "next/link";
import { randomUUID } from "crypto";
import type { Workspace } from "@ledgerlens/types/workspace";
import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { apiGetJson } from "@/lib/api-client";
import { mapWorkspace } from "@/lib/mappers";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CompanyWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  let workspace: Workspace;
  try {
    const row = await apiGetJson<unknown>(`/workspace/${id}`);
    workspace = mapWorkspace(row as Record<string, unknown>);
  } catch {
    notFound();
  }

  const sessionId = randomUUID();
  const chatHref = `/chat/${sessionId}?ticker=${encodeURIComponent(workspace.company.ticker)}`;

  return (
    <>
      <WorkspaceHeaderHydrator
        title={`${workspace.company.name} / Workspace`}
        subtitle={workspace.company.ticker}
        breadcrumb={[
          { label: "Workspace", href: "/work" },
          { label: workspace.company.ticker }
        ]}
      />
      <div className="page-grid">
        <section className="panel" style={{ padding: 24 }}>
          <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            COMPANY
          </p>
          <h1 style={{ margin: "10px 0 6px", fontSize: 30, letterSpacing: "-0.02em" }}>
            {workspace.company.name}
          </h1>
          <p className="muted mono">
            {workspace.company.ticker} · {workspace.company.sector} · {workspace.company.marketCap}
          </p>
          <div style={{ marginTop: 18 }}>
            <Link
              href={chatHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: "var(--ll-radius-md)",
                background: "var(--ll-accent)",
                color: "var(--ll-text-inverse)",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              Start analysis
            </Link>
          </div>
        </section>
        <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
          <MetricPanel label="Latest filing" value={workspace.summary.latestFilingDate} />
          <MetricPanel label="Last news event" value={workspace.summary.lastNewsEvent} />
          <MetricPanel label="Macro context" value={workspace.summary.macroContext} />
        </section>
        <section className="panel" style={{ padding: 20 }}>
          <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            RECENT ACTIVITY
          </p>
          <ul style={{ margin: "12px 0 0", paddingLeft: 18, color: "var(--ll-text-secondary)" }}>
            {workspace.recentActivity.map((item) => (
              <li key={item} style={{ marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

function MetricPanel({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel" style={{ padding: 18 }}>
      <div className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ marginTop: 10, lineHeight: 1.6 }}>{value}</div>
    </div>
  );
}
