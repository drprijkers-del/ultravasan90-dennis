"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { colors, tooltipStyle, gridStroke } from "@/lib/theme";
import { formatPace } from "@/lib/race-config";
import type { ActivityData } from "@/lib/types";

interface Props {
  data: ActivityData[];
}

export function PaceHrChart({ data }: Props) {
  // Only render if at least some HR data exists
  const hasHr = data.some((d) => d.heartrate != null && d.heartrate > 0);
  if (!hasHr) return null;

  const chartData = data.map((d) => ({
    date: d.date,
    paceMinKm: d.paceMinKm,
    heartrate: d.heartrate,
  }));

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-medium text-(--text-muted)">
        Pace vs. Hartslag (long runs)
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: colors.slate.text }}
            stroke={gridStroke}
            interval="preserveStartEnd"
          />

          {/* Left Y: Pace (reversed — lower = faster) */}
          <YAxis
            yAxisId="pace"
            orientation="left"
            tick={{ fontSize: 10, fill: colors.amber.muted }}
            stroke={colors.amber.muted}
            domain={["auto", "auto"]}
            reversed
            tickFormatter={formatPace}
            width={45}
            label={{
              value: "min/km",
              angle: -90,
              position: "insideLeft",
              fill: colors.amber.muted,
              fontSize: 10,
              offset: -5,
            }}
          />

          {/* Right Y: Heart rate */}
          <YAxis
            yAxisId="hr"
            orientation="right"
            tick={{ fontSize: 10, fill: colors.red.muted }}
            stroke={colors.red.muted}
            domain={["dataMin - 5", "dataMax + 5"]}
            width={45}
            label={{
              value: "bpm",
              angle: 90,
              position: "insideRight",
              fill: colors.red.muted,
              fontSize: 10,
              offset: -5,
            }}
          />

          <Tooltip
            contentStyle={tooltipStyle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => {
              if (value == null) return ["\u2014", name ?? ""];
              if (name === "Pace") return [formatPace(value as number), name];
              return [`${Math.round(value as number)} bpm`, name ?? ""];
            }}
            labelFormatter={(label) => `Datum: ${label}`}
          />

          <Legend
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />

          <Line
            yAxisId="pace"
            type="monotone"
            dataKey="paceMinKm"
            stroke={colors.amber.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.amber.primary }}
            name="Pace"
          />
          <Line
            yAxisId="hr"
            type="monotone"
            dataKey="heartrate"
            stroke={colors.red.primary}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.red.primary }}
            connectNulls
            name="Hartslag"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
