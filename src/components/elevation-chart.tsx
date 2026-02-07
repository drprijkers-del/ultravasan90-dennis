"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  data: Array<{ label: string; totalElevation: number }>;
}

export function ElevationChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Hoogtemeters per week
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" unit=" m" />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(v: number | undefined) => [`${v ?? 0} m`, "Stijging"]}
          />
          <Bar
            dataKey="totalElevation"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            name="Stijging"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
