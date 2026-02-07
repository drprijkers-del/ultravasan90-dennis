import { formatPace } from "@/lib/race-config";

interface Props {
  lastLongRun: {
    date: string;
    km: number;
    pace: number;
    funFact: string;
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
      <p className="mt-2 text-sm text-(--text-secondary)">{dateStr}</p>
      <p className="mt-3 border-t border-(--border-primary) pt-3 text-xs text-(--text-muted)">
        {lastLongRun.funFact}
      </p>
    </div>
  );
}
