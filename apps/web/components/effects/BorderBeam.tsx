"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
  className?: string;
}

export function BorderBeam({
  size = 200,
  duration = 12,
  delay = 0,
  colorFrom = "transparent",
  colorTo = "var(--ll-accent)",
  className = ""
}: BorderBeamProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 rounded-[inherit]", className)}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--delay": `-${delay}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1px"
        } as CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "conic-gradient(from calc(var(--angle, 0deg)), var(--color-from) 0%, var(--color-to) 10%, var(--color-from) 20%)",
          animation: `border-beam-spin calc(var(--duration) * 1s) linear infinite`,
          animationDelay: "var(--delay)"
        }}
      />
    </div>
  );
}
