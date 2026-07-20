"use client";

import { formatPace } from "@/lib/race-config";
import { type RacePlan, elapsedToClock, timeOfDay } from "@/lib/race-plan";

export function CheckpointPacing({ plan }: { plan: RacePlan }) {
  return (
    <div className="rounded-xl card-elevated bg-(--bg-card)">
      <div className="px-4 py-3 sm:px-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Checkpointschema
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-(--text-muted)">
          Streeftijden bij een gelijkmatige {formatPace(plan.paceMinKm)} min/km
          lopend, plus {Math.round(plan.aidTotalMin)} min stilstand totaal. Start
          05:00. De eerste helft is heuvelachtiger &mdash; behandel die splits als
          plafond en win tijd terug op de vlakke aanloop naar Mora.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-(--border-secondary) text-[10px] uppercase tracking-wider text-(--text-muted)">
              <th className="px-4 py-2 text-left font-medium sm:px-5">Post</th>
              <th className="px-2 py-2 text-right font-medium">km</th>
              <th className="px-2 py-2 text-right font-medium">Klok</th>
              <th className="px-2 py-2 text-right font-medium">Onderweg</th>
              <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">
                Tempo
              </th>
              <th className="px-4 py-2 text-left font-medium sm:px-5">Voeding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border-secondary)">
            {plan.rows.map((r) => (
              <tr
                key={r.name}
                className={r.isFinish ? "bg-(--bg-inset) font-medium" : ""}
              >
                <td className="px-4 py-2.5 text-left text-(--text-primary) sm:px-5">
                  {r.name}
                </td>
                <td className="px-2 py-2.5 text-right font-mono text-xs text-(--text-muted)">
                  {r.km}
                </td>
                <td className="px-2 py-2.5 text-right font-mono text-(--accent-orange)">
                  {timeOfDay(r.arrival)}
                </td>
                <td className="px-2 py-2.5 text-right font-mono text-xs text-(--text-secondary)">
                  {elapsedToClock(r.arrival)}
                </td>
                <td className="hidden px-2 py-2.5 text-right font-mono text-xs text-(--text-muted) sm:table-cell">
                  {r.segPace > 0 ? formatPace(r.segPace) : "—"}
                </td>
                <td className="px-4 py-2.5 text-left text-xs text-(--text-muted) sm:px-5">
                  {r.fuel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 sm:px-5">
        <p className="text-[11px] leading-relaxed text-(--text-muted)">
          <span className="font-medium text-(--text-secondary)">Waarom dit schema:</span>{" "}
          op je 50k zaten de zware benen in de laatste 10 km terwijl je spieren
          fris bleven (geen spierpijn, moeiteloze duurloop de dag erna). Dat wijst
          op een lege tank, niet op conditie. Vroeg en constant bijtanken
          (~60&nbsp;g koolhydraten per uur, drinken bij elke post) houdt die dip
          weg &mdash; en dat is precies wat je in training zonder posten miste.
        </p>
      </div>
    </div>
  );
}
