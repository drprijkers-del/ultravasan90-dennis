"use client";

import { useEffect, useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import type { StatsResponse } from "@/lib/types";
import { ChartSkeleton } from "@/components/skeleton";
import { WeeklyKmChart } from "@/components/progress/weekly-km-chart";
import { PaceHrChart } from "@/components/progress/pace-hr-chart";
import { WeekSummaryTable } from "@/components/progress/week-summary-table";
import { RaceProjection } from "@/components/progress/race-projection";
import { RaceReadinessCard } from "@/components/progress/race-readiness-card";

export default function ProgressPage() {
  const t = useT();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const longRunActivities = useMemo(
    () => (data?.activities ?? []).filter((a) => a.isLongRun),
    [data]
  );

  if (error) {
    return (
      <div className="card-elevated rounded-xl bg-(--bg-card) px-6 py-12 text-center text-(--danger)">
        {t("common.error")}: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <div className="skeleton mb-2 h-7 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary)">
          {t("progress.title")}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--text-secondary)">
          {t("progress.intro")}
        </p>
      </div>

      {data.mock && (
        <div className="rounded-lg bg-(--accent-2-light) px-4 py-3 text-sm text-(--accent-2-text)">
          {t("progress.demo")}
        </div>
      )}

      <RaceProjection longRuns={longRunActivities} allActivities={data.activities} />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-(--text-primary)">
            {t("progress.volume.title")}
          </h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            {t("progress.volume.desc")}
          </p>
        </div>
        <WeeklyKmChart data={data.weekly} />
        <WeekSummaryTable data={data.weekly} activities={data.activities} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-(--text-primary)">
            {t("progress.tempo.title")}
          </h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            {t("progress.tempo.desc")}
          </p>
        </div>
        <PaceHrChart data={longRunActivities} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-(--text-primary)">
            {t("progress.readiness.title")}
          </h2>
          <p className="mt-1 text-sm text-(--text-muted)">
            {t("progress.readiness.desc")}
          </p>
        </div>
        <RaceReadinessCard weekly={data.weekly} activities={data.activities} />
      </section>
    </div>
  );
}
