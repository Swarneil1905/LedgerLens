"use client";

import type { ChatMessage } from "@ledgerlens/types/chat";
import { motion } from "motion/react";
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
  const lastId = messages[messages.length - 1]?.id;
  const streamingAssistant = Boolean(isStreaming && lastId === "streaming-assistant");

  return (
    <section className="overflow-hidden rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] shadow-[var(--ll-shadow-1)]">
      {messages.map((message, index) => (
        <article
          key={message.id}
          className={cn(index > 0 ? "border-t border-[var(--ll-border-hairline)]" : "")}
        >
            {message.role === "user" ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-end px-6 py-5"
              >
                <div className="ml-12 max-w-[80%] rounded-[var(--ll-radius-lg)] rounded-br-[var(--ll-radius-xs)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] px-5 py-3">
                  <p className="ll-section-label mb-2">User query</p>
                  <p className="text-sm leading-relaxed text-[var(--ll-text-secondary)]">{message.content}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="px-6 py-5"
              >
                <div className="flex gap-3">
                  <div
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--ll-border-default)] bg-[var(--ll-accent)]/12 text-[10px] font-bold tracking-tight text-[var(--ll-accent)]"
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
                          <span className="text-xs text-[var(--ll-text-tertiary)]">Generating</span>
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

                    <div className="relative overflow-hidden rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)] shadow-[inset_3px_0_0_0_var(--ll-accent)]">
                      <div className="px-5 py-4">
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
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.25, delay: 0.2 + i * 0.07 }}
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
