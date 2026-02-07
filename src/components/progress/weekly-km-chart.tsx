"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { colors, tooltipStyle, gridStroke } from "@/lib/theme";
import type { WeeklyData } from "@/lib/types";

interface Props {
  data: WeeklyData[];
}

function withRollingAvg(data: WeeklyData[]) {
  return data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 3), i + 1);
    const avg = window.reduce((s, w) => s + w.totalKm, 0) / window.length;
    return { ...d, rollingAvg: Math.round(avg * 10) / 10 };
  });
}

export function WeeklyKmChart({ data }: Props) {
  const chartData = withRollingAvg(data);

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Kilometers per week
        </h3>
        <span className="text-xs text-(--text-muted)">
          {data.length} weken
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            interval="preserveStartEnd"
          />
          <YAxis
            yAxisId="km"
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            width={40}
            unit=" km"
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            yAxisId="km"
            dataKey="totalKm"
            fill={colors.emerald.bar}
            opacity={0.4}
            radius={[4, 4, 0, 0]}
            name="km/week"
          />
          <Line
            yAxisId="km"
            type="monotone"
            dataKey="rollingAvg"
            stroke={colors.emerald.primary}
            strokeWidth={2.5}
            dot={false}
            name="4-wk gem."
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
