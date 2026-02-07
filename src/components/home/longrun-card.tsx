import { formatPace } from "@/lib/race-config";

interface Props {
  lastLongRun: {
    date: string;
    km: number;
    pace: number;
    name: string;
    polyline: string | null;
  } | null;
}

export function LongRunCard({ lastLongRun }: Props) {
  if (!lastLongRun) {
    return (
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
          Laatste longrun
        </p>
        <p className="mt-4 text-sm text-(--text-secondary)">
          Nog geen longrun deze cyclus
        </p>
      </div>
    );
  }

  const d = new Date(lastLongRun.date);
  const dateStr = d.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Laatste longrun
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-(--text-primary) sm:text-3xl">
          {lastLongRun.km} km
        </span>
        <span className="font-mono text-sm text-(--accent)">
          {formatPace(lastLongRun.pace)}/km
        </span>
      </div>
      <p className="mt-1 text-sm text-(--text-secondary)">
        {lastLongRun.name} &middot; {dateStr}
      </p>

      {/* Mini route map via Strava polyline (static image) */}
      {lastLongRun.polyline && (
        <div className="mt-3 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://open.mapquestapi.com/staticmap/v5/map?key=&size=400,120&type=dark&shape=${encodeURIComponent(lastLongRun.polyline)}`}
            alt="Route"
            className="hidden"
          />
          {/* Fallback: colored route representation */}
          <div className="flex h-16 items-center justify-center rounded-lg bg-(--bg-inset) text-xs text-(--text-muted)">
            <svg className="mr-2 h-4 w-4 text-(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Bekijk route op Strava
          </div>
        </div>
      )}
    </div>
  );
}
