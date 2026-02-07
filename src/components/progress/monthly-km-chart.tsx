"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { colors, tooltipStyle, gridStroke } from "@/lib/theme";
import type { MonthlyData } from "@/lib/types";

interface Props {
  data: MonthlyData[];
}

export function MonthlyKmChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Kilometers per maand
        </h3>
        <span className="text-xs text-(--text-muted)">
          {data.reduce((s, m) => s + m.runCount, 0)} runs totaal
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: colors.slate.text }}
            stroke={gridStroke}
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.slate.text }}
            stroke={gridStroke}
            width={40}
            unit=" km"
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number | undefined) => [`${v ?? 0} km`, "km/maand"]}
          />
          <Bar dataKey="totalKm" radius={[6, 6, 0, 0]} name="km/maand">
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={
                  i === data.length - 1
                    ? colors.emerald.primary
                    : colors.emerald.light
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
