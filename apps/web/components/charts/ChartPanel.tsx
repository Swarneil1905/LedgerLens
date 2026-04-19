import type { CompanyChart } from "@ledgerlens/types/chart";

export function ChartPanel({ chart }: { chart: CompanyChart }) {
  return (
    <section className="panel" style={{ padding: 18 }}>
      <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
        CHART CONTEXT
      </p>
      <h3 className="section-title" style={{ marginTop: 8 }}>
        {chart.title}
      </h3>
      <p className="muted" style={{ marginTop: 6 }}>
        {chart.subtitle}
      </p>
      <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
        {chart.series[0]?.points.map((point) => (
          <div key={point.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr 64px", gap: 10 }}>
            <span className="muted mono" style={{ fontSize: 12 }}>
              {point.label}
            </span>
            <div style={{ height: 8, alignSelf: "center", borderRadius: 999, background: "var(--ll-bg-overlay)" }}>
              <div
                style={{
                  width: `${Math.min(point.value, 100)}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: "var(--ll-accent)"
                }}
              />
            </div>
            <span className="mono" style={{ fontSize: 12, textAlign: "right" }}>
              {point.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
