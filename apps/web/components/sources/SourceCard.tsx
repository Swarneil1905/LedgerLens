import { ExternalLink } from "lucide-react";
import type { SourceCard as SourceCardType, SourceType } from "@ledgerlens/types/source";
import { SOURCE_ACCENT, SOURCE_BADGE_LABEL } from "@/lib/sourceVisuals";

function badgeBg(type: SourceType): string {
  return `color-mix(in oklab, ${SOURCE_ACCENT[type]} 12%, var(--ll-bg-base))`;
}

export function SourceCard({ source }: { source: SourceCardType }) {
  const accent = SOURCE_ACCENT[source.sourceType];
  const badge = SOURCE_BADGE_LABEL[source.sourceType];

  return (
    <article
      style={{
        background: "var(--ll-bg-elevated)",
        border: "1px solid var(--ll-border-default)",
        borderLeft: `3px solid ${accent}`,
        borderRadius: "var(--ll-radius-sm)",
        padding: "12px 14px",
        boxShadow: "var(--ll-shadow-1)",
        transition: "border-color 150ms ease, box-shadow 150ms ease"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px 10px",
          fontFamily: "var(--ll-font-mono)",
          fontSize: "var(--ll-text-2xs)",
          lineHeight: "var(--ll-text-2xs-lh)",
          color: "var(--ll-text-tertiary)"
        }}
      >
        <span
          style={{
            display: "inline-block",
            padding: "2px 6px",
            borderRadius: "var(--ll-radius-xs)",
            background: badgeBg(source.sourceType),
            color: accent,
            fontFamily: "var(--ll-font-ui)",
            fontSize: "var(--ll-text-2xs)",
            fontWeight: 600,
            letterSpacing: "0.07em",
            textTransform: "uppercase" as const
          }}
        >
          {badge}
        </span>
        <span>{source.provider}</span>
        <span>{source.date}</span>
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: "var(--ll-text-sm)",
          lineHeight: 1.35,
          fontWeight: 600,
          color: "var(--ll-text-primary)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical"
        }}
      >
        {source.title}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: "var(--ll-text-xs)",
          lineHeight: "var(--ll-text-xs-lh)",
          fontWeight: 400,
          color: "var(--ll-text-secondary)",
          fontFamily: "var(--ll-font-ui)",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical"
        }}
      >
        {source.snippet}
      </div>
      {source.url ? (
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "var(--ll-text-xs)",
            fontWeight: 600,
            color: "var(--ll-accent)",
            letterSpacing: "0.02em"
          }}
        >
          Open source
          <ExternalLink size={12} strokeWidth={1.5} />
        </a>
      ) : (
        <div
          style={{
            marginTop: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "var(--ll-text-xs)",
            fontWeight: 600,
            color: "var(--ll-text-tertiary)"
          }}
        >
          Source link unavailable
        </div>
      )}
    </article>
  );
}
