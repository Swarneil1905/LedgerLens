"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { getApiBaseUrl } from "@/lib/api-client";

export function StartAnalysisButton({ ticker, href }: { ticker: string; href: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12_000);
      try {
        const url = `${getApiBaseUrl()}/sources/refresh?ticker=${encodeURIComponent(ticker)}`;
        await fetch(url, { method: "POST", signal: controller.signal });
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      // If refresh fails (network, timeout, rate limit), still allow the analysis session to start.
    } finally {
      router.push(href);
      setLoading(false);
    }
  }, [href, loading, router, ticker]);

  return (
    <button
      type="button"
      onClick={() => void onClick()}
      disabled={loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: "var(--ll-radius-md)",
        background: "var(--ll-accent)",
        color: "var(--ll-text-inverse)",
        fontWeight: 600,
        fontSize: 14,
        opacity: loading ? 0.85 : 1
      }}
    >
      {loading ? "Refreshing…" : "Start analysis"}
    </button>
  );
}

