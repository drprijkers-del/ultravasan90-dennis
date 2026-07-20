"use client";

import { useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { colors, tooltipStyle, gridStroke } from "@/lib/theme";
import { formatPace, RACE_DISTANCE_KM } from "@/lib/race-config";
import { useT, useI18n } from "@/lib/i18n";
import type { ActivityData } from "@/lib/types";

const dateLocale = (l: string) => (l === "sv" ? "sv-SE" : "nl-NL");

// Color-blind safe pair: blue + orange
const PACE_COLOR = "#2563eb"; // blue-600
const HR_COLOR = "#d96c2c"; // burnt orange
const TARGET_COLOR = "#059669"; // emerald-600

// Sub-10h target: (10h - 35min aid) / 92km ≈ 6:09 min/km
const TARGET_PACE = (10 * 60 - 35) / RACE_DISTANCE_KM;

const RECENT_WEEKS = 10;

interface Props {
  data: ActivityData[];
}

function getStatus(pace: number, target: number): { key: string; color: string } {
  const diff = pace - target;
  if (diff <= -0.15) return { key: "faster", color: "text-(--accent)" };
  if (diff <= 0.15) return { key: "onTrack", color: "text-(--accent)" };
  if (diff <= 0.5) return { key: "slightlyAbove", color: "text-(--accent-2-text)" };
  return { key: "aboveTarget", color: "text-(--danger)" };
}

function RunRow({ d, hasHr }: { d: ActivityData; hasHr: boolean }) {
  const t = useT();
  const { locale } = useI18n();
  const dateStr = new Date(d.date).toLocaleDateString(dateLocale(locale), {
    day: "numeric",
    month: "short",
  });
  const status = getStatus(d.paceMinKm, TARGET_PACE);

  return (
    <tr className="hover:bg-(--bg-card-hover) transition-colors">
      <td className="px-4 py-2.5 text-xs text-(--text-secondary) sm:px-5">
        {dateStr}
      </td>
      <td className="px-2 py-2.5 font-mono text-xs text-(--text-primary)">
        {d.distanceKm.toFixed(1)} km
      </td>
      <td className="px-2 py-2.5 text-right font-mono text-xs font-semibold text-(--text-primary)">
        {formatPace(d.paceMinKm)}
      </td>
      <td className="px-2 py-2.5 text-right font-mono text-xs text-(--text-muted)">
        {formatPace(TARGET_PACE)}
      </td>
      {hasHr && (
        <td className="hidden px-2 py-2.5 text-right font-mono text-xs text-(--text-muted) sm:table-cell">
          {d.heartrate ? `${Math.round(d.heartrate)}` : "\u2014"}
        </td>
      )}
      <td className={`px-4 py-2.5 text-right text-xs font-medium sm:px-5 ${status.color}`}>
        {t(`progress.tempo.${status.key}`)}
      </td>
    </tr>
  );
}

export function PaceHrChart({ data }: Props) {
  const t = useT();
  const { locale } = useI18n();
  const [showOlder, setShowOlder] = useState(false);
  const hasHr = data.some((d) => d.heartrate != null && d.heartrate > 0);
  const paceLabel = t("progress.tempo.pace");
  const hrLabel = t("progress.tempo.hrFull");
  if (data.length === 0) return null;

  // Sort newest first for the table
  const sorted = [...data].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Split into recent (last 10 weeks) and older
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENT_WEEKS * 7);

  const recent = sorted.filter((d) => new Date(d.date) >= cutoff);
  const older = sorted.filter((d) => new Date(d.date) < cutoff);

  // Chart data in chronological order (oldest left, newest right)
  const chartData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((d) => ({
      date: new Date(d.date).toLocaleDateString(dateLocale(locale), { day: "numeric", month: "short" }),
      paceMinKm: d.paceMinKm,
      heartrate: d.heartrate,
    }));

  return (
    <div className="space-y-4">
      {/* Realization vs Target Table */}
      <div className="rounded-xl card-elevated bg-(--bg-card) overflow-hidden">
        <div className="px-4 py-3 sm:px-5">
          <h3 className="text-sm font-medium text-(--text-secondary)">
            {t("progress.tempo.vsTarget")}
          </h3>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {t("progress.tempo.targetPace")}: {formatPace(TARGET_PACE)}/km.{" "}
            {t("progress.tempo.lowerIsFaster")}.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-(--border-primary) bg-(--bg-inset) text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
                <th className="px-4 py-2 text-left sm:px-5">{t("progress.tempo.date")}</th>
                <th className="px-2 py-2 text-left">{t("progress.tempo.distance")}</th>
                <th className="px-2 py-2 text-right">{t("progress.tempo.pace")}</th>
                <th className="px-2 py-2 text-right">{t("progress.tempo.target")}</th>
                {hasHr && <th className="hidden px-2 py-2 text-right sm:table-cell">{t("progress.tempo.hr")}</th>}
                <th className="px-4 py-2 text-right sm:px-5">{t("progress.tempo.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border-primary)">
              {recent.map((d) => (
                <RunRow key={d.id} d={d} hasHr={hasHr} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Older runs collapsible */}
        {older.length > 0 && (
          <div className="border-t border-(--border-primary)">
            <button
              onClick={() => setShowOlder(!showOlder)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-(--text-muted) hover:text-(--text-secondary) transition-colors sm:px-5"
            >
              <svg
                className={`h-3.5 w-3.5 transition-transform ${showOlder ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {t("progress.tempo.olderRuns")} ({older.length})
            </button>

            {showOlder && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-(--border-primary)">
                    {older.map((d) => (
                      <RunRow key={d.id} d={d} hasHr={hasHr} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart still available for visual trend */}
      {hasHr && (
        <div className="rounded-xl card-elevated bg-(--bg-card) p-4 sm:p-5">
          <h3 className="mb-1 text-sm font-medium text-(--text-secondary)">
            {t("progress.tempo.trendTitle")}
          </h3>
          <p className="mb-4 text-[10px] text-(--text-muted)">
            {t("progress.tempo.trendDesc", { pace: formatPace(TARGET_PACE) })}
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: colors.zinc.text }}
                stroke={gridStroke}
                interval="preserveStartEnd"
              />

              <YAxis
                yAxisId="pace"
                orientation="left"
                tick={{ fontSize: 9, fill: PACE_COLOR }}
                stroke={PACE_COLOR}
                domain={["auto", "auto"]}
                reversed
                tickFormatter={formatPace}
                width={40}
              />

              <YAxis
                yAxisId="hr"
                orientation="right"
                tick={{ fontSize: 9, fill: HR_COLOR }}
                stroke={HR_COLOR}
                domain={["dataMin - 5", "dataMax + 5"]}
                width={35}
              />

              <Tooltip
                contentStyle={tooltipStyle}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => {
                  if (value == null) return ["\u2014", name ?? ""];
                  if (name === paceLabel) return [formatPace(value as number), name];
                  return [`${Math.round(value as number)} bpm`, name ?? ""];
                }}
                labelFormatter={(label) => `${t("progress.tempo.date")}: ${label}`}
              />

              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />

              <Line
                yAxisId="pace"
                type="monotone"
                dataKey="paceMinKm"
                stroke={PACE_COLOR}
                strokeWidth={2}
                dot={{ r: 3, fill: PACE_COLOR }}
                name={paceLabel}
              />
              <Line
                yAxisId="hr"
                type="monotone"
                dataKey="heartrate"
                stroke={HR_COLOR}
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={{ r: 3, fill: HR_COLOR }}
                connectNulls
                name={hrLabel}
              />

              <ReferenceLine
                yAxisId="pace"
                y={TARGET_PACE}
                stroke={TARGET_COLOR}
                strokeWidth={2}
                strokeDasharray="8 4"
                label={{
                  value: `${t("progress.tempo.target")}: ${formatPace(TARGET_PACE)}`,
                  position: "right",
                  fill: TARGET_COLOR,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
