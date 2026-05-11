"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

import { cn } from "@/lib/utils";

function isBrowserStorageError(reason: unknown): boolean {
  if (reason == null) return false;
  if (reason instanceof DOMException) {
    if (reason.name === "QuotaExceededError") return true;
    if (/quota|storage|IndexedDB|ldb/i.test(reason.message)) return true;
  }
  const msg = reason instanceof Error ? reason.message : String(reason);
  return /FILE_ERROR_NO_SPACE|QuotaExceeded|IndexedDB|\.ldb/i.test(msg);
}

/**
 * Surfaces actionable hints when the browser hits storage limits (often shown as
 * IndexedDB / *.ldb FILE_ERROR_NO_SPACE). LedgerLens does not manage IndexedDB directly;
 * this catches failures from analytics, extensions, or a full disk.
 */
export function BrowserIssueHints() {
  const reduceMotion = useReducedMotion();
  const [storageHint, setStorageHint] = useState<string | null>(null);

  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (isBrowserStorageError(reason)) {
        setStorageHint(
          "Your browser could not save site data (disk or site storage may be full). Try: Chrome ⋮ → Delete browsing data → Cached images & site data for this site, or free disk space."
        );
      }
    };

    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const est = await navigator.storage?.estimate?.();
        if (cancelled || !est?.quota || est.quota <= 0) return;
        const ratio = (est.usage ?? 0) / est.quota;
        if (ratio >= 0.97) {
          setStorageHint(
            "Browser storage for this site is nearly full. Clearing site data for this origin usually fixes odd failures."
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!storageHint) return null;

  return (
    <motion.div
      role="alert"
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-1/2 z-[100] w-[min(calc(100vw-1.5rem),420px)] -translate-x-1/2",
        "rounded-[var(--ll-radius-xl)] border border-[var(--ll-warning)]/35 bg-[var(--ll-bg-elevated)]/95 px-4 py-3 shadow-[var(--ll-shadow-3)] backdrop-blur-xl"
      )}
    >
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ll-warning)]/15 text-[var(--ll-warning)]">
          <AlertTriangle size={18} strokeWidth={2} aria-hidden />
        </span>
        <p className="min-w-0 flex-1 text-xs leading-relaxed text-[var(--ll-text-secondary)]">{storageHint}</p>
        <button
          type="button"
          onClick={() => setStorageHint(null)}
          className="shrink-0 rounded-[var(--ll-radius-md)] p-1 text-[var(--ll-text-tertiary)] outline-none transition-colors hover:bg-[var(--ll-bg-overlay)] hover:text-[var(--ll-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ll-accent)]"
          aria-label="Dismiss"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </motion.div>
  );
}
