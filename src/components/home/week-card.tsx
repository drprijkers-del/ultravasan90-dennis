interface Props {
  km: number;
  runs: number;
  hours: number;
  funFact: string;
}

export function WeekCard({ km, runs, hours, funFact }: Props) {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Deze week
      </p>
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold text-(--accent) sm:text-3xl">
          {km} km
        </span>
      </div>
      <div className="mt-2 flex gap-4 text-sm text-(--text-secondary)">
        <span>{runs} runs</span>
        <span>{hours.toFixed(1)} uur</span>
      </div>
      <p className="mt-3 border-t border-(--border-primary) pt-3 text-xs text-(--text-muted)">
        {funFact}
      </p>
    </div>
  );
}
