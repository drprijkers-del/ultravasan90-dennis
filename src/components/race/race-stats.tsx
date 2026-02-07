interface NextCheckpoint {
  name: string;
  km: number;
  eta?: string;
}

interface RaceStatsProps {
  estimatedKm: number;
  remainingKm: number;
  etaFinish: string;
  lastUpdate: Date | null;
  nextCheckpoint: NextCheckpoint | null;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s geleden`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min geleden`;
  const hours = Math.floor(minutes / 60);
  return `${hours}u ${minutes % 60}m geleden`;
}

export function RaceStats({
  estimatedKm,
  remainingKm,
  etaFinish,
  lastUpdate,
  nextCheckpoint,
}: RaceStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {/* Distance covered */}
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4">
        <p className="text-xs font-medium text-(--text-muted)">Afgelegd</p>
        <p className="mt-1 text-2xl font-bold text-(--accent)">
          {estimatedKm.toFixed(1)}
          <span className="ml-1 text-sm font-normal text-(--text-muted)">
            km
          </span>
        </p>
      </div>

      {/* Remaining */}
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4">
        <p className="text-xs font-medium text-(--text-muted)">Resterend</p>
        <p className="mt-1 text-2xl font-bold text-(--text-primary)">
          {remainingKm.toFixed(1)}
          <span className="ml-1 text-sm font-normal text-(--text-muted)">
            km
          </span>
        </p>
      </div>

      {/* ETA finish */}
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4">
        <p className="text-xs font-medium text-(--text-muted)">ETA finish</p>
        <p className="mt-1 text-2xl font-bold text-(--text-primary)">
          {etaFinish}
        </p>
      </div>

      {/* Last seen */}
      <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4">
        <p className="text-xs font-medium text-(--text-muted)">Laatst gezien</p>
        <p className="mt-1 text-lg font-semibold text-(--text-secondary)">
          {lastUpdate ? timeAgo(lastUpdate) : "Wachten..."}
        </p>
      </div>

      {/* Next checkpoint */}
      <div className="col-span-2 rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 md:col-span-1">
        <p className="text-xs font-medium text-(--text-muted)">
          Volgend checkpoint
        </p>
        {nextCheckpoint ? (
          <div className="mt-1">
            <p className="text-lg font-semibold text-(--accent-2-text)">
              {nextCheckpoint.name}
            </p>
            <p className="text-xs text-(--text-muted)">
              {nextCheckpoint.km} km
              {nextCheckpoint.eta && ` — ETA ${nextCheckpoint.eta}`}
            </p>
          </div>
        ) : (
          <p className="mt-1 text-lg font-semibold text-(--accent)">
            Finish bereikt!
          </p>
        )}
      </div>
    </div>
  );
}
