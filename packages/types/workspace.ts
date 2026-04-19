import type { ChatMessage } from "./chat";
import type { CompanyChart } from "./chart";
import type { SourceCard } from "./source";

export type Company = {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  marketCap: string;
};

export type CompanySummary = {
  latestFilingDate: string;
  lastNewsEvent: string;
  macroContext: string;
};

export type Workspace = {
  id: string;
  company: Company;
  summary: CompanySummary;
  recentActivity: string[];
  chatMessages: ChatMessage[];
  sources: SourceCard[];
  charts: CompanyChart[];
  bookmarkCount: number;
  updatedAt: string;
};
