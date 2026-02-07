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

interface MonthlyData {
  label: string;
  totalKm: number;
  runCount: number;
}

interface Props {
  data: MonthlyData[];
}

export function MonthlyChart({ data }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Kilometers per maand
        </h3>
        <span className="text-xs text-zinc-400">
          {data.reduce((s, m) => s + m.runCount, 0)} runs totaal
        </span>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
          <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" unit=" km" />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(v: number | undefined) => [`${v ?? 0} km`, "km/maand"]}
          />
          <Bar dataKey="totalKm" radius={[6, 6, 0, 0]} name="km/maand">
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={i === data.length - 1 ? "#10b981" : "#6ee7b7"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
