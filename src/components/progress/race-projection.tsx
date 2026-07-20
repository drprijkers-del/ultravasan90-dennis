"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { formatPace, RACE_DISTANCE_KM } from "@/lib/race-config";
import {
  projectFinishTime,
  projectFinishFrom,
  AID_STATION_MIN,
  COURSE_ASCENT_M,
  TARGET_PACE,
  TARGET_TOTAL_MIN,
} from "@/lib/race-readiness";
import { tooltipStyle, gridStroke, colors } from "@/lib/theme";
import { useT } from "@/lib/i18n";
import type { ActivityData } from "@/lib/types";

interface Props {
  longRuns: ActivityData[];
  allActivities: ActivityData[];
}

const RACE_KM = RACE_DISTANCE_KM; // 92

function computeProjectionTimeline(longRuns: ActivityData[]) {
  if (longRuns.length < 3) return [];
  const timeline: Array<{ date: string; projectedMin: number; label: string }> = [];

  // Replay the same projection the headline uses, as it would have read on the
  // date of each long run — so the chart and the headline can't disagree.
  for (let i = 2; i < longRuns.length; i++) {
    const asOf = new Date(longRuns[i].date);
    const projection = projectFinishFrom(longRuns.slice(0, i + 1), asOf);
    if (!projection.hasData) continue;
    const projectedTotal = projection.projectedTotalMin;
    timeline.push({
      date: asOf.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      projectedMin: Math.round(projectedTotal),
      label: `${Math.floor(projectedTotal / 60)}:${Math.round(projectedTotal % 60).toString().padStart(2, "0")}`,
    });
  }

  return timeline;
}

