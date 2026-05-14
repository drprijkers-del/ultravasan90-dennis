"use client";

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
  AID_STATION_MIN,
  TARGET_PACE,
  TARGET_TOTAL_MIN,
} from "@/lib/race-readiness";
import { tooltipStyle, gridStroke, colors } from "@/lib/theme";
import type { ActivityData } from "@/lib/types";

interface Props {
  longRuns: ActivityData[];
  allActivities: ActivityData[];
}

const RACE_KM = RACE_DISTANCE_KM; // 92

function computeProjectionTimeline(longRuns: ActivityData[]) {
  if (longRuns.length < 3) return [];
  const timeline: Array<{ date: string; projectedMin: number; label: string }> = [];

  for (let i = 2; i < longRuns.length; i++) {
    const window = longRuns.slice(Math.max(0, i - 4), i + 1);
    const avgPace = window.reduce((s, a) => s + a.paceMinKm, 0) / window.length;
    const projectedMoving = avgPace * RACE_KM;
    const projectedTotal = projectedMoving + AID_STATION_MIN;
    const d = new Date(longRuns[i].date);
    timeline.push({
      date: d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" }),
      projectedMin: Math.round(projectedTotal),
      label: `${Math.floor(projectedTotal / 60)}:${Math.round(projectedTotal % 60).toString().padStart(2, "0")}`,
    });
  }

  return timeline;
}

function formatTime(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function RaceProjection({ longRuns, allActivities }: Props) {
  // Ensure chronological order (oldest first)
  const sorted = [...longRuns].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Shared projection: average pace of the last 5 long runs across the race.
  const projection = projectFinishTime(longRuns);

  if (!projection.hasData) {
    return null;
  }

  const recentLongRunCount = projection.runsUsed;
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
        Race Prognose &mdash; Sub 10 uur
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-(--text-muted)">
        Op basis van de laatste {recentLongRunCount} lange duurlopen.
        Uitgangspunt: {RACE_KM} km + ~{AID_STATION_MIN} min pauzetijd bij checkpoints.
      </p>

      {/* Projection grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Geschatte finishtijd
          </p>
          <p className={`mt-1 text-xl font-bold ${isOnTarget ? "text-(--accent)" : "text-(--accent-orange)"}`}>
            {projectedHours}:{projectedMins.toString().padStart(2, "0")}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {isOnTarget
              ? `${Math.abs(Math.round(diffMin))} min onder doel`
              : `${Math.round(diffMin)} min boven doel`}
          </p>
        </div>

        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Gem. duurloop tempo
          </p>
          <p className="mt-1 text-xl font-bold text-(--text-primary)">
            {formatPace(avgLongRunPace)}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            doel: {formatPace(TARGET_PACE)}/km
          </p>
        </div>

        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Langste duurloop
          </p>
          <p className="mt-1 text-xl font-bold text-(--text-primary)">
            {longestRun.toFixed(0)} km
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {longestPct}% van raceafstand
          </p>
        </div>

        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Volume (4w gem.)
          </p>
          <p className="mt-1 text-xl font-bold text-(--text-primary)">
            {weeklyKm4w.toFixed(0)} km/w
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            doel: 45&ndash;65 km/w
          </p>
        </div>
      </div>

      {/* Projection growth over time */}
      {timeline.length >= 3 && (
        <div className="mt-5">
          <h4 className="text-xs font-medium text-(--text-muted)">
            Prognose-ontwikkeling
          </h4>
          <p className="mt-0.5 mb-3 text-[10px] text-(--text-muted)">
            Hoe de geschatte finishtijd zich ontwikkelt naarmate je meer duurlopen doet. Lijn onder de groene streep = sub 10 uur.
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
                formatter={(value: any) => [formatTime(value as number), "Prognose"]}
              />
              <ReferenceLine
                y={TARGET_TOTAL_MIN}
                stroke={colors.emerald.primary}
                strokeWidth={2}
                strokeDasharray="6 3"
                label={{
                  value: "Sub 10h",
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
        </div>
      )}

      {/* Explanation */}
      <details className="mt-4">
        <summary className="flex items-center gap-2 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary) cursor-pointer">
          <svg className="h-3.5 w-3.5 transition-transform [[open]>&]:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Hoe lees je dit?
        </summary>
        <div className="mt-2 rounded-lg bg-(--bg-inset) p-3">
          <p className="text-xs leading-relaxed text-(--text-muted)">
            De geschatte finishtijd is berekend op basis van het gemiddelde tempo van
            je laatste {recentLongRunCount} lange duurlopen ({formatPace(avgLongRunPace)}/km),
            vermenigvuldigd met {RACE_KM} km, plus ~{AID_STATION_MIN} minuten
            voor aid stations. Voor sub 10 uur heb je een moving pace nodig
            van {formatPace(TARGET_PACE)}/km of sneller. Let op: sommige lange duurlopen
            bevatten threshold-stukken die het gemiddelde tempo vertekenen &mdash; het
            werkelijke duurtempo ligt iets hoger.
          </p>
        </div>
      </details>
    </div>
  );
}
