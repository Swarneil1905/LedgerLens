import { mockWorkspace } from "@/lib/mock-data";
import { SourceCard } from "@/components/sources/SourceCard";
import { ChartPanel } from "@/components/charts/ChartPanel";

export function RightDrawer() {
  return (
    <aside
      style={{
        gridColumn: "3 / 4",
        gridRow: "2 / 3",
        padding: 18,
        borderLeft: "1px solid var(--ll-border-subtle)",
        overflowY: "auto"
      }}
    >
      <div className="page-grid">
        <section>
          <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            EVIDENCE
          </p>
          <div className="page-grid">
            {mockWorkspace.sources.slice(0, 3).map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        </section>
        <ChartPanel chart={mockWorkspace.charts[0]} />
      </div>
    </aside>
  );
}
