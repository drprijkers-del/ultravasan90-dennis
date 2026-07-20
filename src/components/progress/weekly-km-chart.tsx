"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import { colors, tooltipStyle, gridStroke } from "@/lib/theme";
import { TARGET_BAND } from "@/lib/race-config";
import { useT } from "@/lib/i18n";
import type { WeeklyData } from "@/lib/types";

interface Props {
  data: WeeklyData[];
}

interface ChartRow {
  label: string;
  totalKm: number;
  runCount: number;
  isAverage: boolean;
}

function buildChartData(data: WeeklyData[], avgLabel: string): ChartRow[] {
  if (data.length <= 4) {
    return data.map((d) => ({
      label: d.label,
      totalKm: Math.round(d.totalKm * 10) / 10,
      runCount: d.runCount,
      isAverage: false,
    }));
  }

  const older = data.slice(0, -4);
  const recent = data.slice(-4);

  const avgKm = older.reduce((s, w) => s + w.totalKm, 0) / older.length;
  const avgRuns = Math.round(older.reduce((s, w) => s + w.runCount, 0) / older.length);

  const rows: ChartRow[] = [
    {
      label: avgLabel,
      totalKm: Math.round(avgKm * 10) / 10,
      runCount: avgRuns,
      isAverage: true,
    },
    ...recent.map((d) => ({
      label: d.label,
      totalKm: Math.round(d.totalKm * 10) / 10,
      runCount: d.runCount,
      isAverage: false,
    })),
  ];

  return rows;
}

export function WeeklyKmChart({ data }: Props) {
  const t = useT();
  const olderCount = Math.max(0, data.length - 4);
  const chartData = buildChartData(
    data,
    t("progress.volume.avgWeeks", { n: olderCount })
  );

  return (
    <div className="rounded-xl card-elevated bg-(--bg-card) p-4 sm:p-5">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium text-(--text-secondary)">
          {t("progress.volume.kmPerWeek")}
        </h3>
        <span className="text-xs text-(--text-muted)">
          {data.length} {t("progress.volume.weeksTotal")}
        </span>
      </div>
      <p className="mb-4 text-[10px] text-(--text-muted)">
        {t("progress.volume.last4Detail")}{" "}
        {t("progress.volume.rangeNote", {
          min: TARGET_BAND.min,
          max: TARGET_BAND.max,
        })}
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: colors.zinc.text }}
            stroke={gridStroke}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: colors.zinc.text }}
            stroke={gridStroke}
            width={36}
            label={{
              value: "km",
              angle: -90,
              position: "insideLeft",
              fill: colors.zinc.text,
              fontSize: 10,
              offset: -5,
            }}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, _name: any, props: any) => {
              const row = props?.payload as ChartRow | undefined;
              const v = value as number;
              return [
                `${v.toFixed(1)} km · ${row?.runCount ?? 0} ${t("common.runs")}${row?.isAverage ? ` (${t("common.avg")})` : ""}`,
                "",
              ];
            }}
          />

          <ReferenceLine
            y={TARGET_BAND.min}
            stroke={colors.emerald.primary}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={TARGET_BAND.max}
            stroke={colors.emerald.primary}
            strokeWidth={1}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />

          <Bar dataKey="totalKm" radius={[4, 4, 0, 0]} name="km/week">
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isAverage ? colors.zinc.text : colors.emerald.bar}
                opacity={entry.isAverage ? 0.3 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
