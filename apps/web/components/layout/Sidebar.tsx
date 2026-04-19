import Link from "next/link";
import { Bookmark, Building2, FolderOpen, PanelsTopLeft } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: PanelsTopLeft },
  { href: "/saved", label: "Saved", icon: FolderOpen },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/workspace/apple", label: "Workspace", icon: Building2 }
];

export function Sidebar() {
  return (
    <aside
      style={{
        gridColumn: "1 / 2",
        gridRow: "1 / 3",
        borderRight: "1px solid var(--ll-border-subtle)",
        padding: "18px 14px",
        background: "color-mix(in oklab, var(--ll-bg-surface) 94%, transparent)"
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div className="mono muted" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
          LEDGERLENS
        </div>
        <div style={{ marginTop: 10, fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Analyst Workspace
        </div>
      </div>
      <nav style={{ display: "grid", gap: 8 }}>
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--ll-radius-sm)",
              color: "var(--ll-text-secondary)",
              borderLeft: href === "/workspace/apple" ? "2px solid var(--ll-accent)" : "2px solid transparent",
              background: href === "/workspace/apple" ? "var(--ll-bg-elevated)" : "transparent"
            }}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
