"use client";

import { ArrowUp } from "lucide-react";

export function QueryInput() {
  return (
    <form className="panel" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
      <textarea
        defaultValue="What changed in Apple's latest filing versus the previous quarter?"
        rows={3}
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
        style={{
          width: 40,
          height: 40,
          borderRadius: "var(--ll-radius-md)",
          border: "none",
          background: "var(--ll-accent)",
          color: "var(--ll-text-inverse)"
        }}
      >
        <ArrowUp size={18} />
      </button>
    </form>
  );
}
