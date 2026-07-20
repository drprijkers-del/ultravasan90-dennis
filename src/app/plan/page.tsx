"use client";

import { useState } from "react";
import { CheckpointPacing } from "@/components/progress/checkpoint-pacing";
import { formatPace } from "@/lib/race-config";
import { useT } from "@/lib/i18n";
import {
  computePlan,
  elapsedToClock,
  timeOfDay,
  DEFAULT_AID_MIN,
  DEFAULT_PACE_MIN_KM,
} from "@/lib/race-plan";

const DEFAULT_PACE_SEC = Math.round(DEFAULT_PACE_MIN_KM * 60);
const PACE_MIN_SEC = 315; // 5:15/km
const PACE_MAX_SEC = 435; // 7:15/km

export default function PlanPage() {
  const t = useT();
  const [paceSec, setPaceSec] = useState<number>(DEFAULT_PACE_SEC);
  const [aidMin, setAidMin] = useState<number>(DEFAULT_AID_MIN);

  const plan = computePlan(paceSec / 60, aidMin);
  const subTen = plan.finishMin <= 600;
  const isDefault = paceSec === DEFAULT_PACE_SEC && aidMin === DEFAULT_AID_MIN;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">{t("plan.title")}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--text-secondary)">
            {t("plan.intro")}
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="shrink-0 rounded-md border border-(--border-primary) px-3 py-1.5 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary) print:hidden"
        >
          {t("plan.print")}
        </button>
      </div>

      {/* Controls */}
      <div className="rounded-xl card-elevated bg-(--bg-card) p-4 sm:p-5 print:hidden">
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-(--text-muted)">{t("plan.settings")}</h3>
          {!isDefault && (
            <button
              onClick={() => {
                setPaceSec(DEFAULT_PACE_SEC);
                setAidMin(DEFAULT_AID_MIN);
              }}
              className="text-xs font-medium text-(--accent-orange) transition-opacity hover:opacity-80"
            >
              {t("plan.resetSubTen")}
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {/* Pace */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="pace" className="text-xs text-(--text-muted)">
                {t("plan.pace")}
              </label>
              <span className="font-mono text-sm font-bold text-(--text-primary)">
                {formatPace(paceSec / 60)}/km
              </span>
            </div>
            <input
              id="pace"
              type="range"
              min={PACE_MIN_SEC}
              max={PACE_MAX_SEC}
              step={5}
              value={paceSec}
              onChange={(e) => setPaceSec(Number(e.target.value))}
              className="mt-2 w-full accent-(--accent-orange)"
            />
            <div className="mt-1 flex justify-between text-[10px] text-(--text-muted)">
              <span>{t("plan.faster")}</span>
              <span>{t("plan.slower")}</span>
            </div>
          </div>

          {/* Aid time */}
          <div>
            <div className="flex items-baseline justify-between">
              <label htmlFor="aid" className="text-xs text-(--text-muted)">
                {t("plan.standTotal")}
              </label>
              <span className="font-mono text-sm font-bold text-(--text-primary)">
                {aidMin} min
              </span>
            </div>
            <input
              id="aid"
              type="range"
              min={0}
              max={45}
              step={1}
              value={aidMin}
              onChange={(e) => setAidMin(Number(e.target.value))}
              className="mt-2 w-full accent-(--accent-orange)"
            />
            <div className="mt-1 flex justify-between text-[10px] text-(--text-muted)">
              <span>{t("plan.keepMoving")}</span>
              <span>{t("plan.muchRest")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Finish headline */}
      <div className="flex items-center justify-between rounded-xl card-elevated bg-(--bg-card) px-5 py-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("plan.targetFinish")}
          </p>
          <p
            className={`mt-1 text-3xl font-bold ${
              subTen ? "text-(--accent)" : "text-(--accent-orange)"
            }`}
          >
            {elapsedToClock(plan.finishMin)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium uppercase tracking-wider text-(--text-muted)">
            {t("plan.inMoraAt")}
          </p>
          <p className="mt-1 font-mono text-xl text-(--text-secondary)">
            {timeOfDay(plan.finishMin)}
          </p>
          <p
            className={`mt-0.5 text-xs ${
              subTen ? "text-(--accent)" : "text-(--accent-orange)"
            }`}
          >
            {subTen
              ? t("plan.underSubTen", { t: elapsedToClock(600 - plan.finishMin) })
              : t("plan.overSubTen", { t: elapsedToClock(plan.finishMin - 600) })}
          </p>
        </div>
      </div>

      <CheckpointPacing plan={plan} />

      {/* Compact strip — the minimal version you'd laminate or wear on a wrist. */}
      <div className="rounded-xl card-elevated bg-(--bg-card) p-4 sm:p-5">
        <h3 className="text-sm font-medium text-(--text-muted)">
          {t("plan.strip")}
        </h3>
        <p className="mt-1 text-xs text-(--text-muted)">
          {t("plan.stripIntro")}
        </p>
        <div className="mt-4 overflow-x-auto">
          <div className="inline-flex min-w-full items-stretch divide-x divide-(--border-secondary) rounded-lg border border-(--border-secondary) font-mono">
            {plan.rows
              .filter((r) => r.km > 0)
              .map((r) => (
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
          {t("plan.shopSoon")}
        </p>
      </div>
    </div>
  );
}
