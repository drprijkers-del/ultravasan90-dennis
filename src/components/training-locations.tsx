"use client";

interface LocationData {
  location: string;
  totalKm: number;
  totalRuns: number;
}

interface Props {
  data: LocationData[];
}

const LOCATION_META: Record<
  string,
  { country: string; flag: string; description: string }
> = {
  Amersfoort: { country: "Nederland", flag: "\u{1F1F3}\u{1F1F1}", description: "Home base" },
  Mora: { country: "Sverige", flag: "\u{1F1F8}\u{1F1EA}", description: "Finishplaats Ultravasan" },
  Finnbodarna: { country: "Sverige", flag: "\u{1F1F8}\u{1F1EA}", description: "Bergtraining" },
  "S\u00E4len": { country: "Sverige", flag: "\u{1F1F8}\u{1F1EA}", description: "Startplaats Ultravasan" },
};

export function TrainingLocations({ data }: Props) {
  const totalKm = data.reduce((s, l) => s + l.totalKm, 0);

  if (!data.length) return null;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Trainingslocaties
      </h3>
      <div className="space-y-3">
        {data.map((loc) => {
          const meta = LOCATION_META[loc.location] ?? {
            country: "",
            flag: "",
            description: "",
          };
          const pct =
            totalKm > 0 ? Math.round((loc.totalKm / totalKm) * 100) : 0;

          return (
            <div key={loc.location} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.flag}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {loc.location}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {meta.description}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {loc.totalKm} km
                  </span>
                  <span className="text-xs text-zinc-400">
                    {loc.totalRuns} runs
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
