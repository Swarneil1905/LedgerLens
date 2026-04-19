export type SourceType = "filing" | "macro" | "news" | "chart";

export type SourceCard = {
  id: string;
  sourceType: SourceType;
  title: string;
  provider: string;
  date: string;
  url: string | null;
  ticker: string | null;
  snippet: string;
  metadata: Record<string, string | number | boolean | null>;
};
