"use client";

import type { CompanyChart } from "@ledgerlens/types/chart";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ChartPanel({ chart }: { chart: CompanyChart }) {
  const primary = chart.series[0];
  const data =
    primary?.points.map((point) => ({
      name: point.label,
      value: point.value
    })) ?? [];

  return (
    <section className="panel" style={{ padding: 18 }}>
      <p className="muted mono" style={{ fontSize: 11, letterSpacing: "0.06em" }}>
        CHART CONTEXT
      </p>
      <h3 className="section-title" style={{ marginTop: 8 }}>
        {chart.title}
      </h3>
      <p className="muted" style={{ marginTop: 6 }}>
        {chart.subtitle}
      </p>
      <div style={{ width: "100%", height: 220, marginTop: 18 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <XAxis dataKey="name" stroke="var(--ll-text-tertiary)" tick={{ fontSize: 11 }} />
            <YAxis stroke="var(--ll-text-tertiary)" tick={{ fontSize: 11 }} width={32} />
            <Tooltip
              contentStyle={{
                background: "var(--ll-bg-overlay)",
                border: "1px solid var(--ll-border-default)",
                color: "var(--ll-text-primary)"
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
