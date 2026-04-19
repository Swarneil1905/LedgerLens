"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiPostJson, getApiBaseUrl } from "@/lib/api-client";
import { mapCompany } from "@/lib/mappers";
import type { Company } from "@ledgerlens/types/workspace";

export function CompanySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("Apple");
  const [results, setResults] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (value: string) => {
    if (value.trim().length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${getApiBaseUrl()}/companies/search?q=${encodeURIComponent(value.trim())}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      const raw = (await response.json()) as unknown[];
      setResults(raw.map((row) => mapCompany(row as Record<string, unknown>)));
    } catch {
      setError("Unable to reach the LedgerLens API. Is the backend running on port 8000?");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      void runSearch(query);
    }, 250);
    return () => clearTimeout(handle);
  }, [query, runSearch]);

  async function openWorkspace(company: Company) {
    setError(null);
    try {
      await apiPostJson<unknown, { company_id: string }>("/workspace/create", {
        company_id: company.id
      });
      router.push(`/workspace/${company.id}`);
    } catch {
      setError("Could not create workspace for the selected company.");
    }
  }

  return (
    <div className="panel" style={{ padding: 22 }}>
      <label htmlFor="company-search" className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
        COMPANY SEARCH
      </label>
      <div
        style={{
          marginTop: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderRadius: "var(--ll-radius-md)",
          border: "1px solid var(--ll-border-default)",
          background: "var(--ll-bg-overlay)",
          padding: "14px 16px"
        }}
      >
        <Search size={18} className="muted" />
        <input
          id="company-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--ll-text-primary)"
          }}
        />
      </div>
      {error ? (
        <p style={{ color: "var(--ll-danger)", marginTop: 12, fontSize: 14 }}>{error}</p>
      ) : null}
      <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
        {loading ? <div className="skeleton" style={{ height: 40 }} /> : null}
        {!loading &&
          results.map((company) => (
            <button
              key={company.id}
              type="button"
              onClick={() => void openWorkspace(company)}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: "var(--ll-radius-md)",
                border: "1px solid var(--ll-border-default)",
                background: "var(--ll-bg-elevated)",
                color: "var(--ll-text-primary)",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 600 }}>{company.name}</div>
              <div className="muted mono" style={{ marginTop: 4, fontSize: 12 }}>
                {company.ticker} · {company.sector}
              </div>
            </button>
          ))}
        {!loading && query.length > 0 && results.length === 0 ? (
          <div className="muted" style={{ fontSize: 14 }}>
            No companies match that query.
          </div>
        ) : null}
      </div>
    </div>
  );
}
