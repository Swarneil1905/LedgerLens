"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import type { BookmarkRow } from "@/lib/mappers";
import { SourceCard } from "@/components/sources/SourceCard";
import { getApiBaseUrl } from "@/lib/api-client";

type BookmarksListProps = {
  initialBookmarks: BookmarkRow[];
};

export function BookmarksList({ initialBookmarks }: BookmarksListProps) {
  const [items, setItems] = useState(initialBookmarks);

  const grouped = useMemo(() => {
    const map = new Map<string, BookmarkRow[]>();
    for (const bookmark of items) {
      const key = bookmark.source?.ticker ?? "General";
      const bucket = map.get(key) ?? [];
      bucket.push(bookmark);
      map.set(key, bucket);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  async function removeBookmark(id: string) {
    try {
      const response = await fetch(`${getApiBaseUrl()}/bookmarks/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      /* handled silently for v1 */
    }
  }

  if (!items.length) {
    return (
      <div className="panel muted" style={{ padding: 20, fontSize: 14 }}>
        No bookmarks yet. Save a source card from chat evidence to populate this view.
      </div>
    );
  }

  return (
    <div className="page-grid">
      {grouped.map(([ticker, group]) => (
        <section key={ticker} className="page-grid">
          <p className="mono muted" style={{ fontSize: 12, letterSpacing: "0.06em" }}>
            {ticker}
          </p>
          {group.map((bookmark) => (
            <div key={bookmark.id} className="panel" style={{ padding: 12, display: "grid", gap: 10 }}>
              {bookmark.source ? (
                <SourceCard source={bookmark.source} />
              ) : (
                <div className="muted" style={{ fontSize: 14 }}>
                  Unknown source ({bookmark.sourceId})
                </div>
              )}
              <button
                type="button"
                onClick={() => void removeBookmark(bookmark.id)}
                style={{
                  justifySelf: "start",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: "var(--ll-radius-sm)",
                  border: "1px solid var(--ll-border-default)",
                  background: "var(--ll-bg-elevated)",
                  color: "var(--ll-text-secondary)",
                  cursor: "pointer"
                }}
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