function formatTime(min: number) {
  // Round to whole minutes first, otherwise 59.7 -> "10:60" instead of "11:00".
  const total = Math.round(min);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function RaceProjection({ longRuns, allActivities }: Props) {
  const t = useT();
  const [showChart, setShowChart] = useState(false);

  // Ensure chronological order (oldest first)
  const sorted = [...longRuns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Shared projection: average pace of the last 5 long runs across the race.
  const projection = projectFinishTime(longRuns);

  if (!projection.hasData) {
    return null;
  }

  const avgLongRunPace = projection.avgPace;

  // Longest long run (within this training cycle)
  const longestRun = Math.max(...sorted.map((a) => a.distanceKm));

  const projectedTotalMin = projection.projectedTotalMin;
  const projectedHours = Math.floor(projectedTotalMin / 60);
  const projectedMins = Math.round(projectedTotalMin % 60);

  // How much faster/slower than target
  const diffMin = projection.diffMin;
  const isOnTarget = projection.isOnTarget;

  // Percentage of race distance covered by longest run
  const longestPct = Math.round((longestRun / RACE_KM) * 100);

  // Weekly volume assessment
  const last4Weeks = allActivities.filter((a) => {
    const d = new Date(a.date);
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
    return d >= fourWeeksAgo;
  });
  const weeklyKm4w = last4Weeks.reduce((s, a) => s + a.distanceKm, 0) / 4;

  // Projection timeline (uses sorted = chronological order)
  const timeline = computeProjectionTimeline(sorted);

  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      <h3 className="text-sm font-semibold text-(--accent-orange)">
        {t("progress.projection.title")}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-(--text-muted)">
        {t("progress.projection.intro", {
          basis: projection.basisKm.toFixed(1),
          race: RACE_KM,
          ascent: COURSE_ASCENT_M,
          aid: AID_STATION_MIN,
          low: formatTime(projection.lowMin),
          high: formatTime(projection.highMin),
        })}
      </p>

      {projection.basisEffortPct !== null && (
        <p className="mt-2 rounded-lg bg-(--bg-inset) px-3 py-2 text-[11px] leading-relaxed text-(--text-muted)">
          <span className="font-medium text-(--text-secondary)">
            {t("progress.projection.effortLabel")}
          </span>{" "}
          {t("progress.projection.effortStat", {
            basis: projection.basisKm.toFixed(1),
            hr: projection.basisHr ?? 0,
            pct: projection.basisEffortPct,
          })}{" "}
          {projection.basisEffortPct <= 78
            ? t("progress.projection.effortEasy")
            : projection.basisEffortPct >= 85
              ? t("progress.projection.effortHard")
              : t("progress.projection.effortModerate")}
        </p>
      )}

      {/* Projection grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("progress.projection.estFinish")}
          </p>
          <p className={`mt-1 text-xl font-bold ${isOnTarget ? "text-(--accent)" : "text-(--accent-orange)"}`}>
            {projectedHours}:{projectedMins.toString().padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {isOnTarget
              ? `${Math.abs(Math.round(diffMin))} ${t("progress.projection.belowTarget")}`
              : `${Math.round(diffMin)} ${t("progress.projection.aboveTarget")}`}
          </p>
        </div>

        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("progress.projection.avgPace")}
          </p>
          <p className="mt-1 text-xl font-bold text-(--text-primary)">
            {formatPace(avgLongRunPace)}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {t("progress.projection.paceGoal", { pace: formatPace(TARGET_PACE) })}
          </p>
        </div>

        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("progress.projection.longestRun")}
          </p>
          <p className="mt-1 text-xl font-bold text-(--text-primary)">
            {longestRun.toFixed(0)} km
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {t("progress.projection.pctOfRace", { pct: longestPct })}
          </p>
        </div>

        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("progress.projection.volume4w")}
          </p>
          <p className="mt-1 text-xl font-bold text-(--text-primary)">
            {weeklyKm4w.toFixed(0)} {t("progress.projection.perWeek")}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {t("progress.projection.volumeBand")}
          </p>
        </div>
      </div>

      {/* Projection growth over time — collapsed by default. Mounted only when
          open: Recharts measures 0x0 inside a hidden container and renders blank. */}
      {timeline.length >= 3 && (
        <div className="mt-5">
          <button
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-2 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary)"
          >
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showChart ? "rotate-90" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {t("progress.projection.projectionTrend")}
          </button>
          {showChart && (
            <>
          <p className="mt-2 mb-3 text-[10px] text-(--text-muted)">
            {t("progress.projection.projectionHelp")}
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: colors.zinc.text }}
                stroke={gridStroke}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: colors.zinc.text }}
                stroke={gridStroke}
                width={40}
                domain={["dataMin - 15", "dataMax + 15"]}
                tickFormatter={formatTime}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [formatTime(value as number), t("progress.projection.tooltip")]}
              />
              <ReferenceLine
                y={TARGET_TOTAL_MIN}
                stroke={colors.emerald.primary}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: t("progress.projection.subTen"),
                  position: "right",
                  fill: colors.emerald.primary,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Line
                type="monotone"
                dataKey="projectedMin"
                stroke={colors.orange.primary}
                strokeWidth={2.5}
                dot={{ r: 3, fill: colors.orange.primary }}
              />
            </LineChart>
          </ResponsiveContainer>
            </>
          )}
        </div>
      )}

      {/* Explanation */}
      <details className="mt-4">
        <summary className="flex items-center gap-2 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary) cursor-pointer">
          <svg className="h-3.5 w-3.5 transition-transform [[open]>&]:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t("progress.projection.howToRead")}
        </summary>
        <div className="mt-2 rounded-lg bg-(--bg-inset) p-3">
          <p className="text-xs leading-relaxed text-(--text-muted)">
            {t("progress.projection.explain1", {
              basis: projection.basisKm.toFixed(1),
              race: RACE_KM,
              ascent: COURSE_ASCENT_M,
              aid: AID_STATION_MIN,
              pace: formatPace(TARGET_PACE),
            })}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-(--text-muted)">
            {t("progress.projection.explain2", {
              low: formatTime(projection.lowMin),
              high: formatTime(projection.highMin),
            })}
          </p>
        </div>
      </details>
    </div>
  );
}
