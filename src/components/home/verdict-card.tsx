"use client";

import Link from "next/link";
import { classifyReadiness, projectFinishTime } from "@/lib/race-readiness";
import { formatClock, formatPace } from "@/lib/race-config";
import { useT } from "@/lib/i18n";
import type { WeeklyData, ActivityData } from "@/lib/types";

interface Props {
  weekly: WeeklyData[];
  activities: ActivityData[];
}

export function VerdictCard({ weekly, activities }: Props) {
  const t = useT();
  const projection = projectFinishTime(activities);
  const readiness = classifyReadiness(weekly, activities);

  // The headline answers one question: am I on route for the goal?
  const onRoute = projection.hasData && projection.isOnTarget;
  const banner = !projection.hasData
    ? { dot: "bg-zinc-400", bg: "bg-(--bg-inset)", label: t("home.verdict.noData") }
    : onRoute
      ? { dot: "bg-emerald-500", bg: "bg-emerald-50", label: t("home.verdict.onTrack") }
      : { dot: "bg-(--accent-orange)", bg: "bg-(--accent-orange-light)", label: t("home.verdict.offTrack") };

  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-5 sm:p-6">
      <h2 className="text-sm font-medium text-(--text-secondary)">
        {t("home.verdict.title")}
      </h2>

      {/* Verdict banner */}
      <div className={`mt-3 flex items-center gap-3 rounded-lg ${banner.bg} p-4`}>
        <span className={`h-4 w-4 shrink-0 rounded-full ${banner.dot}`} />
        <p className="text-base font-semibold text-(--text-primary)">
          {banner.label}
        </p>
      </div>

      {/* Projected finish time */}
      {projection.hasData && (
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
              {t("home.verdict.estFinish")}
            </p>
            <p
              className={`mt-1 text-4xl font-bold ${
                projection.isOnTarget ? "text-(--accent)" : "text-(--accent-orange)"
              }`}
            >
              {formatClock(projection.projectedTotalMin)}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              {projection.isOnTarget
                ? `${Math.round(Math.abs(projection.diffMin))} ${t("home.verdict.belowTarget")}`
                : `${Math.round(projection.diffMin)} ${t("home.verdict.aboveTarget")}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
              {t("home.verdict.avgPace")}
            </p>
            <p className="mt-1 text-2xl font-bold text-(--text-primary)">
              {formatPace(projection.avgPace)}
            </p>
            <p className="mt-1 text-xs text-(--text-muted)">
              {t("home.verdict.basedOn")}
            </p>
          </div>
        </div>
      )}

      {/* What can I do to get stronger */}
      {readiness.reasons.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("home.verdict.whatNow")}
          </p>
          <ul className="mt-2 space-y-1.5">
            {readiness.reasons.map((reason, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-(--text-secondary)"
              >
                <span className="mt-0.5 text-(--text-muted)">&bull;</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link
        href="/progress"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-(--accent-orange) transition-opacity hover:opacity-80"
      >
        {t("home.verdict.fullAnalysis")}
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
