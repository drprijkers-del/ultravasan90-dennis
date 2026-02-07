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

interface WeeklyData {
  label: string;
  totalKm: number;
}

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

export function HomeChart({ data }: Props) {
  const last16 = data.slice(-16);
  const chartData = withRollingAvg(last16);

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-medium text-(--text-muted)">
        Kilometers per week
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: colors.slate.text }}
            stroke={gridStroke}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.slate.text }}
            stroke={gridStroke}
            width={35}
          />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="totalKm"
            fill={colors.emerald.primary}
            opacity={0.4}
            radius={[4, 4, 0, 0]}
            name="km/week"
          />
          <Line
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
