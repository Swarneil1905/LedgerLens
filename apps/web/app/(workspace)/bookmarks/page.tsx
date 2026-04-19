import { mockWorkspace } from "@/lib/mock-data";
import { SourceCard } from "@/components/sources/SourceCard";

export default function BookmarksPage() {
  return (
    <div className="page-grid">
      <div>
        <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
          BOOKMARKS
        </p>
        <h1 className="section-title" style={{ marginTop: 8 }}>
          Saved evidence
        </h1>
      </div>
      {mockWorkspace.sources.map((source) => (
        <SourceCard key={source.id} source={source} />
      ))}
    </div>
  );
}
