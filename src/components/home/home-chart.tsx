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
  ReferenceLine,
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

  // Find boundary between 2025 and 2026 labels
  const boundary2026Idx = chartData.findIndex(
    (d) => !d.label.startsWith("'25")
  );

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Kilometers per week
        </h3>
        <div className="flex gap-3 text-xs text-(--text-muted)">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-sm" style={{ background: colors.emerald.primary, opacity: 0.4 }} />
            km/week
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-0.5 w-4" style={{ background: colors.emerald.primary }} />
            4-wk gem.
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={45}
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            width={35}
            unit=" km"
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [`${v ?? 0} km`]} />
          {boundary2026Idx > 0 && (
            <ReferenceLine
              x={chartData[boundary2026Idx]?.label}
              stroke={colors.zinc.textLight}
              strokeDasharray="4 4"
              label={{ value: "2026", position: "top", fill: colors.zinc.text, fontSize: 10 }}
            />
          )}
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
