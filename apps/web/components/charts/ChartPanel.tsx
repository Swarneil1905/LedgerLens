"use client";

import type { CompanyChart } from "@ledgerlens/types/chart";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const axisTick = {
  fill: "var(--ll-text-tertiary)",
  fontSize: 10,
  fontFamily: "var(--ll-font-mono)"
};

export function ChartPanel({ chart }: { chart: CompanyChart }) {
  const primary = chart.series[0];
  const data =
    primary?.points.map((point) => ({
      name: point.label,
      value: point.value
    })) ?? [];

  return (
    <section
      style={{
        border: "1px solid var(--ll-border-default)",
        borderRadius: "var(--ll-radius-lg)",
        background: "var(--ll-bg-elevated)",
        boxShadow: "var(--ll-shadow-1)",
        padding: "16px 14px 18px"
      }}
    >
      <p className="ll-section-label" style={{ marginBottom: 6 }}>
        Chart context
      </p>
      <h3
        style={{
          margin: 0,
          fontSize: "var(--ll-text-xl)",
          lineHeight: "var(--ll-text-xl-lh)",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          color: "var(--ll-text-primary)"
        }}
      >
        {chart.title}
      </h3>
      <p
        style={{
          margin: "6px 0 0",
          fontSize: "var(--ll-text-sm)",
          lineHeight: "var(--ll-text-sm-lh)",
          color: "var(--ll-text-secondary)"
        }}
      >
        {chart.subtitle}
      </p>
      <div style={{ width: "100%", height: 220, marginTop: 16 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--ll-border-hairline)" vertical={false} strokeDasharray="3 6" />
            <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "var(--ll-border-default)" }} tickLine={false} />
            <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              contentStyle={{
                background: "var(--ll-bg-overlay)",
                border: "1px solid var(--ll-border-default)",
                borderRadius: "var(--ll-radius-sm)",
                color: "var(--ll-text-primary)",
                boxShadow: "var(--ll-shadow-2)",
                fontFamily: "var(--ll-font-mono)",
                fontSize: "var(--ll-text-xs)"
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={primary?.color ?? "var(--ll-accent)"}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
