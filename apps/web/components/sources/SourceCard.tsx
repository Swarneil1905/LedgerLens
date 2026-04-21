import { ExternalLink } from "lucide-react";
import type { SourceCard as SourceCardType, SourceType } from "@ledgerlens/types/source";
import { SOURCE_ACCENT, SOURCE_BADGE_LABEL } from "@/lib/sourceVisuals";
import { cn } from "@/lib/utils";

function badgeBg(type: SourceType): string {
  return `color-mix(in oklab, ${SOURCE_ACCENT[type]} 12%, var(--ll-bg-base))`;
}

export function SourceCard({ source }: { source: SourceCardType }) {
  const accent = SOURCE_ACCENT[source.sourceType];
  const badge = SOURCE_BADGE_LABEL[source.sourceType];

  return (
    <article
      className={cn(
        "rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] shadow-[var(--ll-shadow-1)] transition-all duration-200",
        "hover:border-[var(--ll-border-strong)] hover:shadow-[var(--ll-shadow-2)]"
      )}
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div className="px-3.5 py-3">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs leading-tight text-[var(--ll-text-tertiary)]">
          <span
            className="inline-block rounded-[var(--ll-radius-xs)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em]"
            style={{
              background: badgeBg(source.sourceType),
              color: accent
            }}
          >
            {badge}
          </span>
          <span>{source.provider}</span>
          <span>{source.date}</span>
        </div>
        <div className="mt-2.5 line-clamp-1 text-sm font-semibold leading-snug text-[var(--ll-text-primary)]">
          {source.title}
        </div>
        <div className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--ll-text-secondary)]">
          {source.snippet}
        </div>
        {source.url ? (
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[var(--ll-accent)] transition-colors hover:text-[var(--ll-accent-hover)]"
          >
            Open source
            <ExternalLink size={12} strokeWidth={2} />
          </a>
        ) : (
          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium italic text-[var(--ll-text-tertiary)]">
            Source link unavailable
          </div>
        )}
      </div>
    </article>
  );
}
