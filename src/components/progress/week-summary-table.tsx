"use client";

import { formatDuration } from "@/lib/race-config";
import type { WeeklyData } from "@/lib/types";

interface Props {
  data: WeeklyData[];
}

export function WeekSummaryTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-6 text-center text-sm text-(--text-muted)">
        Geen weekdata gevonden voor deze filters.
      </div>
    );
  }

  // Show most recent first
  const sorted = [...data].reverse();

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card)">
      <div className="px-4 py-3 sm:px-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Weekoverzicht ({data.length} weken)
        </h3>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-t border-(--border-secondary) bg-(--bg-inset)">
              <th className="px-4 py-2.5 text-xs font-medium text-(--text-muted)">
                Week
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                km
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Stijging
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Runs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-secondary)">
            {sorted.map((week, i) => (
              <tr
                key={week.label}
                className={`transition-colors hover:bg-(--bg-card-hover) ${
                  i === 0 ? "font-semibold" : ""
                }`}
              >
                <td className="px-4 py-2.5 text-(--text-primary)">
                  {week.label}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-primary)">
                  {week.totalKm.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-secondary)">
                  {week.totalElevation
                    ? `${Math.round(week.totalElevation)}m`
                    : "\u2014"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-secondary)">
                  {week.runCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-(--border-secondary) md:hidden">
        {sorted.map((week, i) => (
          <div
            key={week.label}
            className={`px-4 py-3 ${i === 0 ? "bg-(--bg-inset)" : ""}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-(--text-primary)">
                {week.label}
              </p>
              <p className="text-sm font-mono font-bold text-(--accent)">
                {week.totalKm.toFixed(1)} km
              </p>
            </div>
            <div className="mt-1.5 flex gap-4 text-xs text-(--text-muted)">
              <span>{week.runCount} runs</span>
              {week.totalElevation > 0 && (
                <span>{Math.round(week.totalElevation)}m stijging</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
