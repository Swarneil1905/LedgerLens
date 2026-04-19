import type { ChatMessage } from "@ledgerlens/types/chat";
import { FormattedAnswer } from "@/components/chat/FormattedAnswer";

type MessageThreadProps = {
  messages: ChatMessage[];
  isStreaming?: boolean;
};

export function MessageThread({ messages, isStreaming }: MessageThreadProps) {
  const lastId = messages[messages.length - 1]?.id;
  const streamingAssistant = Boolean(isStreaming && lastId === "streaming-assistant");

  return (
    <section
      style={{
        border: "1px solid var(--ll-border-default)",
        borderRadius: "var(--ll-radius-lg)",
        background: "var(--ll-bg-elevated)",
        boxShadow: "var(--ll-shadow-1)",
        overflow: "hidden"
      }}
    >
      {messages.map((message, index) => (
        <article
          key={message.id}
          style={{
            borderTop: index > 0 ? "1px solid var(--ll-border-hairline)" : "none"
          }}
        >
          {message.role === "user" ? (
            <div style={{ padding: "20px 24px 16px" }}>
              <div className="ll-section-label" style={{ marginBottom: 8, textAlign: "right" }}>
                User query
              </div>
              <div
                style={{
                  marginLeft: 48,
                  padding: "16px 20px",
                  borderLeft: "2px solid var(--ll-border-default)",
                  fontSize: "var(--ll-text-base)",
                  lineHeight: "var(--ll-text-base-lh)",
                  fontWeight: 400,
                  fontFamily: "var(--ll-font-ui)",
                  color: "var(--ll-text-secondary)"
                }}
              >
                {message.content}
              </div>
            </div>
          ) : (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "18px 24px 0"
                }}
              >
                <span className="ll-section-label" style={{ letterSpacing: "0.1em" }}>
                  LedgerLens answer
                </span>
                {streamingAssistant && message.id === "streaming-assistant" ? (
                  <span
                    className="mono"
                    style={{
                      fontSize: "var(--ll-text-2xs)",
                      color: "var(--ll-text-tertiary)",
                      letterSpacing: "0.04em"
                    }}
                  >
                    Generating
                  </span>
                ) : null}
              </div>
              <div style={{ padding: "12px 24px 8px" }}>
                <FormattedAnswer content={message.content} />
              </div>
              {message.sources?.length ? (
                <div
                  className="mono"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 24px",
                    borderTop: "1px solid var(--ll-border-hairline)",
                    fontSize: "var(--ll-text-xs)",
                    color: "var(--ll-text-tertiary)"
                  }}
                >
                  <span>{message.sources.length} sources linked</span>
                  <span>Drawer</span>
                </div>
              ) : null}
              {message.followUps?.length ? (
                <div style={{ padding: "12px 24px 20px" }}>
                  <div className="ll-section-label" style={{ marginBottom: 10, letterSpacing: "0.07em" }}>
                    Follow-up questions
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      overflowX: "auto",
                      paddingBottom: 4
                    }}
                  >
                    {message.followUps.map((item) => (
                      <button
                        key={item}
                        type="button"
                        style={{
                          flex: "0 0 auto",
                          padding: "6px 12px",
                          border: "1px solid var(--ll-border-default)",
                          borderRadius: "var(--ll-radius-sm)",
                          background: "var(--ll-bg-surface)",
                          fontSize: "var(--ll-text-xs)",
                          fontWeight: 500,
                          fontFamily: "var(--ll-font-ui)",
                          color: "var(--ll-text-secondary)",
                          whiteSpace: "nowrap",
                          cursor: "default"
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </article>
      ))}
    </section>
  );
}
