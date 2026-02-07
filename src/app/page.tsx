"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "@/components/home/hero-section";
import { StatusBadge } from "@/components/home/status-badge";
import { WeekCard } from "@/components/home/week-card";
import { LongRunCard } from "@/components/home/longrun-card";
import { ConsistencyCard } from "@/components/home/consistency-card";
import { TotalCard } from "@/components/home/total-card";
import { HomeChart } from "@/components/home/home-chart";
import { CTAButtons } from "@/components/home/cta-buttons";
import { HeroSkeleton, CardSkeleton, ChartSkeleton } from "@/components/skeleton";
import type { StatsResponse } from "@/lib/types";

export default function Home() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) px-6 py-12 text-center text-(--danger)">
        Fout bij laden: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <HeroSkeleton />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  const h = data.homeData;
  const s = data.summary;

  // Compute avg runs/week from weekly data
  const avgRunsPerWeek =
    data.weekly.length > 0
      ? data.weekly.reduce((sum, w) => sum + w.runCount, 0) / data.weekly.length
      : 0;

  // Previous week km + average km/week
  const prevWeekKm =
    data.weekly.length >= 2 ? data.weekly[data.weekly.length - 2].totalKm : null;
  const avgKmPerWeek =
    data.weekly.length > 0
      ? data.weekly.reduce((sum, w) => sum + w.totalKm, 0) / data.weekly.length
      : 0;

  return (
    <div className="space-y-5">
      {data.mock && (
        <div className="rounded-lg bg-(--accent-2-light) px-4 py-3 text-sm text-(--accent-2-text)">
          Demo modus — Strava niet geconfigureerd. Dummy data wordt getoond.
        </div>
      )}

      <HeroSection
        totalKm={s.totalKm}
        totalRuns={s.totalRuns}
        totalHours={s.totalHours}
      />

      <StatusBadge status={h.status} rollingAvgKm={h.rollingAvgKm} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <WeekCard
          km={h.currentWeek.km}
          runs={h.currentWeek.runs}
          hours={h.currentWeek.hours}
          prevWeekKm={prevWeekKm}
          avgKmPerWeek={avgKmPerWeek}
        />
        <LongRunCard lastLongRun={h.lastLongRun} />
        <ConsistencyCard streak={h.consistencyStreak} avgRunsPerWeek={avgRunsPerWeek} />
        <TotalCard
          km={h.totalSinceNov.km}
          pctEarth={h.totalSinceNov.pctEarth}
          totalRuns={s.totalRuns}
          totalElevation={s.totalElevation}
        />
      </div>

      <HomeChart data={data.weekly} />

      <CTAButtons />
    </div>
  );
}
