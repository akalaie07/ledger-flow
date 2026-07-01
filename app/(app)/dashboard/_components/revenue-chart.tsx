"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { formatEur } from "@/lib/utils";

type Point = { label: string; value: number };

export function RevenueChart({ data }: { data: Point[] }) {
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="h-64 w-full">
      {!hasData ? (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Noch keine Zahlungen im gewählten Zeitraum.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={36}
            />
            <YAxis
              tick={{ fill: "var(--faint)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 13,
                color: "var(--foreground)",
                boxShadow: "var(--shadow-lift)",
              }}
              labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
              formatter={(value: unknown) => [formatEur(Number(value)), "Umsatz"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#revfill)"
              dot={false}
              activeDot={{ r: 4, fill: "var(--primary)", stroke: "var(--surface)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
