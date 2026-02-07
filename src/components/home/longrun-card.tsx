import dynamic from "next/dynamic";
import { formatPace } from "@/lib/race-config";

const RouteMiniMap = dynamic(() => import("./route-mini-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-28 items-center justify-center rounded-lg bg-(--bg-inset)">
      <span className="text-xs text-(--text-muted)">Kaart laden...</span>
    </div>
  ),
});

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

      {/* Mini route map */}
      {lastLongRun.polyline && (
        <div className="mt-3 overflow-hidden rounded-lg">
          <RouteMiniMap polyline={lastLongRun.polyline} />
        </div>
      )}
    </div>
  );
}
