import { ULTRAVASAN_CHECKPOINTS } from "@/lib/mock-data";

interface CheckpointListProps {
  currentKm: number;
}

export function CheckpointList({ currentKm }: CheckpointListProps) {
  // Find next checkpoint index
  const nextIdx = ULTRAVASAN_CHECKPOINTS.findIndex((cp) => cp.km > currentKm);

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-5">
      <h3 className="mb-3 text-sm font-medium text-(--text-muted)">
        Checkpoints
      </h3>
      <div className="space-y-2.5">
        {ULTRAVASAN_CHECKPOINTS.map((cp, idx) => {
          const passed = currentKm >= cp.km;
          const isCurrent = idx === nextIdx;

          return (
            <div
              key={cp.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2.5">
                {/* Status dot */}
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    passed
                      ? "bg-(--accent)"
                      : isCurrent
                        ? "animate-pulse bg-(--accent-2)"
                        : "bg-(--border-secondary)"
                  }`}
                />
                {/* Name */}
                <span
                  className={
                    passed
                      ? "font-medium text-(--accent-text) line-through decoration-1"
                      : isCurrent
                        ? "font-semibold text-(--accent-2-text)"
                        : "text-(--text-secondary)"
                  }
                >
                  {cp.name}
                </span>
              </div>
              <span
                className={`font-mono text-xs ${
                  passed
                    ? "text-(--accent-muted)"
                    : isCurrent
                      ? "font-semibold text-(--accent-2-text)"
                      : "text-(--text-muted)"
                }`}
              >
                {cp.km} km
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
