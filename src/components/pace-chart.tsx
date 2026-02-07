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

interface LongRunData {
  date: string;
  paceMinKm: number;
  distanceKm: number;
  name: string;
}

interface Props {
  data: LongRunData[];
}

function formatPace(value: number): string {
  const mins = Math.floor(value);
  const secs = Math.round((value - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PaceChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Long Run Pace Trend
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            stroke="#a1a1aa"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            stroke="#a1a1aa"
            domain={["auto", "auto"]}
            reversed
            tickFormatter={formatPace}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value: number | undefined) =>
              value != null
                ? [formatPace(value), "Pace (min/km)"]
                : ["—", "Pace (min/km)"]
            }
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="paceMinKm"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 4, fill: "#f59e0b" }}
            name="Pace"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
