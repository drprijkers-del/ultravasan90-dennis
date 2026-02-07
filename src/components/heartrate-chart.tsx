"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface Props {
  data: Array<{ label: string; avgHeartrate: number }>;
}

export function HeartrateChart({ data }: Props) {
  const avg =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.avgHeartrate, 0) / data.length)
      : 0;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Gem. hartslag per week
        </h3>
        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
          avg {avg} bpm
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <YAxis
            tick={{ fontSize: 11 }}
            stroke="#a1a1aa"
            domain={["dataMin - 5", "dataMax + 5"]}
            unit=" bpm"
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(v: number | undefined) => [`${v ?? 0} bpm`, "Gem. HR"]}
          />
          <ReferenceLine y={avg} stroke="#fca5a5" strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="avgHeartrate"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#hrGradient)"
            name="HR"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
