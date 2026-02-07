interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
}

export function ProgressBar({ current, target, label }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      {label && (
        <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </h3>
      )}
      <div className="flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {Math.round(current)}
          </span>
          <span className="ml-1 text-lg text-zinc-400">/ {target} km</span>
        </div>
        <span className="text-sm font-medium text-zinc-500">{pct}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
