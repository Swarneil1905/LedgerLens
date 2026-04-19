"use client";

import type { ChatMessage } from "@ledgerlens/types/chat";
import type { CompanyChart } from "@ledgerlens/types/chart";
import type { SourceCard } from "@ledgerlens/types/source";
import { useCallback, useMemo, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { getApiBaseUrl } from "@/lib/api-client";
import { mapChart, mapSource } from "@/lib/mappers";
import { readChatSseStream } from "@/lib/streaming";
import { MessageThread } from "@/components/chat/MessageThread";

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
      <MessageThread messages={displayMessages} />
      {error ? (
        <div
          className="panel"
          style={{
            padding: 14,
            borderColor: "var(--ll-danger)",
            color: "var(--ll-danger)",
            fontSize: 14
          }}
        >
          {error}
        </div>
      ) : null}
      <div style={{ position: "sticky", bottom: 0, paddingBottom: 8 }}>
        <form
          className="panel"
          style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}
          onSubmit={(e) => {
            e.preventDefault();
            void runQuery();
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            disabled={isStreaming}
            placeholder="Ask a grounded question about filings, macro, or news…"
            style={{
              width: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--ll-text-primary)"
            }}
          />
          <button
            type="submit"
            disabled={isStreaming}
            aria-busy={isStreaming}
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--ll-radius-md)",
              border: "none",
              background: "var(--ll-accent)",
              color: "var(--ll-text-inverse)",
              opacity: isStreaming ? 0.6 : 1
            }}
          >
            <ArrowUp size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
