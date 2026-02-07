interface Props {
  streak: number;
  avgRunsPerWeek: number;
}

export function ConsistencyCard({ streak, avgRunsPerWeek }: Props) {
  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Consistentie
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-(--accent) sm:text-4xl">
          {streak}
        </span>
        <span className="text-sm text-(--text-secondary)">weken op rij</span>
      </div>
      <p className="mt-2 text-sm text-(--text-secondary)">
        Gem. {avgRunsPerWeek.toFixed(1)} runs/week
      </p>
    </div>
  );
}
