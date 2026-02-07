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

interface WeeklyData {
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
}

interface Props {
  data: WeeklyData[];
}

function withRollingAvg(data: WeeklyData[]) {
  return data.map((d, i) => {
    const window = data.slice(Math.max(0, i - 3), i + 1);
    const avg = window.reduce((sum, w) => sum + w.totalKm, 0) / window.length;
    return { ...d, rollingAvg: Math.round(avg * 10) / 10 };
  });
}

export function WeeklyChart({ data }: Props) {
  const chartData = withRollingAvg(data);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Kilometers per week
        </h3>
        <span className="text-xs text-zinc-400">
          {data.length} weken
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <YAxis
            yAxisId="km"
            tick={{ fontSize: 11 }}
            stroke="#a1a1aa"
            unit=" km"
          />
          <YAxis
            yAxisId="runs"
            orientation="right"
            tick={{ fontSize: 11 }}
            stroke="#a1a1aa"
            domain={[0, "auto"]}
            hide
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 13,
            }}
          />
          <Bar
            yAxisId="km"
            dataKey="totalKm"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            opacity={0.3}
            name="km/week"
          />
          <Line
            yAxisId="km"
            type="monotone"
            dataKey="rollingAvg"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={false}
            name="4-wk gemiddelde"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
