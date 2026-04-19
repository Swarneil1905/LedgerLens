"use client";

import { Search } from "lucide-react";

export function CompanySearch() {
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
          defaultValue="Apple"
          style={{
            width: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            color: "var(--ll-text-primary)"
          }}
        />
      </div>
    </div>
  );
}
