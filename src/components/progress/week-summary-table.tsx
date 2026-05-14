"use client";

import { useState, useMemo } from "react";
import { formatPace, formatDuration } from "@/lib/race-config";
import type { WeeklyData, ActivityData } from "@/lib/types";

interface Props {
  data: WeeklyData[];
  activities: ActivityData[];
}

function getISOWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - yearStart.getTime()) / 86400000 -
        3 +
        ((yearStart.getDay() + 6) % 7)) /
        7
    );
  return `W${weekNum}`;
}

const dayNames = ["zo", "ma", "di", "wo", "do", "vr", "za"];

export function WeekSummaryTable({ data, activities }: Props) {
  const [openWeek, setOpenWeek] = useState<string | null>(null);
  const [show2025, setShow2025] = useState(false);

  const activitiesByWeek = useMemo(() => {
    const map = new Map<string, ActivityData[]>();
    for (const act of activities) {
      const label = getISOWeekLabel(new Date(act.date));
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(act);
    }
    return map;
  }, [activities]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl card-elevated bg-(--bg-card) p-6 text-center text-sm text-(--text-muted)">
        Geen weekdata gevonden voor deze periode.
      </div>
    );
  }

  const sorted = [...data].reverse();
  const maxKm = Math.max(...sorted.map((w) => w.totalKm), 1);

  // Split 2026 (current year) vs 2025
  const weeks2026 = sorted.filter((w) => !w.label.startsWith("'25"));
  const weeks2025 = sorted.filter((w) => w.label.startsWith("'25"));

  const toggleWeek = (label: string) => {
    setOpenWeek((prev) => (prev === label ? null : label));
  };

  function renderWeekRow(week: WeeklyData, idx: number, isCurrentWeek: boolean) {
    const isOpen = openWeek === week.label;
    const weekActivities = activitiesByWeek.get(week.label) || [];

    return (
      <div key={week.label}>
        <button
          onClick={() => toggleWeek(week.label)}
          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-(--bg-card-hover) sm:px-5 ${
            isCurrentWeek && !isOpen ? "bg-(--bg-inset)" : ""
          } ${isOpen ? "bg-(--bg-inset)" : ""}`}
        >
          <svg
            className={`h-3.5 w-3.5 shrink-0 text-(--text-muted) transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>

          <span className={`w-14 shrink-0 text-sm font-medium ${isCurrentWeek ? "text-(--accent-orange)" : "text-(--text-primary)"}`}>
            {week.label}
          </span>

          <span className="w-16 shrink-0 text-right font-mono text-sm font-bold text-(--text-primary)">
            {week.totalKm.toFixed(1)} km
          </span>

          <span className="w-14 shrink-0 text-right text-xs text-(--text-muted)">
            {week.runCount} runs
          </span>

          <span className="hidden w-14 shrink-0 text-right font-mono text-xs text-(--text-muted) sm:block">
            {formatPace(week.avgPaceMinKm)}
          </span>

          <span className="hidden w-14 shrink-0 text-right text-xs text-(--text-muted) sm:block">
            {week.totalElevation ? `${Math.round(week.totalElevation)}m` : "\u2014"}
          </span>

          <div className="hidden h-2 flex-1 overflow-hidden rounded-full bg-(--bg-inset) md:block">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (week.totalKm / maxKm) * 100)}%`,
                backgroundColor: isCurrentWeek ? "var(--accent-orange)" : "var(--accent)",
              }}
            />
          </div>
        </button>

        {isOpen && (
          <div className="border-t border-(--border-primary) bg-(--bg-primary)">
            {weekActivities.length === 0 ? (
              <p className="px-4 py-4 text-center text-xs text-(--text-muted) sm:px-5">
                Geen activiteiten gevonden voor deze week.
              </p>
            ) : (
              <div className="divide-y divide-(--border-primary)">
                {weekActivities.map((act) => {
                  const d = new Date(act.date);
                  const dayName = dayNames[d.getDay()];
                  const dateStr = d.toLocaleDateString("nl-NL", {
                    day: "numeric",
                    month: "short",
                  });

                  return (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 px-4 py-2.5 sm:px-5"
                    >
                      <span className="w-16 shrink-0 text-xs text-(--text-muted)">
                        <span className="font-medium text-(--text-secondary)">{dayName}</span>{" "}
                        {dateStr}
                      </span>

                      <span className="min-w-0 flex-1 truncate text-sm text-(--text-primary)">
                        {act.name}
                        {act.isLongRun && (
                          <span className="ml-1.5 inline-block rounded bg-(--accent-orange-light) px-1.5 py-0.5 text-[10px] font-medium text-(--accent-orange-text)">
                            long run
                          </span>
                        )}
                      </span>

                      <span className="w-14 shrink-0 text-right font-mono text-sm font-medium text-(--text-primary)">
                        {act.distanceKm.toFixed(1)} km
                      </span>

                      <span className="hidden w-14 shrink-0 text-right font-mono text-xs text-(--text-muted) sm:block">
                        {formatPace(act.paceMinKm)}
                      </span>

                      <span className="hidden w-12 shrink-0 text-right font-mono text-xs text-(--text-muted) sm:block">
                        {formatDuration(act.movingTimeMin)}
                      </span>

                      <span className="hidden w-10 shrink-0 text-right font-mono text-xs text-(--text-muted) md:block">
                        {act.heartrate ? `${Math.round(act.heartrate)}` : "\u2014"}
                      </span>

                      <span className="hidden w-10 shrink-0 text-right font-mono text-xs text-(--text-muted) sm:block">
                        {act.elevation ? `${Math.round(act.elevation)}m` : "\u2014"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Compute 2025 summary
  const summary2025 = weeks2025.length > 0 ? {
    totalKm: weeks2025.reduce((s, w) => s + w.totalKm, 0),
    totalRuns: weeks2025.reduce((s, w) => s + w.runCount, 0),
    avgPace: weeks2025.reduce((s, w) => s + w.avgPaceMinKm, 0) / weeks2025.length,
    weeks: weeks2025.length,
  } : null;

  return (
    <div className="rounded-xl card-elevated bg-(--bg-card)">
      <div className="px-4 py-3 sm:px-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Weekoverzicht ({data.length} weken)
        </h3>
        <p className="mt-1 text-xs text-(--text-muted)">
          Klik op een week om de individuele trainingen te bekijken.
        </p>
      </div>

      <div className="divide-y divide-(--border-secondary)">
        {/* 2026 weeks - always visible */}
        {weeks2026.map((week, i) => renderWeekRow(week, i, i === 0))}

        {/* 2025 weeks - collapsible */}
        {weeks2025.length > 0 && (
          <div>
            <button
              onClick={() => setShow2025(!show2025)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-xs transition-colors hover:bg-(--bg-card-hover) sm:px-5"
            >
              <svg
                className={`h-3.5 w-3.5 shrink-0 text-(--text-muted) transition-transform ${
                  show2025 ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-medium text-(--text-secondary)">
                2025 ({weeks2025.length} weken)
              </span>
              {summary2025 && (
                <span className="text-(--text-muted)">
                  {summary2025.totalKm.toFixed(0)} km &middot; {summary2025.totalRuns} runs &middot; gem. {formatPace(summary2025.avgPace)}/km
                </span>
              )}
            </button>
            {show2025 && (
              <div className="divide-y divide-(--border-secondary)">
                {weeks2025.map((week, i) => renderWeekRow(week, i, false))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
