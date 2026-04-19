import type { ChatMessage } from "@ledgerlens/types/chat";

export function MessageThread({ messages }: { messages: ChatMessage[] }) {
  return (
    <section className="panel" style={{ padding: 24 }}>
      <div className="page-grid">
        {messages.map((message) => (
          <article key={message.id} style={{ borderBottom: "1px solid var(--ll-border-subtle)", paddingBottom: 18 }}>
            <div
              className="muted mono"
              style={{ fontSize: 11, letterSpacing: "0.06em", textAlign: message.role === "user" ? "right" : "left" }}
            >
              {message.role === "user" ? "QUERY" : "ANALYSIS"}
            </div>
            <p style={{ margin: "12px 0 0", lineHeight: 1.75, fontSize: 16 }}>{message.content}</p>
            {message.sources?.length ? (
              <p className="muted mono" style={{ marginTop: 10, fontSize: 12 }}>
                Evidence: {message.sources.length} linked sources (see drawer)
              </p>
            ) : null}
            {message.followUps ? (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                {message.followUps.map((item) => (
                  <span
                    key={item}
                    style={{
                      padding: "8px 10px",
                      borderRadius: "var(--ll-radius-sm)",
                      background: "var(--ll-bg-overlay)",
                      color: "var(--ll-text-secondary)",
                      fontSize: 13
                    }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
