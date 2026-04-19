"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Building2, FolderOpen, PanelsTopLeft } from "lucide-react";

const items = [
  { href: "/", label: "Home", icon: PanelsTopLeft, match: (path: string) => path === "/" },
  { href: "/saved", label: "Saved", icon: FolderOpen, match: (path: string) => path.startsWith("/saved") },
  {
    href: "/bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
    match: (path: string) => path.startsWith("/bookmarks")
  }
];

export function Sidebar({ workspaceHref }: { workspaceHref?: string }) {
  const pathname = usePathname();
  const workspaceLink = workspaceHref ?? "/workspace/apple";

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
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              data-active={active}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--ll-radius-sm)",
                color: active ? "var(--ll-text-primary)" : "var(--ll-text-secondary)",
                borderLeft: active ? "2px solid var(--ll-accent)" : "2px solid transparent",
                background: active ? "var(--ll-bg-elevated)" : "transparent",
                paddingLeft: active ? 10 : 12
              }}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link
          href={workspaceLink}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 12px",
            borderRadius: "var(--ll-radius-sm)",
            color: pathname.startsWith("/workspace/")
              ? "var(--ll-text-primary)"
              : "var(--ll-text-secondary)",
            borderLeft: pathname.startsWith("/workspace/")
              ? "2px solid var(--ll-accent)"
              : "2px solid transparent",
            background: pathname.startsWith("/workspace/") ? "var(--ll-bg-elevated)" : "transparent",
            paddingLeft: pathname.startsWith("/workspace/") ? 10 : 12
          }}
        >
          <Building2 size={16} />
          <span>Company</span>
        </Link>
      </nav>
    </aside>
  );
}
