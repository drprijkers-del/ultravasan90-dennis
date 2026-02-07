interface Props {
  km: number;
  runs: number;
  hours: number;
  prevWeekKm: number | null;
  avgKmPerWeek: number;
}

export function WeekCard({ km, runs, hours, prevWeekKm, avgKmPerWeek }: Props) {
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
      <div className="mt-3 border-t border-(--border-primary) pt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--text-muted)">
        {prevWeekKm !== null && (
          <span>Vorige week: {prevWeekKm} km</span>
        )}
        <span>Gem. {avgKmPerWeek.toFixed(0)} km/week</span>
      </div>
    </div>
  );
}
