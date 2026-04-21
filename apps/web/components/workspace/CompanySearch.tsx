"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search } from "lucide-react";

import { BorderBeam } from "@/components/effects/BorderBeam";
import { apiPostJson, getApiBaseUrl } from "@/lib/api-client";
import { mapCompany } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import type { Company } from "@ledgerlens/types/workspace";

export function CompanySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("Apple");
  const [results, setResults] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

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

  const showResults = !loading && query.trim().length > 0 && results.length > 0;

  return (
    <div className="px-8 pb-6">
      <p className="ll-section-label mb-3">Company search</p>

      <div className="relative">
        <div
          className={cn(
            "relative overflow-hidden rounded-[var(--ll-radius-lg)] border bg-[var(--ll-bg-elevated)] transition-all duration-200",
            focused ? "border-[var(--ll-accent-border)] shadow-[var(--ll-glow-accent)]" : "border-[var(--ll-border-default)]"
          )}
        >
          {focused ? <BorderBeam colorTo="var(--ll-accent)" duration={6} size={120} /> : null}
          <div className="relative flex h-12 items-center gap-3 px-4">
            <Search
              size={16}
              className={cn(
                "flex-shrink-0 transition-colors duration-150",
                focused ? "text-[var(--ll-accent)]" : "text-[var(--ll-text-tertiary)]"
              )}
            />
            <input
              id="company-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              autoComplete="off"
              placeholder="Company or ticker"
              className={cn(
                "flex-1 border-none bg-transparent font-[var(--ll-font-ui)] text-sm text-[var(--ll-text-primary)] outline-none",
                "placeholder:text-[var(--ll-text-tertiary)]"
              )}
            />
            {query.trim().length > 0 ? (
              <kbd className="hidden items-center gap-1 rounded border border-[var(--ll-border-default)] px-2 py-0.5 font-mono text-[10px] text-[var(--ll-text-tertiary)] sm:flex">
                ↵ Select
              </kbd>
            ) : null}
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-sm text-[var(--ll-negative)]">{error}</p>
        ) : null}

        {loading ? <div className="skeleton mt-4 h-10 rounded-[var(--ll-radius-md)]" /> : null}

        <AnimatePresence>
          {showResults ? (
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-[calc(100%+4px)] z-30 overflow-hidden rounded-[var(--ll-radius-lg)] border border-[var(--ll-border-default)] bg-[var(--ll-bg-elevated)] shadow-[var(--ll-shadow-3)]"
            >
              {results.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => void openWorkspace(company)}
                  className="group flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors duration-100 hover:bg-[var(--ll-bg-overlay)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[var(--ll-radius-md)] border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)] text-xs font-bold text-[var(--ll-accent)]">
                      {company.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ll-text-primary)]">{company.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--ll-text-tertiary)]">
                        <span className="font-semibold tabular-nums text-[var(--ll-text-secondary)]">
                          {company.ticker}
                        </span>
                        <span> · </span>
                        {company.sector}
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-[var(--ll-text-tertiary)] transition-colors group-hover:text-[var(--ll-accent)]"
                  />
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!loading && query.trim().length > 0 && results.length === 0 && !error ? (
          <p className="mt-4 text-sm text-[var(--ll-text-tertiary)]">No companies match that query.</p>
        ) : null}
      </div>
    </div>
  );
}
