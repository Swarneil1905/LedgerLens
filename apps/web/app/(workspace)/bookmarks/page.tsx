import { WorkspaceHeaderHydrator } from "@/components/layout/WorkspaceHeaderHydrator";
import { BookmarksList } from "@/components/bookmarks/BookmarksList";
import { apiGetJson } from "@/lib/api-client";
import { mapBookmark } from "@/lib/mappers";

export default async function BookmarksPage() {
  let rows: unknown[] = [];
  try {
    rows = await apiGetJson<unknown[]>("/bookmarks");
  } catch {
    rows = [];
  }

  const bookmarks = rows.map((row) => mapBookmark(row as Record<string, unknown>));

  return (
    <>
      <WorkspaceHeaderHydrator title="Bookmarks" subtitle="Saved evidence" />
      <div className="page-grid">
        <div>
          <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
            BOOKMARKS
          </p>
          <h1 className="section-title" style={{ marginTop: 8 }}>
            Saved evidence
          </h1>
        </div>
        <BookmarksList initialBookmarks={bookmarks} />
      </div>
    </>
  );
}
