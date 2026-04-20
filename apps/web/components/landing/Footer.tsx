import Link from "next/link";
import { TrendingUp } from "lucide-react";

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Workspace", href: "/work" }
  ],
  Data: [
    { label: "SEC EDGAR", href: "#data-sources" },
    { label: "FRED", href: "#data-sources" },
    { label: "News sources", href: "#data-sources" }
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" }
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" }
  ]
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--ll-border-hairline)] px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--ll-radius-sm)] border border-[var(--ll-accent-border)] bg-[var(--ll-accent-dim)]">
                <TrendingUp size={14} className="text-[var(--ll-accent)]" />
              </div>
              <span className="font-semibold tracking-[-0.02em] text-[var(--ll-text-primary)]">LedgerLens</span>
            </div>
            <p className="max-w-[180px] text-xs leading-relaxed text-[var(--ll-text-tertiary)]">
              AI analyst workspace for finance professionals.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--ll-text-tertiary)]">
                {group}
              </p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--ll-text-tertiary)] transition-colors duration-150 hover:text-[var(--ll-text-primary)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--ll-border-hairline)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--ll-text-tertiary)]">© 2026 LedgerLens. All rights reserved.</p>
          <p className="text-xs text-[var(--ll-text-tertiary)]">Not financial advice. For informational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}
