import { formatPace } from "@/lib/race-config";

interface PR {
  distance: string;
  time: string;
  pace: number;
  date: string;
}

const personalRecords: PR[] = [
  { distance: "5K", time: "22:45", pace: 4.55, date: "2025-09-14" },
  { distance: "10K", time: "47:30", pace: 4.75, date: "2025-10-05" },
  { distance: "Halve marathon", time: "1:48:12", pace: 5.12, date: "2025-04-13" },
  { distance: "Marathon", time: "3:23:00", pace: 4.82, date: "Berlin Marathon" },
  { distance: "50K", time: "—", pace: 0, date: "target 2026" },
];

export function PersonalRecords() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Persoonlijke Records
      </h3>
      <div className="space-y-3">
        {personalRecords.map((pr) => (
          <div
            key={pr.distance}
            className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2.5 dark:bg-zinc-900"
          >
            <div>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {pr.distance}
              </span>
              <span className="ml-2 text-xs text-zinc-400">{pr.date}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {pr.time}
              </span>
              <span className="font-mono text-xs text-zinc-400">
                {formatPace(pr.pace)}/km
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
