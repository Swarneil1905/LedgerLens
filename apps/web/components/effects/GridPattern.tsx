"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

interface GridPatternProps {
  dotColor?: string;
  dotSize?: number;
  gap?: number;
  className?: string;
  fade?: "center" | "edges" | "none";
}

export function GridPattern({
  dotColor = "rgba(255,255,255,0.15)",
  dotSize = 1,
  gap = 28,
  className = "",
  fade = "edges"
}: GridPatternProps) {
  const uid = useId().replace(/:/g, "");
  const patternId = `dot-grid-${uid}`;
  const fadeId = `dot-fade-${uid}`;
  const maskId = `dot-mask-${uid}`;

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            x="0"
            y="0"
            width={gap}
            height={gap}
            patternUnits="userSpaceOnUse"
          >
            <circle cx={gap / 2} cy={gap / 2} r={dotSize} fill={dotColor} />
          </pattern>
          {fade !== "none" ? (
            <radialGradient id={fadeId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity={fade === "center" ? "1" : "0"} />
              <stop offset="100%" stopColor="white" stopOpacity={fade === "center" ? "0" : "1"} />
            </radialGradient>
          ) : null}
          {fade !== "none" ? (
            <mask id={maskId}>
              <rect width="100%" height="100%" fill={`url(#${fadeId})`} />
            </mask>
          ) : null}
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${patternId})`}
          mask={fade !== "none" ? `url(#${maskId})` : undefined}
        />
      </svg>
    </div>
  );
}
