"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

import { getApiBaseUrl } from "@/lib/api-client";
import { cn } from "@/lib/utils";

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
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => void save()}
        disabled={saved}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--ll-radius-sm)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-overlay)] px-2.5 py-1.5 text-xs font-semibold text-[var(--ll-text-secondary)] transition-colors duration-150",
          "hover:border-[var(--ll-accent-border)] hover:text-[var(--ll-accent)] disabled:cursor-default disabled:opacity-60"
        )}
      >
        <Bookmark size={12} strokeWidth={2} />
        {saved ? "Saved" : "Save evidence"}
      </button>
      {error ? <span className="ml-2 text-xs text-[var(--ll-negative)]">{error}</span> : null}
    </div>
  );
}
