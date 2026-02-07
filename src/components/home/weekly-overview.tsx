import { formatPace, TARGET_BAND, CONSISTENCY_RUNS } from "@/lib/race-config";
import type { WeeklyData } from "@/lib/types";

interface Props {
  data: WeeklyData[];
}

export function WeeklyOverview({ data }: Props) {
  const recent = data.slice(-8).reverse();
  const maxKm = Math.max(...recent.map((w) => w.totalKm), 1);

  const last4 = data.slice(-4);
  const rollingAvg =
    last4.length > 0
      ? last4.reduce((s, w) => s + w.totalKm, 0) / last4.length
      : 0;

  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      <h3 className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
        Recente weken
      </h3>
      <div className="mt-4 space-y-0.5">
        {recent.map((week, i) => {
          const isCurrentWeek = i === 0;
          const isRecovery = week.runCount < CONSISTENCY_RUNS;
          const barPct = (week.totalKm / maxKm) * 100;

          return (
            <div key={week.label} className="flex items-center gap-2 py-2 sm:gap-3">
              <span className="w-14 shrink-0 font-mono text-xs text-(--text-muted) sm:w-16">
                {week.label}
                {isRecovery && (
                  <span className="block text-[10px] opacity-70">(herstel)</span>
                )}
              </span>
              <span
                className={`w-12 shrink-0 text-right font-mono text-lg font-bold sm:w-14 ${
                  isCurrentWeek
                    ? "text-(--accent-orange)"
                    : "text-(--text-primary)"
                }`}
              >
                {Math.round(week.totalKm)}
              </span>
              <span className="hidden w-10 shrink-0 text-right font-mono text-xs text-(--text-muted) md:block">
                {formatPace(week.avgPaceMinKm)}
              </span>
              <span className="w-10 shrink-0 text-xs text-(--text-muted) sm:w-12">
                {week.runCount} runs
              </span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-(--bg-inset)">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    backgroundColor: isCurrentWeek
                      ? "var(--accent-orange)"
                      : "var(--accent)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between pt-3 text-xs text-(--text-muted)">
        <span>4-weken gem: {rollingAvg.toFixed(1)} km/week</span>
        <span>
          Doel: {TARGET_BAND.min}&ndash;{TARGET_BAND.max} km/week
        </span>
      </div>
    </div>
  );
}
