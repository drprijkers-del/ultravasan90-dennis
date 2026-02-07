import dynamic from "next/dynamic";
import { formatPace, LONGRUN_KM } from "@/lib/race-config";

const RouteMiniMap = dynamic(() => import("./route-mini-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-32 items-center justify-center rounded-lg bg-(--bg-inset)">
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
      <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
          Laatste longrun
          <span className="ml-2 normal-case tracking-normal text-[10px] opacity-70">
            ({LONGRUN_KM}+ km)
          </span>
        </p>
        <p className="mt-4 text-sm text-(--text-secondary)">
          Nog geen longrun ({LONGRUN_KM}+ km) geregistreerd.
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
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Laatste longrun
        <span className="ml-2 normal-case tracking-normal text-[10px] opacity-70">
          ({LONGRUN_KM}+ km)
        </span>
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
      {lastLongRun.polyline && lastLongRun.polyline.length > 10 && (
        <div className="mt-3 overflow-hidden rounded-lg">
          <RouteMiniMap polyline={lastLongRun.polyline} />
        </div>
      )}
    </div>
  );
}
