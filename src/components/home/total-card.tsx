interface Props {
  km: number;
  pctEarth: number;
}

export function TotalCard({ km, pctEarth }: Props) {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Totaal sinds nov 2025
      </p>
      <div className="mt-3">
        <span className="text-2xl font-bold text-(--text-primary) sm:text-3xl">
          {km} km
        </span>
      </div>
      <p className="mt-3 border-t border-(--border-primary) pt-3 text-xs text-(--text-muted)">
        {pctEarth.toFixed(2)}% van de aarde rond
      </p>
    </div>
  );
}
