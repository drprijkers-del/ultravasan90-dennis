export function DataSource() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-900/50">
      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        Waar komt deze data vandaan?
      </h3>
      <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-orange-500">&#9679;</span>
          <span>
            <strong className="text-zinc-800 dark:text-zinc-200">Strava</strong>{" "}
            — Alle runs worden automatisch gesynchroniseerd via Garmin → Strava → deze site
            (webhook, binnen 1-5 min).
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-emerald-500">&#9679;</span>
          <span>
            <strong className="text-zinc-800 dark:text-zinc-200">Metrics</strong>{" "}
            — Afstand, tempo, hartslag, hoogtemeters en tijd komen direct van je
            Garmin horloge via Strava API.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-0.5 text-blue-500">&#9679;</span>
          <span>
            <strong className="text-zinc-800 dark:text-zinc-200">Live tracking</strong>{" "}
            — Op race day stuurt je telefoon GPS-coördinaten naar deze site.
            Viewers zien je positie real-time op de kaart.
          </span>
        </div>
      </div>
    </div>
  );
}
