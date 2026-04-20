"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Bookmark, Building2, FolderOpen, Home, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS: {
  icon: typeof Home;
  label: string;
  href: string;
  match: (path: string) => boolean;
}[] = [
  { icon: Home, label: "Home", href: "/work", match: (path) => path === "/work" },
  { icon: FolderOpen, label: "Saved", href: "/saved", match: (path) => path.startsWith("/saved") },
  { icon: Bookmark, label: "Bookmarks", href: "/bookmarks", match: (path) => path.startsWith("/bookmarks") }
];

export function Sidebar({ workspaceHref }: { workspaceHref?: string }) {
  const pathname = usePathname();
  const workspaceLink = workspaceHref ?? "/workspace/apple";
  const workspaceActive = pathname.startsWith("/workspace/");

  return (
    <div className="flex h-full flex-col py-4">
      <div className="mb-6 px-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-[var(--ll-radius-sm)]",
              "border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)]"
            )}
          >
            <TrendingUp size={12} className="text-[var(--ll-accent)]" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ll-text-tertiary)]">
              LedgerLens
            </p>
            <p className="mt-0.5 text-sm font-bold leading-none tracking-[-0.02em] text-[var(--ll-text-primary)]">
              Workspace
            </p>
          </div>
        </div>
      </div>

      <p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ll-text-tertiary)]">
        Navigate
      </p>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map((item, i) => {
          const isActive = item.match(pathname);
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "group relative flex h-9 items-center gap-2.5 rounded-[var(--ll-radius-md)] text-sm font-medium transition-all duration-150",
                  isActive
                    ? "border-l-2 border-[var(--ll-accent)] bg-[var(--ll-bg-elevated)] pl-[10px] pr-3 text-[var(--ll-text-primary)]"
                    : "px-3 text-[var(--ll-text-secondary)] hover:bg-[var(--ll-bg-elevated)] hover:text-[var(--ll-text-primary)]"
                )}
              >
                <item.icon
                  size={15}
                  strokeWidth={1.5}
                  className={cn(
                    isActive
                      ? "text-[var(--ll-accent)]"
                      : "text-[var(--ll-text-tertiary)] group-hover:text-[var(--ll-text-secondary)]"
                  )}
                />
                {item.label}
                {isActive ? (
                  <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--ll-accent)] shadow-[0_0_6px_var(--ll-accent)]" />
                ) : null}
              </Link>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: NAV_ITEMS.length * 0.05 }}
        >
          <Link
            href={workspaceLink}
            className={cn(
              "group relative flex h-9 items-center gap-2.5 rounded-[var(--ll-radius-md)] text-sm font-medium transition-all duration-150",
              workspaceActive
                ? "border-l-2 border-[var(--ll-accent)] bg-[var(--ll-bg-elevated)] pl-[10px] pr-3 text-[var(--ll-text-primary)]"
                : "px-3 text-[var(--ll-text-secondary)] hover:bg-[var(--ll-bg-elevated)] hover:text-[var(--ll-text-primary)]"
            )}
          >
            <Building2
              size={15}
              strokeWidth={1.5}
              className={cn(
                workspaceActive
                  ? "text-[var(--ll-accent)]"
                  : "text-[var(--ll-text-tertiary)] group-hover:text-[var(--ll-text-secondary)]"
              )}
            />
            Company
            {workspaceActive ? (
              <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--ll-accent)] shadow-[0_0_6px_var(--ll-accent)]" />
            ) : null}
          </Link>
        </motion.div>
      </nav>

      <div className="flex-1" />

      <div className="px-4 pb-2">
        <p className="font-mono text-[10px] leading-relaxed text-[var(--ll-text-tertiary)]">v1 · local</p>
      </div>
    </div>
  );
}
