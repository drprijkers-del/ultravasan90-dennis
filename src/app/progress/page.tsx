"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  StatsResponse,
  WeeklyData,
  MonthlyData,
  ActivityData,
  LongRunData,
} from "@/lib/types";
import { ChartSkeleton, CardSkeleton } from "@/components/skeleton";
import { FilterBar, type FilterState } from "@/components/progress/filter-bar";
import { WeeklyKmChart } from "@/components/progress/weekly-km-chart";
import { MonthlyKmChart } from "@/components/progress/monthly-km-chart";
import { LongRunPaceChart } from "@/components/progress/longrun-pace-chart";
import { PaceHrChart } from "@/components/progress/pace-hr-chart";
import { LongRunTable } from "@/components/progress/longrun-table";
import { WeekSummaryTable } from "@/components/progress/week-summary-table";

const DEFAULT_FILTERS: FilterState = {
  period: "all",
  type: "all",
  sundaysOnly: false,
};

/* ----- Period helpers ----- */

function weeksAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n * 7);
  return d;
}

function startOfYear(): Date {
  return new Date(new Date().getFullYear(), 0, 1);
}

function periodCutoff(period: FilterState["period"]): Date | null {
  switch (period) {
    case "4w":
      return weeksAgo(4);
    case "12w":
      return weeksAgo(12);
    case "ytd":
      return startOfYear();
    case "all":
      return null;
  }
}

/** Parse week label "W3 2025" or "2025-W03" style to approximate date */
function weekLabelToDate(label: string): Date {
  // Handle "Wxx" labels — take latest Monday in that week
  const match = label.match(/W(\d+)\s*(\d{4})?/i);
  if (match) {
    const week = parseInt(match[1], 10);
    const year = match[2] ? parseInt(match[2], 10) : new Date().getFullYear();
    // ISO week 1 starts on the Monday closest to Jan 1
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7;
    const monday = new Date(jan4);
    monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
    return monday;
  }
  return new Date(label);
}

/** Parse month label "Nov 2025", "2025-11" etc. */
function monthLabelToDate(label: string): Date {
  const d = new Date(label + " 1");
  if (!isNaN(d.getTime())) return d;
  return new Date(label);
}

function filterByPeriod<T>(
  items: T[],
  cutoff: Date | null,
  toDate: (item: T) => Date
): T[] {
  if (!cutoff) return items;
  return items.filter((item) => toDate(item) >= cutoff);
}

/* ----- Activity type helper ----- */

function activityMatchesType(
  a: ActivityData,
  type: FilterState["type"]
): boolean {
  switch (type) {
    case "all":
      return true;
    case "longrun":
      return a.isLongRun;
    case "interval": {
      const lower = a.name.toLowerCase();
      return lower.includes("interval") || lower.includes("tempo");
    }
    case "easy": {
      const lower = a.name.toLowerCase();
      return (
        !a.isLongRun &&
        !lower.includes("interval") &&
        !lower.includes("tempo")
      );
    }
  }
}

/* ===================================================================== */

export default function ProgressPage() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  /* ----- Derived / filtered data ----- */

  const cutoff = useMemo(() => periodCutoff(filters.period), [filters.period]);

  const filteredWeekly = useMemo<WeeklyData[]>(() => {
    if (!data) return [];
    return filterByPeriod(data.weekly, cutoff, (w) => weekLabelToDate(w.label));
  }, [data, cutoff]);

  const filteredMonthly = useMemo<MonthlyData[]>(() => {
    if (!data) return [];
    return filterByPeriod(data.monthly, cutoff, (m) =>
      monthLabelToDate(m.label)
    );
  }, [data, cutoff]);

  const filteredActivities = useMemo<ActivityData[]>(() => {
    if (!data) return [];
    let acts = data.activities;

    // Period
    if (cutoff) {
      acts = acts.filter((a) => new Date(a.date) >= cutoff);
    }

    // Type
    acts = acts.filter((a) => activityMatchesType(a, filters.type));

    // Sundays only
    if (filters.sundaysOnly) {
      acts = acts.filter((a) => a.isSunday);
    }

    return acts;
  }, [data, cutoff, filters.type, filters.sundaysOnly]);

  const longRunActivities = useMemo(
    () => filteredActivities.filter((a) => a.isLongRun),
    [filteredActivities]
  );

  const longRunChartData = useMemo<LongRunData[]>(() => {
    return longRunActivities.map((a) => ({
      date: a.date,
      name: a.name,
      distanceKm: a.distanceKm,
      paceMinKm: a.paceMinKm,
    }));
  }, [longRunActivities]);

  /* ----- Loading / error states ----- */

  if (error) {
    return (
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) px-6 py-12 text-center text-red-500">
        Fout bij laden: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        {/* Skeleton header */}
        <div>
          <div className="skeleton mb-2 h-7 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>

        {/* Skeleton filter bar placeholder */}
        <div className="skeleton h-12 w-full rounded-lg" />

        {/* Skeleton charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Skeleton table */}
        <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-5">
          <div className="skeleton mb-4 h-4 w-32" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton mb-2 h-8 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary)">
          Training Progress
        </h1>
        <p className="mt-1 text-sm text-(--text-muted)">
          {data.summary.totalRuns} runs &middot;{" "}
          {Math.round(data.summary.totalKm)} km totaal &middot;{" "}
          {filteredActivities.length} activiteiten in filter
        </p>
      </div>

      {/* Mock warning */}
      {data.mock && (
        <div className="rounded-lg bg-(--accent-2-light) px-4 py-3 text-sm text-(--accent-2-text)">
          Demo modus — Dummy data wordt getoond.
        </div>
      )}

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Charts: 2 cols on lg */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyKmChart data={filteredWeekly} />
        <MonthlyKmChart data={filteredMonthly} />
        <LongRunPaceChart data={longRunChartData} />
        <PaceHrChart data={longRunActivities} />
      </div>

      {/* Tables */}
      <div className="space-y-4">
        <LongRunTable data={longRunActivities} />
        <WeekSummaryTable data={filteredWeekly} />
      </div>
    </div>
  );
}
