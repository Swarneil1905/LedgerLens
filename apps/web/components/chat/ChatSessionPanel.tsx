"use client";

import type { ChatMessage } from "@ledgerlens/types/chat";
import type { CompanyChart } from "@ledgerlens/types/chart";
import type { SourceCard } from "@ledgerlens/types/source";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Send } from "lucide-react";

import { BorderBeam } from "@/components/effects/BorderBeam";
import { MessageThread } from "@/components/chat/MessageThread";
import { useWorkspaceUi } from "@/components/layout/WorkspaceStateProvider";
import { getApiBaseUrl } from "@/lib/api-client";
import { mapChart, mapSource } from "@/lib/mappers";
import { readChatSseStream } from "@/lib/streaming";
import { cn } from "@/lib/utils";

type ChatSessionPanelProps = {
  sessionId: string;
  ticker: string;
  initialMessages: ChatMessage[];
};

const SOURCE_CHIPS: { label: string; color: string }[] = [
  { label: "SEC", color: "var(--ll-source-sec)" },
  { label: "FRED", color: "var(--ll-source-fred)" },
  { label: "NEWS", color: "var(--ll-source-news)" },
  { label: "WEB", color: "var(--ll-source-web)" }
];

export function ChatSessionPanel({ sessionId, ticker, initialMessages }: ChatSessionPanelProps) {
  const reduceMotion = useReducedMotion();
  const { setDrawer } = useWorkspaceUi();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("What changed in the latest filing versus the prior quarter?");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  /** From SSE `meta.answerStream` for this turn — never show ops/env details in the answer text. */
  const [turnAnswerStream, setTurnAnswerStream] = useState<"ollama" | "template" | null>(null);
  /** Populated from SSE `done.ollamaError` when Ollama was attempted but failed mid-turn. */
  const [ollamaFailureDetail, setOllamaFailureDetail] = useState<string | null>(null);

  /** Restore Sources drawer after reload — API history now includes evidence IDs/snippets per assistant turn. */
  useEffect(() => {
    const latestWithEvidence = [...messages]
      .reverse()
      .find((m) => m.role === "assistant" && m.sources && m.sources.length > 0);
    if (latestWithEvidence?.sources?.length) {
      setDrawer(latestWithEvidence.sources, null);
    }
  }, [messages, setDrawer]);

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
    setOllamaFailureDetail(null);
    setStreaming(true);
    setStreamingText("");
    setTurnAnswerStream(null);

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
        if (event.event === "meta") {
          const d = event.data as { answerStream?: string };
          if (d.answerStream === "template") {
            setTurnAnswerStream("template");
          } else if (d.answerStream === "ollama") {
            setTurnAnswerStream("ollama");
          }
        } else if (event.event === "text") {
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
          const d = event.data as { ollamaError?: string };
          if (d.ollamaError) {
            setOllamaFailureDetail(d.ollamaError);
          }
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
    <div className="flex min-h-full flex-col px-4 py-4 sm:px-6 sm:py-5">
      <MessageThread
        messages={displayMessages}
        isStreaming={isStreaming}
        onFollowUp={(text) => setDraft(text)}
      />

      {turnAnswerStream === "template" ? (
        <p className="mb-3 text-xs leading-relaxed text-[var(--ll-text-tertiary)]">
          This reply uses <span className="font-medium text-[var(--ll-text-secondary)]">source highlights</span>{" "}
          only. Narrative answers stream when the writing assistant is connected and healthy.
        </p>
      ) : null}

      {ollamaFailureDetail ? (
        <p className="mb-3 text-xs leading-relaxed text-[var(--ll-text-tertiary)]">
          Ollama could not complete this reply.{" "}
          <span className="font-mono text-[11px] text-[var(--ll-text-secondary)]">{ollamaFailureDetail}</span>
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] px-4 py-3.5 text-sm text-[var(--ll-negative)]">
          {error}
        </div>
      ) : null}

      <div className="sticky bottom-0 z-10 mt-auto border-t border-[var(--ll-border-hairline)] bg-[var(--ll-bg-base)]/95 px-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pt-4 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runQuery();
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] max-sm:snap-x max-sm:snap-mandatory [&::-webkit-scrollbar]:hidden">
            {SOURCE_CHIPS.map((src) => (
              <motion.button
                key={src.label}
                type="button"
                {...(!reduceMotion ? { whileTap: { scale: 0.96 } } : {})}
                className={cn(
                  "flex h-8 shrink-0 snap-start cursor-pointer items-center gap-1.5 rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] px-3 text-xs font-medium transition-[border-color,background-color,transform] duration-200 hover:border-[var(--ll-accent-border)] hover:bg-[var(--ll-bg-overlay)]"
                )}
                style={{ color: src.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: src.color }} />
                {src.label}
              </motion.button>
            ))}
            <span className="ml-auto max-w-[200px] shrink-0 snap-end text-right text-[11px] leading-snug text-[var(--ll-text-tertiary)] max-sm:max-w-[140px]">
              Grounded on SEC, FRED, news, and web (when enabled) for {ticker}
            </span>
          </div>

          <div className="flex items-end gap-3">
            <motion.div
              className={cn(
                "relative min-w-0 flex-1 overflow-hidden rounded-[var(--ll-radius-xl)] border bg-[var(--ll-bg-elevated)] transition-[border-color,box-shadow] duration-300 max-sm:rounded-2xl",
                inputFocused
                  ? "border-[var(--ll-accent-border)] shadow-[var(--ll-glow-accent)]"
                  : "border-[var(--ll-border-default)]"
              )}
            >
              {inputFocused ? <BorderBeam colorTo="var(--ll-accent)" duration={8} size={150} /> : null}
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                disabled={isStreaming}
                placeholder="Ask about filings, macro, or news…"
                rows={2}
                className={cn(
                  "w-full resize-none border-none bg-transparent px-4 pb-10 pt-3 font-[var(--ll-font-ui)] text-sm leading-relaxed text-[var(--ll-text-primary)] outline-none",
                  "placeholder:text-[var(--ll-text-tertiary)] disabled:opacity-50"
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void runQuery();
                  }
                }}
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <span className="hidden text-[10px] text-[var(--ll-text-tertiary)] sm:inline">
                  ⏎ Send · ⇧⏎ Newline
                </span>
                <motion.button
                  type="submit"
                  disabled={isStreaming || !draft.trim()}
                  {...(!(isStreaming || !draft.trim())
                    ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } }
                    : {})}
                  aria-busy={isStreaming}
                  className={cn(
                    "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--ll-radius-md)] bg-[var(--ll-accent)] text-[var(--ll-text-inverse)] shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-all duration-150",
                    "hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] disabled:cursor-not-allowed disabled:opacity-30"
                  )}
                >
                  <Send size={13} strokeWidth={2} />
                </motion.button>
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}
