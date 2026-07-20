"use client";

import { formatPace } from "@/lib/race-config";
import { useT } from "@/lib/i18n";
import { type RacePlan, elapsedToClock, timeOfDay } from "@/lib/race-plan";

export function CheckpointPacing({ plan }: { plan: RacePlan }) {
  const t = useT();

  return (
    <div className="rounded-xl card-elevated bg-(--bg-card)">
      <div className="px-4 py-3 sm:px-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          {t("plan.schedule")}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-(--text-muted)">
          {t("plan.scheduleIntro", {
            pace: formatPace(plan.paceMinKm),
            aid: Math.round(plan.aidTotalMin),
          })}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-(--border-secondary) text-[10px] uppercase tracking-wider text-(--text-muted)">
              <th className="px-4 py-2 text-left font-medium sm:px-5">
                {t("plan.colCheckpoint")}
              </th>
              <th className="px-2 py-2 text-right font-medium">{t("plan.colKm")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("plan.colClock")}</th>
              <th className="px-2 py-2 text-right font-medium">{t("plan.colElapsed")}</th>
              <th className="hidden px-2 py-2 text-right font-medium sm:table-cell">
                {t("plan.colPace")}
              </th>
              <th className="px-4 py-2 text-left font-medium sm:px-5">
                {t("plan.colFuel")}
              </th>
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
                  {t(`plan.${r.fuel}`)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-4 py-3 sm:px-5">
        <p className="text-[11px] leading-relaxed text-(--text-muted)">
          <span className="font-medium text-(--text-secondary)">
            {t("plan.whyLabel")}
          </span>{" "}
          {t("plan.whyText")}
        </p>
      </div>
    </div>
  );
}
