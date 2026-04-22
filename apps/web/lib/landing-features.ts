import type { LucideIcon } from "lucide-react";
import { BarChart3, BookMarked, Brain, FileSearch, Newspaper, Zap } from "lucide-react";

export type LandingFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  spotlight: string;
};

export const LANDING_FEATURES: LandingFeature[] = [
  {
    icon: FileSearch,
    title: "SEC Filing Analysis",
    description:
      "Instantly surface what changed between 10-K and 10-Q filings. Risk factors, revenue mix, management commentary, all searchable.",
    color: "var(--ll-source-sec)",
    spotlight: "color-mix(in oklch, var(--ll-source-sec) 14%, transparent)"
  },
  {
    icon: BarChart3,
    title: "FRED Macro Context",
    description:
      "Every answer is automatically contextualized with relevant macro indicators: interest rates, CPI, employment, industrial output.",
    color: "var(--ll-source-fred)",
    spotlight: "color-mix(in oklch, var(--ll-source-fred) 14%, transparent)"
  },
  {
    icon: Newspaper,
    title: "Live News Synthesis",
    description:
      "Three independent news sources cross-referenced against filing data. Breaking developments surface before they hit consensus.",
    color: "var(--ll-source-news)",
    spotlight: "color-mix(in oklch, var(--ll-source-news) 14%, transparent)"
  },
  {
    icon: Brain,
    title: "Grounded Answers Only",
    description:
      "Every claim is cited. The model cannot fabricate; it can only synthesize from retrieved evidence. Citation superscripts link to sources.",
    color: "var(--ll-accent)",
    spotlight: "color-mix(in oklch, var(--ll-accent) 14%, transparent)"
  },
  {
    icon: BookMarked,
    title: "Persistent Workspaces",
    description:
      "Save company workspaces, bookmark key answers, and resume sessions. Your research persists across logins.",
    color: "var(--ll-source-sec)",
    spotlight: "color-mix(in oklch, var(--ll-source-sec) 12%, transparent)"
  },
  {
    icon: Zap,
    title: "Real-time Streaming",
    description:
      "Answers stream token by token. Sources populate as they're retrieved. No waiting for a full response before you start reading.",
    color: "var(--ll-source-fred)",
    spotlight: "color-mix(in oklch, var(--ll-source-fred) 12%, transparent)"
  }
];
