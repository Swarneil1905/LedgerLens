"use client";

export default function WorkspaceError({
  error,
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="panel" style={{ padding: 24 }}>
      <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
        ERROR
      </p>
      <h1 className="section-title" style={{ marginTop: 8 }}>
        Workspace failed to load
      </h1>
      <p className="muted" style={{ marginTop: 10 }}>
        {error.message}
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 16,
          padding: "10px 14px",
          borderRadius: "var(--ll-radius-sm)",
          border: "1px solid var(--ll-border-default)",
          background: "var(--ll-bg-elevated)",
          color: "var(--ll-text-primary)"
        }}
      >
        Retry
      </button>
    </div>
  );
}
