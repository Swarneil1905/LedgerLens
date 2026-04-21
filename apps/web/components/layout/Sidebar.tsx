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
              "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--ll-radius-md)]",
              "border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)]"
            )}
          >
            <TrendingUp size={15} className="text-[var(--ll-accent)]" strokeWidth={1.75} />
          </div>
          <div>
            <p className="text-base font-semibold leading-tight tracking-[-0.03em] text-[var(--ll-text-primary)]">
              LedgerLens
            </p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.08em] text-[var(--ll-text-tertiary)]">
              Workspace
            </p>
          </div>
        </div>
      </div>

      <p className="ll-section-label mb-2 px-4">Navigate</p>

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
        <p className="text-xs leading-relaxed text-[var(--ll-text-tertiary)]">v1 · local</p>
      </div>
    </div>
  );
}
