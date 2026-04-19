"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api-client";

export function BookmarkEvidenceButton({ sourceId }: { sourceId: string }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setError(null);
    try {
      const response = await fetch(`${getApiBaseUrl()}/bookmarks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sourceId })
      });
      if (!response.ok) {
        throw new Error("Bookmark failed");
      }
      setSaved(true);
    } catch {
      setError("Could not save");
    }
  }

  return (
    <div style={{ marginTop: 10 }}>
      <button
        type="button"
        onClick={() => void save()}
        disabled={saved}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 10px",
          borderRadius: "var(--ll-radius-sm)",
          border: "1px solid var(--ll-border-default)",
          background: "var(--ll-bg-overlay)",
          color: "var(--ll-text-secondary)",
          cursor: saved ? "default" : "pointer",
          fontSize: 12
        }}
      >
        <Bookmark size={14} />
        {saved ? "Saved" : "Save evidence"}
      </button>
      {error ? (
        <span style={{ marginLeft: 8, color: "var(--ll-danger)", fontSize: 12 }}>{error}</span>
      ) : null}
    </div>
  );
}
