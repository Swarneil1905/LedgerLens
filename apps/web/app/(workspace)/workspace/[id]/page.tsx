import Link from "next/link";
import { randomUUID } from "crypto";
import type { Workspace } from "@ledgerlens/types/workspace";
import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { ApiError, apiGetJson, getApiBaseUrl } from "@/lib/api-client";
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
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }

    const apiBaseUrl = getApiBaseUrl();
    const statusLine =
      err instanceof ApiError && err.status !== undefined ? `API returned ${err.status}` : "API request failed";
    return (
      <>
        <WorkspaceHeaderHydrator
          title="Workspace unavailable"
          subtitle={id}
          breadcrumb={[
            { label: "Workspace", href: "/work" },
            { label: id }
          ]}
        />
        <div className="page-grid">
          <section className="panel" style={{ padding: 24 }}>
            <h1 style={{ margin: "6px 0 10px", fontSize: 22, letterSpacing: "-0.02em" }}>
              Could not load this workspace
            </h1>
            <p className="muted" style={{ lineHeight: 1.7 }}>
              {statusLine}. This usually means the API is down, crashing on that endpoint, or misconfigured.
            </p>
            <div style={{ marginTop: 14 }} className="muted mono">
              <div>API base URL: {apiBaseUrl}</div>
              <div>Request: GET /workspace/{id}</div>
              <div style={{ marginTop: 10 }}>Error: {err instanceof Error ? err.message : String(err)}</div>
            </div>
            <p className="muted" style={{ marginTop: 14, lineHeight: 1.7 }}>
              If this is a 500, check the API logs for the stack trace. If this is a network error, set{" "}
              <span className="mono">NEXT_PUBLIC_API_BASE_URL</span> to your deployed API URL.
            </p>
          </section>
        </div>
      </>
    );
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
