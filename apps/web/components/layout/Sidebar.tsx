"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, Building2, FolderOpen, PanelsTopLeft } from "lucide-react";

const navBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  height: 36,
  paddingLeft: 12,
  paddingRight: 12,
  borderRadius: "var(--ll-radius-sm)",
  fontSize: "var(--ll-text-sm)",
  lineHeight: "var(--ll-text-sm-lh)",
  transition: "color 100ms ease, background 100ms ease, border-color 100ms ease",
  textDecoration: "none"
};

const items = [
  { href: "/work", label: "Home", icon: PanelsTopLeft, match: (path: string) => path === "/work" },
  { href: "/saved", label: "Saved", icon: FolderOpen, match: (path: string) => path.startsWith("/saved") },
  {
    href: "/bookmarks",
    label: "Bookmarks",
    icon: Bookmark,
    match: (path: string) => path.startsWith("/bookmarks")
  }
];

function navLinkStyle(active: boolean): CSSProperties {
  return {
    ...navBase,
    borderLeft: active ? "2px solid var(--ll-accent)" : "2px solid transparent",
    paddingLeft: active ? 10 : 12,
    color: active ? "var(--ll-text-primary)" : "var(--ll-text-secondary)",
    fontWeight: active ? 600 : 500,
    background: active ? "var(--ll-bg-elevated)" : "transparent"
  };
}

export function Sidebar({ workspaceHref }: { workspaceHref?: string }) {
  const pathname = usePathname();
  const workspaceLink = workspaceHref ?? "/workspace/apple";
  const workspaceActive = pathname.startsWith("/workspace/");

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "16px 10px 12px"
      }}
    >
      <div style={{ padding: "0 6px 20px" }}>
        <div className="ll-section-label" style={{ paddingLeft: 4 }}>
          LedgerLens
        </div>
        <div
          style={{
            marginTop: 8,
            fontSize: "var(--ll-text-lg)",
            lineHeight: "var(--ll-text-lg-lh)",
            fontWeight: 700,
            letterSpacing: "-0.025em",
            color: "var(--ll-text-primary)",
            paddingLeft: 4
          }}
        >
          Workspace
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        <div className="ll-section-label" style={{ padding: "12px 10px 4px" }}>
          Navigate
        </div>
        {items.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link key={href} href={href} style={navLinkStyle(active)}>
              <Icon size={16} strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
        <Link href={workspaceLink} style={navLinkStyle(workspaceActive)}>
          <Building2 size={16} strokeWidth={1.5} />
          <span>Company</span>
        </Link>
      </nav>

      <div
        className="mono"
        style={{
          marginTop: "auto",
          padding: "12px 10px 4px",
          fontSize: "var(--ll-text-2xs)",
          lineHeight: "var(--ll-text-2xs-lh)",
          color: "var(--ll-text-tertiary)",
          letterSpacing: "0.04em"
        }}
      >
        v1 · local
      </div>
    </div>
  );
}
