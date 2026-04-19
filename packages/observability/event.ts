export type TraceLevel = "info" | "warn" | "error";

export type TraceEvent = {
  id: string;
  level: TraceLevel;
  scope: string;
  message: string;
  createdAt: string;
  context?: Record<string, string | number | boolean | null>;
};
