"use client";

import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { ChartPanel } from "@/components/charts/ChartPanel";
import { BookmarkEvidenceButton } from "@/components/sources/BookmarkEvidenceButton";
import { SourceCard } from "@/components/sources/SourceCard";

export function RightDrawer() {
  const { drawerSources, drawerChart } = useWorkspaceUi();
  const sources = drawerSources;

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
          {sources.length === 0 ? (
            <div className="panel muted" style={{ padding: 16, marginTop: 12, fontSize: 14 }}>
              Sources from the latest answer will appear here. Run a query in chat to populate this panel.
            </div>
          ) : (
            <div className="page-grid" style={{ marginTop: 12 }}>
              {sources.map((source) => (
                <div key={source.id}>
                  <SourceCard source={source} />
                  <BookmarkEvidenceButton sourceId={source.id} />
                </div>
              ))}
            </div>
          )}
        </section>
        {drawerChart ? <ChartPanel chart={drawerChart} /> : null}
      </div>
    </aside>
  );
}
