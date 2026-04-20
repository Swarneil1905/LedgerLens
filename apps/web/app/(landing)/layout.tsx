import type { ReactNode } from "react";

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="noise-overlay relative min-h-screen overflow-x-hidden bg-[var(--ll-bg-base)]">{children}</div>
  );
}
