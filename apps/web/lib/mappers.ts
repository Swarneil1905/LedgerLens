import type { ChatMessage } from "@ledgerlens/types/chat";
import type { CompanyChart } from "@ledgerlens/types/chart";
import type { SourceCard, SourceType } from "@ledgerlens/types/source";
import type { Company, CompanySummary, Workspace } from "@ledgerlens/types/workspace";

function readString(value: unknown): string {
  return typeof value === "string" ? value : String(value ?? "");
}

function readSourceType(value: unknown): SourceType {
  if (
    value === "filing" ||
    value === "macro" ||
    value === "news" ||
    value === "chart" ||
    value === "web"
  ) {
    return value;
  }
  return "filing";
}

export function mapSource(raw: Record<string, unknown>): SourceCard {
  const dateValue = raw.date ?? raw.created_at;
  const date =
    typeof dateValue === "string"
      ? dateValue.slice(0, 10)
      : dateValue instanceof Date
        ? dateValue.toISOString().slice(0, 10)
        : readString(dateValue);

  return {
    id: readString(raw.id),
    sourceType: readSourceType(raw.source_type ?? raw.sourceType),
    title: readString(raw.title),
    provider: readString(raw.provider),
    date,
    url: raw.url === null || raw.url === undefined ? null : readString(raw.url),
    ticker: raw.ticker === null || raw.ticker === undefined ? null : readString(raw.ticker),
    snippet: readString(raw.snippet),
    metadata: mapMetadata(raw.metadata)
  };
}

function mapMetadata(value: unknown): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object") {
    return {};
  }
  const out: Record<string, string | number | boolean | null> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (entry === null || typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") {
      out[key] = entry;
    } else if (entry !== undefined) {
      out[key] = String(entry);
    }
  }
  return out;
}

export function mapCompany(raw: Record<string, unknown>): Company {
  return {
    id: readString(raw.id),
    name: readString(raw.name),
    ticker: readString(raw.ticker),
    sector: readString(raw.sector),
    marketCap: readString(raw.market_cap ?? raw.marketCap)
  };
}

export function mapSummary(raw: Record<string, unknown>): CompanySummary {
  return {
    latestFilingDate: readString(raw.latest_filing_date ?? raw.latestFilingDate),
    lastNewsEvent: readString(raw.last_news_event ?? raw.lastNewsEvent),
    macroContext: readString(raw.macro_context ?? raw.macroContext)
  };
}

export function mapChart(raw: Record<string, unknown>): CompanyChart {
  const seriesRaw = Array.isArray(raw.series) ? raw.series : [];
  return {
    id: readString(raw.id),
    title: readString(raw.title),
    subtitle: readString(raw.subtitle),
    series: seriesRaw.map((item) => {
      const entry = item as Record<string, unknown>;
      const pointsRaw = Array.isArray(entry.points) ? entry.points : [];
      return {
        id: readString(entry.id),
        label: readString(entry.label),
        color: readString(entry.color),
        points: pointsRaw.map((point) => {
          const p = point as Record<string, unknown>;
          return { label: readString(p.label), value: Number(p.value) };
        })
      };
    })
  };
}

export function mapChatMessage(raw: Record<string, unknown>): ChatMessage {
  const created = raw.created_at ?? raw.createdAt;
  const createdAt =
    typeof created === "string"
      ? created
      : created instanceof Date
        ? created.toISOString()
        : new Date().toISOString();

  const followRaw = raw.follow_ups ?? raw.followUps;
  const followUps = Array.isArray(followRaw) ? followRaw.map((item) => readString(item)) : undefined;

  const sourcesRaw = raw.sources;
  const sources =
    Array.isArray(sourcesRaw) && sourcesRaw.length > 0
      ? sourcesRaw.map((item) => mapSource(item as Record<string, unknown>))
      : undefined;

  return {
    id: readString(raw.id),
    role: raw.role === "assistant" ? "assistant" : "user",
    content: readString(raw.content),
    createdAt,
    ...(followUps && followUps.length > 0 ? { followUps } : {}),
    ...(sources ? { sources } : {})
  };
}

export function mapWorkspace(raw: Record<string, unknown>): Workspace {
  const sourcesRaw = Array.isArray(raw.sources) ? raw.sources : [];
  const chartsRaw = Array.isArray(raw.charts) ? raw.charts : [];
  const messagesRaw = Array.isArray(raw.chat_messages) ? raw.chat_messages : [];
  const activityRaw = Array.isArray(raw.recent_activity) ? raw.recent_activity : [];

  const updated = raw.updated_at ?? raw.updatedAt;
  const updatedAt =
    typeof updated === "string"
      ? updated
      : updated instanceof Date
        ? updated.toISOString()
        : new Date().toISOString();

  return {
    id: readString(raw.id),
    company: mapCompany(raw.company as Record<string, unknown>),
    summary: mapSummary(raw.summary as Record<string, unknown>),
    recentActivity: activityRaw.map((item) => readString(item)),
    chatMessages: messagesRaw.map((item) => mapChatMessage(item as Record<string, unknown>)),
    sources: sourcesRaw.map((item) => mapSource(item as Record<string, unknown>)),
    charts: chartsRaw.map((item) => mapChart(item as Record<string, unknown>)),
    bookmarkCount: Number(raw.bookmark_count ?? raw.bookmarkCount ?? 0),
    updatedAt
  };
}

export type BookmarkRow = {
  id: string;
  sourceId: string;
  createdAt: string;
  source: SourceCard | null;
};

export function mapBookmark(raw: Record<string, unknown>): BookmarkRow {
  const created = raw.created_at ?? raw.createdAt;
  const createdAt = typeof created === "string" ? created : new Date().toISOString();
  const sourceRaw = raw.source;
  return {
    id: readString(raw.id),
    sourceId: readString(raw.source_id ?? raw.sourceId),
    createdAt,
    source:
      sourceRaw && typeof sourceRaw === "object"
        ? mapSource(sourceRaw as Record<string, unknown>)
        : null
  };
}
