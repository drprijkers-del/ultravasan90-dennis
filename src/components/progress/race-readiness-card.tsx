"use client";

import {
  classifyReadiness,
  longRunDurability,
  volumeTrend,
  paceStability,
  dataReliability,
  type ReadinessStatus,
} from "@/lib/race-readiness";
import { formatPace, formatDuration } from "@/lib/race-config";
import type { WeeklyData, ActivityData } from "@/lib/types";

interface Props {
  weekly: WeeklyData[];
  activities: ActivityData[];
}

const STATUS_CONFIG: Record<
  ReadinessStatus,
  { bg: string; dot: string; label: string }
> = {
  green: {
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    label: "Indicatief positief",
  },
  yellow: {
    bg: "bg-amber-50",
    dot: "bg-amber-500",
    label: "Aandachtspunten",
  },
  red: {
    bg: "bg-red-50",
    dot: "bg-red-500",
    label: "Onvoldoende data of consistentie",
  },
};

export function RaceReadinessCard({ weekly, activities }: Props) {
  const result = classifyReadiness(weekly, activities);
  const config = STATUS_CONFIG[result.status];
  const durability = longRunDurability(activities, 6);
  const trend = volumeTrend(weekly);
  const stability = paceStability(activities);
  const reliability = dataReliability(weekly, activities);

  // 4-week rolling avg
  const last4 = weekly.slice(-4);
  const rollingAvg =
    last4.length > 0
      ? last4.reduce((s, w) => s + w.totalKm, 0) / last4.length
      : 0;

  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      {/* Disclaimer top */}
      <div className="rounded-lg bg-(--bg-inset) p-3 text-xs leading-relaxed text-(--text-muted)">
        <strong className="text-(--text-secondary)">Wat dit is</strong>
        <br />
        Deze prognose beschrijft trends in trainingsbelasting en stabiliteit.
        Het voorspelt geen eindtijd en geen finishkans.
      </div>

      {/* Traffic light */}
      <div className={`mt-4 flex items-center gap-3 rounded-lg ${config.bg} p-4`}>
        <span className={`h-4 w-4 shrink-0 rounded-full ${config.dot}`} />
        <div>
          <p className="text-sm font-semibold text-(--text-primary)">
            {config.label}
          </p>
          <p className="mt-0.5 text-xs text-(--text-muted)">
            Status &ne; finishgarantie
          </p>
        </div>
      </div>

      {/* Reasons */}
      <ul className="mt-3 space-y-1.5">
        {result.reasons.map((reason, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-(--text-secondary)">
            <span className="mt-0.5 text-(--text-muted)">&bull;</span>
            {reason}
          </li>
        ))}
      </ul>

      {/* Metrics grid */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Volume Consistentie */}
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            4w gem. volume
          </p>
          <p className="mt-1 text-lg font-bold text-(--text-primary)">
            {rollingAvg.toFixed(0)} km/w
          </p>
          {trend !== null && (
            <p className={`mt-0.5 text-[10px] ${trend >= 0 ? "text-(--accent)" : "text-(--accent-orange)"}`}>
              {trend >= 0 ? "+" : ""}{trend.toFixed(0)}% vs vorige 4w
            </p>
          )}
        </div>

        {/* Long Run Durability */}
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Langste run (6w)
          </p>
          <p className="mt-1 text-lg font-bold text-(--text-primary)">
            {durability.maxDistanceKm > 0
              ? `${durability.maxDistanceKm.toFixed(1)} km`
              : "\u2014"}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {durability.maxDurationMin > 0
              ? `${formatDuration(durability.maxDurationMin)} time-on-feet`
              : "geen data"}
          </p>
        </div>

        {/* Pace Stability */}
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Tempo stabiliteit
          </p>
          <p className="mt-1 text-lg font-bold text-(--text-primary)">
            {stability.coefficientOfVariation !== null
              ? `${stability.coefficientOfVariation}%`
              : "\u2014"}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            variatie (lager = stabieler)
          </p>
        </div>

        {/* Data Reliability */}
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Data basis
          </p>
          <p className="mt-1 text-lg font-bold text-(--text-primary)">
            {reliability.weeksOfData}w
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {reliability.totalLongRuns} long runs &middot; {reliability.longRunsOver3h} &gt;3u
          </p>
        </div>

        {/* Avg long run pace */}
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Gem. duurloop tempo
          </p>
          <p className="mt-1 text-lg font-bold text-(--text-primary)">
            {stability.entries.length > 0
              ? formatPace(
                  stability.entries.reduce((s, e) => s + e.paceMinKm, 0) /
                    stability.entries.length
                )
              : "\u2014"}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            {stability.entries.length} duurlopen
          </p>
        </div>

        {/* Long runs this block */}
        <div className="rounded-lg bg-(--bg-inset) p-3">
          <p className="text-[10px] font-medium uppercase tracking-wider text-(--text-muted)">
            Runs &gt;2u (6w)
          </p>
          <p className="mt-1 text-lg font-bold text-(--text-primary)">
            {durability.count}
          </p>
          <p className="mt-0.5 text-[10px] text-(--text-muted)">
            geen race-simulatie
          </p>
        </div>
      </div>

      {/* Disclaimer bottom */}
      <div className="mt-5 rounded-lg bg-(--bg-inset) p-3 text-xs leading-relaxed text-(--text-muted)">
        <strong className="text-(--text-secondary)">Wat dit niet is</strong>
        <br />
        Dit vervangt geen ervaring, race-dag omstandigheden of mentale factoren.
        Ultramarathons worden niet gelopen in grafieken.
      </div>
    </div>
  );
}
