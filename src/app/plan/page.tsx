"use client";

import { CheckpointPacing } from "@/components/progress/checkpoint-pacing";
import { CHECKPOINT_PLAN, timeOfDay } from "@/lib/race-plan";

export default function PlanPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Raceplan</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--text-secondary)">
            Mijn strategie voor Ultravasan 90: streeftijden per checkpoint voor
            sub 10 uur, met een voedingsschema dat de dip van de laatste
            kilometers moet wegnemen.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="shrink-0 rounded-md border border-(--border-primary) px-3 py-1.5 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary) print:hidden"
        >
          Print / PDF
        </button>
      </div>

      <CheckpointPacing />

      {/* Compact strip — the minimal version you'd laminate or wear on a wrist. */}
      <div className="rounded-xl card-elevated bg-(--bg-card) p-4 sm:p-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          Onderarm-strook
        </h3>
        <p className="mt-1 text-xs text-(--text-muted)">
          De kale versie om te lamineren of als plak-tattoo te dragen: post, km
          en streeftijd op de klok.
        </p>
        <div className="mt-4 overflow-x-auto">
          <div className="inline-flex min-w-full items-stretch divide-x divide-(--border-secondary) rounded-lg border border-(--border-secondary) font-mono">
            {CHECKPOINT_PLAN.filter((r) => r.km > 0).map((r) => (
              <div
                key={r.name}
                className={`flex-1 px-2.5 py-2 text-center ${
                  r.isFinish ? "bg-(--bg-inset)" : ""
                }`}
              >
                <div className="text-[9px] uppercase tracking-wide text-(--text-muted)">
                  {r.name.replace(/^(Finish|Start) - /, "")}
                </div>
                <div className="mt-1 text-sm font-bold text-(--accent-orange)">
                  {timeOfDay(r.arrival)}
                </div>
                <div className="text-[9px] text-(--text-muted)">{r.km}k</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Future: link to a print/laminate/temporary-tattoo shop. */}
      <div className="rounded-xl border border-dashed border-(--border-primary) bg-(--bg-card) p-4 text-center sm:p-5 print:hidden">
        <p className="text-xs text-(--text-muted)">
          Binnenkort: deze strook laten lamineren of als plak-tattoo bestellen.
        </p>
      </div>
    </div>
  );
}
