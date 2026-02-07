"use client";

import { formatPace, formatDuration } from "@/lib/race-config";
import type { ActivityData } from "@/lib/types";

interface Props {
  data: ActivityData[];
}

function StravaLink({ stravaId }: { stravaId: string }) {
  return (
    <a
      href={`https://www.strava.com/activities/${stravaId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-(--accent) hover:underline"
    >
      Strava
      <svg
        className="h-3 w-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}

export function LongRunTable({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-6 text-center text-sm text-(--text-muted)">
        Geen long runs gevonden voor deze filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card)">
      <div className="px-4 py-3 sm:px-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Long Runs ({data.length})
        </h3>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-t border-(--border-secondary) bg-(--bg-inset)">
              <th className="px-4 py-2.5 text-xs font-medium text-(--text-muted)">
                Datum
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                km
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Tijd
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Pace
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Stijging
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Gem. HR
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-(--text-muted)">
                Strava
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-secondary)">
            {data.map((run) => (
              <tr
                key={run.id}
                className="transition-colors hover:bg-(--bg-card-hover)"
              >
                <td className="px-4 py-2.5 text-(--text-primary)">
                  {run.date}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-primary)">
                  {run.distanceKm.toFixed(1)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-secondary)">
                  {formatDuration(run.movingTimeMin)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--accent-2-text)">
                  {formatPace(run.paceMinKm)}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-secondary)">
                  {run.elevation ? `${Math.round(run.elevation)}m` : "\u2014"}
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-(--text-secondary)">
                  {run.heartrate ? `${Math.round(run.heartrate)}` : "\u2014"}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {run.stravaId && <StravaLink stravaId={run.stravaId} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="divide-y divide-(--border-secondary) md:hidden">
        {data.map((run) => (
          <div key={run.id} className="px-4 py-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-(--text-primary)">
                  {run.date}
                </p>
                <p className="mt-0.5 text-xs text-(--text-muted) line-clamp-1">
                  {run.name}
                </p>
              </div>
              {run.stravaId && <StravaLink stravaId={run.stravaId} />}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-(--text-muted)">km</span>
                <p className="font-mono font-medium text-(--text-primary)">
                  {run.distanceKm.toFixed(1)}
                </p>
              </div>
              <div>
                <span className="text-(--text-muted)">Pace</span>
                <p className="font-mono font-medium text-(--accent-2-text)">
                  {formatPace(run.paceMinKm)}
                </p>
              </div>
              <div>
                <span className="text-(--text-muted)">Tijd</span>
                <p className="font-mono font-medium text-(--text-secondary)">
                  {formatDuration(run.movingTimeMin)}
                </p>
              </div>
              <div>
                <span className="text-(--text-muted)">HR</span>
                <p className="font-mono font-medium text-(--text-secondary)">
                  {run.heartrate ? Math.round(run.heartrate) : "\u2014"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
