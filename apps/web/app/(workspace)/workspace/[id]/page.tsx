import { mockWorkspace } from "@/lib/mock-data";

export default function CompanyWorkspacePage() {
  return (
    <div className="page-grid">
      <section className="panel" style={{ padding: 24 }}>
        <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
          COMPANY
        </p>
        <h1 style={{ margin: "10px 0 6px", fontSize: 30, letterSpacing: "-0.02em" }}>
          {mockWorkspace.company.name}
        </h1>
        <p className="muted mono">
          {mockWorkspace.company.ticker} · {mockWorkspace.company.sector} · {mockWorkspace.company.marketCap}
        </p>
      </section>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16 }}>
        <MetricPanel label="Latest filing" value={mockWorkspace.summary.latestFilingDate} />
        <MetricPanel label="Last news event" value={mockWorkspace.summary.lastNewsEvent} />
        <MetricPanel label="Macro context" value={mockWorkspace.summary.macroContext} />
      </section>
    </div>
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
