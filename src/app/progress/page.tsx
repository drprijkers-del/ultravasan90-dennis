"use client";

import { useEffect, useState } from "react";
import { formatPace } from "@/lib/race-config";

interface LongRunData {
  date: string;
  name: string;
  distanceKm: number;
  paceMinKm: number;
  movingTimeMin: number;
  heartrate: number | null;
  elevation: number | null;
}

interface StatsData {
  mock: boolean;
  longRuns: LongRunData[];
  summary: {
    totalKm: number;
    totalRuns: number;
  };
}

export default function ProgressPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Training Progress
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Alle long runs op een rij — {data.longRuns.length} sessies
        </p>
      </div>

      {data.mock && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Demo modus — Dummy data wordt getoond.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                Datum
              </th>
              <th className="px-4 py-3 font-medium text-zinc-500 dark:text-zinc-400">
                Naam
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Afstand
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Pace
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Tijd
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                HR
              </th>
              <th className="px-4 py-3 text-right font-medium text-zinc-500 dark:text-zinc-400">
                Stijging
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {data.longRuns.map((run, i) => (
              <tr
                key={i}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">
                  {run.date}
                </td>
                <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                  {run.name}
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-900 dark:text-zinc-100">
                  {run.distanceKm} km
                </td>
                <td className="px-4 py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                  {formatPace(run.paceMinKm)} /km
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                  {Math.floor(run.movingTimeMin / 60)}h{" "}
                  {run.movingTimeMin % 60}m
                </td>
                <td className="px-4 py-3 text-right font-mono text-red-500">
                  {run.heartrate ?? "—"}
                </td>
                <td className="px-4 py-3 text-right font-mono text-zinc-600 dark:text-zinc-400">
                  {run.elevation ? `${Math.round(run.elevation)}m` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
