"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { colors, tooltipStyle, gridStroke } from "@/lib/theme";
import { formatPace } from "@/lib/race-config";
import type { LongRunData } from "@/lib/types";

interface Props {
  data: LongRunData[];
}

export function LongRunPaceChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-medium text-(--text-muted)">
        Long Run Pace Trend
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            domain={["auto", "auto"]}
            reversed
            tickFormatter={formatPace}
            width={45}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | undefined) =>
              value != null
                ? [formatPace(value), "Pace (min/km)"]
                : ["\u2014", "Pace (min/km)"]
            }
            labelFormatter={(label) => `Datum: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="paceMinKm"
            stroke={colors.amber.primary}
            strokeWidth={2}
            dot={{ r: 4, fill: colors.amber.primary }}
            name="Pace"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
