"use client";

import type { ChatMessage } from "@ledgerlens/types/chat";
import type { CompanyChart } from "@ledgerlens/types/chart";
import type { SourceCard } from "@ledgerlens/types/source";
import { useCallback, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { MessageThread } from "@/components/chat/MessageThread";
import { getApiBaseUrl } from "@/lib/api-client";
import { mapChart, mapSource } from "@/lib/mappers";
import { readChatSseStream } from "@/lib/streaming";

type ChatSessionPanelProps = {
  sessionId: string;
  ticker: string;
  initialMessages: ChatMessage[];
};

export function ChatSessionPanel({ sessionId, ticker, initialMessages }: ChatSessionPanelProps) {
  const { setDrawer } = useWorkspaceUi();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState(
    "What changed in the latest filing versus the prior quarter?"
  );
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayMessages = useMemo(() => {
    if (!streamingText) {
      return messages;
    }
    const streamingMessage: ChatMessage = {
      id: "streaming-assistant",
      role: "assistant",
      content: streamingText,
      createdAt: new Date().toISOString()
    };
    return [...messages, streamingMessage];
  }, [messages, streamingText]);

  const runQuery = useCallback(async () => {
    const question = draft.trim();
    if (!question || isStreaming) {
      return;
    }
    setError(null);
    setStreaming(true);
    setStreamingText("");

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);

    let buffer = "";
    let followUps: string[] = [];
    let sourcesPayload: SourceCard[] = [];
    let chartPayload: CompanyChart | null = null;

    try {
      const response = await fetch(`${getApiBaseUrl()}/chat/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          ticker,
          session_id: sessionId,
          source_filters: []
        })
      });

      if (!response.ok || !response.body) {
        throw new Error(`Chat request failed (${response.status})`);
      }

      for await (const event of readChatSseStream(response.body)) {
        if (event.event === "text") {
          const chunk =
            typeof event.data === "object" && event.data && "chunk" in event.data
              ? String((event.data as { chunk?: string }).chunk ?? "")
              : "";
          buffer += chunk;
          setStreamingText(buffer);
        } else if (event.event === "sources") {
          const rawSources =
            typeof event.data === "object" && event.data && "sources" in event.data
              ? (event.data as { sources?: unknown[] }).sources ?? []
              : [];
          sourcesPayload = rawSources.map((item) => mapSource(item as Record<string, unknown>));
          setDrawer(sourcesPayload, chartPayload);
        } else if (event.event === "followups") {
          const raw =
            typeof event.data === "object" && event.data && "followUps" in event.data
              ? (event.data as { followUps?: string[] }).followUps ?? []
              : [];
          followUps = raw.map((item) => String(item));
        } else if (event.event === "chart") {
          const rawCharts =
            typeof event.data === "object" && event.data && "charts" in event.data
              ? (event.data as { charts?: unknown[] }).charts ?? []
              : [];
          const first = rawCharts[0];
          chartPayload =
            first && typeof first === "object" ? mapChart(first as Record<string, unknown>) : null;
          if (sourcesPayload.length) {
            setDrawer(sourcesPayload, chartPayload);
          }
        } else if (event.event === "done") {
          break;
        }
      }

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: buffer.trim(),
        createdAt: new Date().toISOString(),
        ...(followUps.length > 0 ? { followUps } : {}),
        ...(sourcesPayload.length > 0 ? { sources: sourcesPayload } : {})
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingText("");
      setDrawer(sourcesPayload, chartPayload);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chat failed");
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  }, [draft, isStreaming, sessionId, setDrawer, ticker]);

  return (
    <div className="page-grid" style={{ minHeight: "100%" }}>
      <MessageThread messages={displayMessages} isStreaming={isStreaming} />
      {error ? (
        <div
          style={{
            padding: "14px 16px",
            borderRadius: "var(--ll-radius-md)",
            border: "1px solid var(--ll-border-default)",
            background: "var(--ll-bg-surface)",
            color: "var(--ll-negative)",
            fontSize: "var(--ll-text-sm)",
            lineHeight: "var(--ll-text-sm-lh)"
          }}
        >
          {error}
        </div>
      ) : null}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: "auto",
          paddingTop: 8,
          background: "color-mix(in oklab, var(--ll-bg-surface) 88%, transparent)",
          borderTop: "1px solid var(--ll-border-hairline)",
          backdropFilter: "blur(8px)"
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runQuery();
          }}
          style={{ display: "flex", gap: 10, alignItems: "flex-end", padding: "16px 0 0" }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              disabled={isStreaming}
              placeholder="Ask about filings, macro, or news…"
              rows={2}
              style={{
                width: "100%",
                minHeight: "var(--ll-input-height)",
                maxHeight: 120,
                resize: "vertical" as const,
                padding: "10px 14px",
                borderRadius: "var(--ll-radius-md)",
                border: "1px solid var(--ll-border-default)",
                background: "var(--ll-bg-elevated)",
                color: "var(--ll-text-primary)",
                fontSize: "var(--ll-text-sm)",
                lineHeight: "var(--ll-text-sm-lh)",
                fontFamily: "var(--ll-font-ui)",
                outline: "none",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
                boxShadow: "none"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--ll-accent-border)";
                e.target.style.boxShadow = "var(--ll-glow-accent)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--ll-border-default)";
                e.target.style.boxShadow = "none";
              }}
            />
            <div
              className="mono"
              style={{
                fontSize: "var(--ll-text-2xs)",
                color: "var(--ll-text-tertiary)",
                letterSpacing: "0.04em"
              }}
            >
              Grounded on SEC, FRED, and news where indexed for {ticker}
            </div>
          </div>
          <button
            type="submit"
            disabled={isStreaming}
            aria-busy={isStreaming}
            style={{
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: "var(--ll-radius-sm)",
              border: "none",
              background: "var(--ll-accent)",
              color: "var(--ll-text-inverse)",
              display: "grid",
              placeItems: "center",
              cursor: isStreaming ? "default" : "pointer",
              opacity: isStreaming ? 0.55 : 1,
              transition: "background 150ms ease, opacity 150ms ease"
            }}
          >
            <ArrowUp size={16} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
