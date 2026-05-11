"use client";

import type { ChatMessage } from "@ledgerlens/types/chat";
import { motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";

import { FormattedAnswer } from "@/components/chat/FormattedAnswer";
import { cn } from "@/lib/utils";

type MessageThreadProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onFollowUp?: (text: string) => void;
};

function CopyAnswerButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={() => void onCopy()}
      className="inline-flex items-center gap-1 rounded-[var(--ll-radius-xs)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-overlay)] px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[var(--ll-text-tertiary)] transition-colors hover:border-[var(--ll-border-strong)] hover:text-[var(--ll-text-secondary)]"
      aria-label="Copy answer"
    >
      {copied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={2} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function MessageThread({ messages, isStreaming, onFollowUp }: MessageThreadProps) {
  const reduceMotion = useReducedMotion();
  const lastId = messages[messages.length - 1]?.id;
  const streamingAssistant = Boolean(isStreaming && lastId === "streaming-assistant");

  return (
    <section className="overflow-hidden rounded-[var(--ll-radius-xl)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)]/90 shadow-[var(--ll-shadow-2)] backdrop-blur-[2px] transition-[box-shadow,border-color] duration-300 max-sm:rounded-2xl max-sm:border-[var(--ll-border-hairline)] max-sm:shadow-[var(--ll-glow-card)]">
      {messages.map((message, index) => (
        <article
          key={message.id}
          className={cn(index > 0 ? "border-t border-[var(--ll-border-hairline)]" : "")}
        >
            {message.role === "user" ? (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-end px-4 py-4 sm:px-6 sm:py-5"
              >
                <div className="ml-6 max-w-[min(92vw,calc(100%-1rem))] rounded-[var(--ll-radius-xl)] rounded-br-md border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] px-4 py-3 shadow-[var(--ll-shadow-1)] transition-transform duration-200 sm:ml-12 sm:max-w-[80%] sm:rounded-[var(--ll-radius-lg)] sm:rounded-br-[var(--ll-radius-xs)] sm:px-5">
                  <p className="ll-section-label mb-2">User query</p>
                  <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{message.content}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.42, delay: reduceMotion ? 0 : 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="px-4 py-4 sm:px-6 sm:py-5"
              >
                <div className="flex gap-2.5 sm:gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-[var(--ll-accent)]/12 text-[10px] font-bold tracking-tight text-[var(--ll-accent)] transition-[border-color,box-shadow] duration-300",
                      streamingAssistant && message.id === "streaming-assistant"
                        ? "border-[var(--ll-accent-border)] shadow-[0_0_14px_oklch(0.72_0.17_200/0.2)]"
                        : "border-[var(--ll-border-default)]"
                    )}
                    aria-hidden
                  >
                    LL
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold tracking-wide text-[var(--ll-text-tertiary)]">
                        LedgerLens answer
                      </p>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {streamingAssistant && message.id === "streaming-assistant" ? (
                          <span className="flex items-center gap-2 text-xs text-[var(--ll-text-tertiary)]">
                            <span className="ll-dot-pulse inline-flex h-2 w-2 rounded-full bg-[var(--ll-accent)] shadow-[0_0_10px_oklch(0.72_0.17_200/0.45)]" />
                            Generating
                          </span>
                        ) : null}
                        {message.sources?.length ? (
                          <span className="text-xs text-[var(--ll-text-tertiary)]">
                            {message.sources.length} sources linked
                          </span>
                        ) : null}
                        {message.content.trim().length > 40 ? (
                          <CopyAnswerButton text={message.content} />
                        ) : null}
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[var(--ll-radius-xl)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] shadow-[inset_4px_0_0_0_var(--ll-accent)] transition-[border-color,box-shadow] duration-300 max-sm:rounded-2xl">
                      {streamingAssistant && message.id === "streaming-assistant" ? (
                        <div className="pointer-events-none absolute inset-0 z-0 ll-streaming-shimmer opacity-90" aria-hidden />
                      ) : null}
                      <div className="relative z-[1] px-4 py-3.5 sm:px-5 sm:py-4">
                        <FormattedAnswer content={message.content} />
                      </div>

                      {message.followUps?.length ? (
                        <div className="border-t border-[var(--ll-border-hairline)] px-5 py-3">
                          <p className="ll-section-label mb-2.5">Suggested next questions</p>
                          <div className="flex flex-wrap gap-2">
                            {message.followUps.map((item, i) => (
                              <motion.button
                                key={item}
                                type="button"
                                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: reduceMotion ? 0 : 0.28,
                                  delay: reduceMotion ? 0 : 0.18 + i * 0.06,
                                  ease: [0.22, 1, 0.36, 1]
                                }}
                                onClick={() => onFollowUp?.(item)}
                                className={cn(
                                  "max-w-full cursor-pointer rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-overlay)] px-3 py-1.5 text-left text-xs font-medium leading-snug text-[var(--ll-text-secondary)] transition-all duration-150",
                                  "hover:border-[var(--ll-accent-border)] hover:bg-[var(--ll-accent-dim)] hover:text-[var(--ll-text-primary)]"
                                )}
                              >
                                {item}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
        </article>
      ))}
    </section>
  );
}
