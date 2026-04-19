import type { Workspace } from "@ledgerlens/types/workspace";

export const mockWorkspace: Workspace = {
  id: "apple",
  company: {
    id: "company-apple",
    name: "Apple Inc.",
    ticker: "AAPL",
    sector: "Technology Hardware",
    marketCap: "$2.7T"
  },
  summary: {
    latestFilingDate: "2026-01-30",
    lastNewsEvent: "Supply-chain commentary updated 2 days ago",
    macroContext: "Rates remain restrictive while consumer demand stays resilient."
  },
  recentActivity: [
    "Compared Services margin commentary across the last two quarters.",
    "Tracked macro sensitivity against rates and discretionary demand.",
    "Bookmarked CFO comments on inventory normalization."
  ],
  chatMessages: [
    {
      id: "q1",
      role: "user",
      content: "What changed in Apple's latest filing versus the previous quarter?",
      createdAt: "2026-04-19T08:00:00Z"
    },
    {
      id: "a1",
      role: "assistant",
      content:
        "Revenue mix remained stable, but management emphasized services durability and a tighter hardware supply outlook. The filing also sharpened language around regional foreign-exchange pressure while maintaining capital return confidence [1] [2].",
      createdAt: "2026-04-19T08:00:05Z",
      followUps: [
        "How did gross margin language change?",
        "What macro indicators matter most for iPhone demand?",
        "Which supplier headlines confirm the filing tone?"
      ]
    }
  ],
  sources: [
    {
      id: "source-1",
      sourceType: "filing",
      title: "Apple Q1 2026 10-Q",
      provider: "SEC EDGAR",
      date: "2026-01-30",
      url: null,
      ticker: "AAPL",
      snippet: "Management highlighted services momentum, regional FX headwinds, and continued capital returns.",
      metadata: { formType: "10-Q" }
    },
    {
      id: "source-2",
      sourceType: "news",
      title: "Apple suppliers signal steadier channel demand into spring",
      provider: "Reuters",
      date: "2026-04-17",
      url: null,
      ticker: "AAPL",
      snippet: "Supplier commentary suggested improving visibility for premium device demand and tighter inventory.",
      metadata: { region: "Global" }
    },
    {
      id: "source-3",
      sourceType: "macro",
      title: "US Real Disposable Income Trend",
      provider: "FRED",
      date: "2026-04-01",
      url: null,
      ticker: null,
      snippet: "Consumer purchasing power remains constructive even with rates elevated.",
      metadata: { seriesId: "DSPIC96" }
    }
  ],
  charts: [
    {
      id: "chart-1",
      title: "Services Mix Stability",
      subtitle: "Illustrative internal view of revenue mix over the last four quarters.",
      series: [
        {
          id: "services",
          label: "Services %",
          color: "var(--ll-accent)",
          points: [
            { label: "Q2", value: 28 },
            { label: "Q3", value: 29 },
            { label: "Q4", value: 30 },
            { label: "Q1", value: 31 }
          ]
        }
      ]
    }
  ],
  bookmarkCount: 12,
  updatedAt: "2026-04-19T08:00:05Z"
};

export const mockWorkspaces: Workspace[] = [
  mockWorkspace,
  {
    ...mockWorkspace,
    id: "microsoft",
    company: {
      id: "company-msft",
      name: "Microsoft",
      ticker: "MSFT",
      sector: "Software",
      marketCap: "$3.1T"
    },
    bookmarkCount: 7
  }
];
