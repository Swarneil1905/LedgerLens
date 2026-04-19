import { FileText, Globe, LineChart, TrendingUp } from "lucide-react";
import type { SourceCard as SourceCardType, SourceType } from "@ledgerlens/types/source";

const accents: Record<SourceType, string> = {
  filing: "var(--ll-source-filing)",
  macro: "var(--ll-source-macro)",
  news: "var(--ll-source-news)",
  chart: "var(--ll-source-chart)"
};

const icons = {
  filing: FileText,
  macro: TrendingUp,
  news: Globe,
  chart: LineChart
};

export function SourceCard({ source }: { source: SourceCardType }) {
  const Icon = icons[source.sourceType];

  return (
    <article
      style={{
        borderLeft: `2px solid ${accents[source.sourceType]}`,
        borderRadius: "var(--ll-radius-md)",
        border: "1px solid var(--ll-border-default)",
        padding: 14,
        background: "var(--ll-bg-elevated)",
        boxShadow: "var(--ll-shadow-1)"
      }}
    >
      <div className="muted mono" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 11 }}>
        <Icon size={14} />
        <span>{source.provider}</span>
        <span>{source.date}</span>
      </div>
      <div style={{ marginTop: 10, fontWeight: 600, lineHeight: 1.4 }}>{source.title}</div>
      <div className="muted" style={{ marginTop: 8, fontSize: 14, lineHeight: 1.5 }}>
        {source.snippet}
      </div>
    </article>
  );
}
