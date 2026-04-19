import type { CompanyChart } from "./chart";
import type { SourceCard } from "./source";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  citations?: number[];
  sources?: SourceCard[];
  followUps?: string[];
  charts?: CompanyChart[];
};

export type ChatStreamEvent =
  | { event: "text"; chunk: string }
  | { event: "sources"; sources: SourceCard[] }
  | { event: "followups"; followUps: string[] }
  | { event: "chart"; charts: CompanyChart[] }
  | { event: "done" };

export type ChatQueryRequest = {
  question: string;
  ticker: string;
  sessionId: string;
  sourceFilters: Array<"filing" | "macro" | "news" | "chart">;
};
