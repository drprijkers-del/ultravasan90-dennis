import { TRAINING_TARGET_KM } from "@/lib/race-config";

interface Props {
  km: number;
  pctEarth: number;
  totalRuns: number;
  totalElevation: number;
}

export function TotalCard({ km, pctEarth, totalRuns, totalElevation }: Props) {
  const pctTarget = Math.round((km / TRAINING_TARGET_KM) * 100);

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Totaal gericht trainen (vanaf nov &apos;25)
      </p>
      <div className="mt-3">
        <span className="text-2xl font-bold text-(--text-primary) sm:text-3xl">
          {km} km
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-(--text-secondary)">
        <span>{totalRuns} runs</span>
        <span>{totalElevation}m stijging</span>
      </div>
      <p className="mt-3 border-t border-(--border-primary) pt-3 text-xs text-(--text-muted)">
        {pctTarget}% van {TRAINING_TARGET_KM} km doel &middot; {pctEarth.toFixed(2)}% aarde rond
      </p>
    </div>
  );
}
