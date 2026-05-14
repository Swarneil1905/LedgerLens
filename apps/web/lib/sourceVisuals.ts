import type { SourceType } from "@ledgerlens/types/source";

export const SOURCE_ACCENT: Record<SourceType, string> = {
  filing: "var(--ll-source-sec)",
  macro: "var(--ll-source-fred)",
  news: "var(--ll-source-news)",
  chart: "var(--ll-source-chart)",
  web: "var(--ll-source-web)"
};

export const SOURCE_BADGE_LABEL: Record<SourceType, string> = {
  filing: "SEC FILING",
  macro: "MACRO DATA",
  news: "NEWS",
  chart: "CHART CONTEXT",
  web: "WEB"
};
