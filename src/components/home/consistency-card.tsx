import { CONSISTENCY_RUNS } from "@/lib/race-config";

interface Props {
  streak: number;
}

export function ConsistencyCard({ streak }: Props) {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Consistentie
      </p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-(--accent) sm:text-3xl">
          {streak}
        </span>
        <span className="text-sm text-(--text-secondary)">weken op rij</span>
      </div>
      <p className="mt-3 border-t border-(--border-primary) pt-3 text-xs text-(--text-muted)">
        Min. {CONSISTENCY_RUNS} runs per week
      </p>
    </div>
  );
}
