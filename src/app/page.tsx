"use client";

import { useEffect, useState } from "react";
import { WeeklyChart } from "@/components/weekly-chart";
import { MonthlyChart } from "@/components/monthly-chart";
import { PaceChart } from "@/components/pace-chart";
import { HeartrateChart } from "@/components/heartrate-chart";
import { ElevationChart } from "@/components/elevation-chart";
import { ProgressBar } from "@/components/progress-bar";
import { StatCard } from "@/components/stat-card";
import { Countdown } from "@/components/countdown";
import { AthleteProfile } from "@/components/athlete-profile";
import { PersonalRecords } from "@/components/personal-records";
import { DataSource } from "@/components/data-source";
import { TrainingLocations } from "@/components/training-locations";
import { formatPace } from "@/lib/race-config";

interface WeeklyData {
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
  avgHeartrate: number;
  totalElevation: number;
}

interface MonthlyData {
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
  avgHeartrate: number;
}

interface LongRunData {
  date: string;
  name: string;
  distanceKm: number;
  paceMinKm: number;
}

interface YearBreakdown {
  year: number;
  totalKm: number;
  totalRuns: number;
}

interface LocationData {
  location: string;
  totalKm: number;
  totalRuns: number;
}

interface SummaryData {
  totalKm: number;
  targetKm: number;
  weeklyAvgKm: number;
  longestRunKm: number;
  totalRuns: number;
  weeksUntilRace: number;
  avgHeartrate: number;
  avgPaceMinKm: number;
  totalElevation: number;
  currentStreak: number;
  totalHours: number;
}

interface StatsData {
  mock: boolean;
  weekly: WeeklyData[];
  monthly: MonthlyData[];
  longRuns: LongRunData[];
  summary: SummaryData;
  yearBreakdown: YearBreakdown[];
  locations: LocationData[];
}

export default function Home() {
  const [data, setData] = useState<StatsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="py-12 text-center text-red-500">
        Fout bij laden: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      {data.mock && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Demo modus — Strava niet geconfigureerd. Dummy data wordt getoond.
        </div>
      )}

      {/* Athlete profile + Countdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AthleteProfile />
        </div>
        <Countdown />
      </div>

      {/* Total training overview + year breakdown */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950 lg:col-span-2">
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Totaal training Ultravasan
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {s.totalKm} km
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {s.totalRuns} runs &middot; {s.totalHours} uur &middot; {s.totalElevation} m stijging
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Sinds nov 2025 — start officieel trainingsplan Ultravasan
          </p>
          {data.yearBreakdown.length > 0 && (
            <div className="mt-3 flex gap-6">
              {data.yearBreakdown.map((y) => (
                <div key={y.year} className="rounded-lg bg-zinc-50 px-4 py-2 dark:bg-zinc-900">
                  <span className="text-xs font-medium text-zinc-400">{y.year === 2025 ? "2025 (vanaf nov)" : y.year}</span>
                  <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                    {y.totalKm} km
                  </p>
                  <span className="text-xs text-zinc-400">{y.totalRuns} runs</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <TrainingLocations data={data.locations} />
      </div>

      {/* Progress bar */}
      <ProgressBar
        current={s.totalKm}
        target={s.targetKm}
        label="Totaal training km \u2192 Race target"
      />

      {/* Key metrics row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Gem. km/week" value={`${s.weeklyAvgKm}`} accent />
        <StatCard
          title="Gem. pace"
          value={formatPace(s.avgPaceMinKm)}
          subtitle="min/km"
        />
        <StatCard
          title="Gem. hartslag"
          value={`${s.avgHeartrate}`}
          subtitle="bpm"
        />
        <StatCard
          title="Hoogtemeters"
          value={`${s.totalElevation}`}
          subtitle="m totaal"
        />
        <StatCard title="Langste run" value={`${s.longestRunKm} km`} />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard title="Trainingsuren" value={`${s.totalHours}u`} />
        <StatCard title="Trainingsweken" value={`${s.currentStreak} wk`} accent />
        <StatCard
          title="Weken tot race"
          value={s.weeksUntilRace}
          subtitle="15 aug 2026"
        />
        <StatCard title="Race afstand" value="92 km" subtitle="Ultravasan" />
      </div>

      {/* Volume charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyChart data={data.weekly} />
        <MonthlyChart data={data.monthly} />
      </div>

      {/* Physiology charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <HeartrateChart data={data.weekly} />
        <ElevationChart data={data.weekly} />
      </div>

      {/* Long run pace trend */}
      <PaceChart data={data.longRuns} />

      {/* PRs + Data source */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PersonalRecords />
        <DataSource />
      </div>
    </div>
  );
}
