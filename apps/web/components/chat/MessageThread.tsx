"use client";

import type { ChatMessage } from "@ledgerlens/types/chat";
import { motion } from "motion/react";
import { TrendingUp } from "lucide-react";

import { FormattedAnswer } from "@/components/chat/FormattedAnswer";
import { cn } from "@/lib/utils";

type MessageThreadProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
  onFollowUp?: (text: string) => void;
};

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
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-[var(--ll-radius-xs)] bg-[var(--ll-accent)]">
                      <TrendingUp size={11} className="text-[var(--ll-text-inverse)]" strokeWidth={2} />
                    </div>
                    <p className="text-xs font-semibold text-[var(--ll-text-tertiary)]">LedgerLens answer</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {streamingAssistant && message.id === "streaming-assistant" ? (
                      <span className="text-xs text-[var(--ll-text-tertiary)]">Generating</span>
                    ) : null}
                    {message.sources?.length ? (
                      <span className="text-xs text-[var(--ll-text-tertiary)]">
                        {message.sources.length} sources linked
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="overflow-hidden rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-surface)]">
                  <div className="px-5 py-4">
                    <FormattedAnswer content={message.content} />
                  </div>

                  {message.followUps?.length ? (
                    <div className="border-t border-[var(--ll-border-hairline)] px-5 py-3">
                      <p className="ll-section-label mb-2.5">Follow-up questions</p>
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
                              "cursor-pointer rounded-[var(--ll-radius-md)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-overlay)] px-3 py-1.5 text-left text-xs font-medium text-[var(--ll-text-secondary)] transition-all duration-150",
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
              </motion.div>
            )}
        </article>
      ))}
    </section>
  );
}
