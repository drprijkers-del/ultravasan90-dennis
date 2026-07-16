/**
 * Race Readiness helpers for Ultravasan 90
 *
 * These functions interpret existing Strava data.
 * They do NOT predict finish times or simulate race performance.
 *
 * Assumptions are documented inline.
 */

import type { WeeklyData, ActivityData } from "./types";
import { RACE_DISTANCE_KM } from "./race-config";

// --- Types ---

export type ReadinessStatus = "green" | "yellow" | "red";

export interface ReadinessResult {
  status: ReadinessStatus;
  reasons: string[];
}

export interface PaceFadeEntry {
  date: string;
  name: string;
  distanceKm: number;
  durationMin: number;
  paceMinKm: number;
}

export interface FatiguePoint {
  weekLabel: string;
  weekKm: number;
  longRunPace: number;
  longRunDate: string;
  longRunKm: number;
}

// --- Constants ---

// Minimum 2.5 hours (150 min) or 25 km to count as "significant" long run
const SIGNIFICANT_LONG_RUN_MIN = 150;
const SIGNIFICANT_LONG_RUN_KM = 25;

// 3 hours (180 min) threshold for readiness classification
const THREE_HOUR_MIN = 180;

// 3.5 hours (210 min) threshold for green status
const THREE_HALF_HOUR_MIN = 210;

// --- Helper Functions ---

/**
 * Compute rolling average over a window of weekly km data.
 * Returns an array of { label, avg } with the same length as input.
 */
export function rollingAverage(
  weekly: WeeklyData[],
  window: number
): Array<{ label: string; avg: number }> {
  return weekly.map((w, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = weekly.slice(start, i + 1);
    const avg = slice.reduce((s, x) => s + x.totalKm, 0) / slice.length;
    return { label: w.label, avg: Math.round(avg * 10) / 10 };
  });
}

/**
 * Check if 4-week rolling average is trending up or stable.
 * Compares last 4-week avg vs previous 4-week avg.
 * Returns positive = improving, negative = declining.
 */
export function volumeTrend(weekly: WeeklyData[]): number | null {
  if (weekly.length < 8) return null;
  const recent4 = weekly.slice(-4);
  const prev4 = weekly.slice(-8, -4);
  const recentAvg = recent4.reduce((s, w) => s + w.totalKm, 0) / 4;
  const prevAvg = prev4.reduce((s, w) => s + w.totalKm, 0) / 4;
  // Percentage change
  return prevAvg > 0 ? ((recentAvg - prevAvg) / prevAvg) * 100 : null;
}

/**
 * Long Run Durability: max distance and max time-on-feet in last N weeks.
 */
export function longRunDurability(
  activities: ActivityData[],
  weeksBack: number
): { maxDistanceKm: number; maxDurationMin: number; count: number } {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - weeksBack * 7);

  const recent = activities.filter(
    (a) => a.isLongRun && new Date(a.date) >= cutoff
  );

  if (recent.length === 0) {
    return { maxDistanceKm: 0, maxDurationMin: 0, count: 0 };
  }

  return {
    maxDistanceKm: Math.max(...recent.map((a) => a.distanceKm)),
    maxDurationMin: Math.max(...recent.map((a) => a.movingTimeMin)),
    count: recent.length,
  };
}

/**
 * Pace stability across long runs.
 * Without per-km split data, we measure run-to-run pace consistency.
 * Returns coefficient of variation (lower = more consistent).
 *
 * Assumption: overall pace per run is the best available proxy.
 * Per-km splits would give intra-run fade, but Strava list endpoint
 * doesn't provide splits.
 */
export function paceStability(longRuns: ActivityData[]): {
  entries: PaceFadeEntry[];
  coefficientOfVariation: number | null;
} {
  const entries: PaceFadeEntry[] = longRuns
    .filter((a) => a.isLongRun)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((a) => ({
      date: a.date,
      name: a.name,
      distanceKm: a.distanceKm,
      durationMin: a.movingTimeMin,
      paceMinKm: a.paceMinKm,
    }));

  if (entries.length < 3) {
    return { entries, coefficientOfVariation: null };
  }

  const paces = entries.map((e) => e.paceMinKm);
  const mean = paces.reduce((s, p) => s + p, 0) / paces.length;
  const variance =
    paces.reduce((s, p) => s + (p - mean) ** 2, 0) / paces.length;
  const stdDev = Math.sqrt(variance);

  return {
    entries,
    // CV as percentage: lower = more stable
    coefficientOfVariation:
      mean > 0 ? Math.round((stdDev / mean) * 100 * 10) / 10 : null,
  };
}

/**
 * Fatigue context: scatter data for week volume vs long run pace.
 * Same pace at higher volume = positive adaptation signal.
 */
export function fatigueContext(
  weekly: WeeklyData[],
  activities: ActivityData[]
): FatiguePoint[] {
  const points: FatiguePoint[] = [];

  // Group activities by ISO week label
  for (const week of weekly) {
    const weekLongRuns = activities.filter((a) => {
      if (!a.isLongRun) return false;
      // Match activity date to week label
      const d = new Date(a.date);
      const weekLabel = getISOWeekLabel(d);
      return weekLabel === week.label || `'25 ${weekLabel}` === week.label;
    });

    for (const lr of weekLongRuns) {
      points.push({
        weekLabel: week.label,
        weekKm: week.totalKm,
        longRunPace: lr.paceMinKm,
        longRunDate: lr.date,
        longRunKm: lr.distanceKm,
      });
    }
  }

  return points;
}

function getISOWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const yearStart = new Date(d.getFullYear(), 0, 4);
  const weekNum =
    1 +
    Math.round(
      ((d.getTime() - yearStart.getTime()) / 86400000 -
        3 +
        ((yearStart.getDay() + 6) % 7)) /
        7
    );
  return `W${weekNum}`;
}

/**
 * Data Reliability: how much data do we have to work with?
 */
export function dataReliability(
  weekly: WeeklyData[],
  activities: ActivityData[]
): {
  weeksOfData: number;
  longRunsOver3h: number;
  longRunsOver2h: number;
  totalLongRuns: number;
} {
  const longRuns = activities.filter((a) => a.isLongRun);
  return {
    weeksOfData: weekly.length,
    longRunsOver3h: longRuns.filter((a) => a.movingTimeMin >= THREE_HOUR_MIN).length,
    longRunsOver2h: longRuns.filter((a) => a.movingTimeMin >= 120).length,
    totalLongRuns: longRuns.length,
  };
}

/**
 * Classify overall readiness as traffic light.
 *
 * Rules (from spec):
 * - Green: ≥8 weeks data, 4w avg stable/rising, ≥1 run ≥3.5h, pace stable
 * - Yellow: volume OK but long runs short, or pace unstable, or big fluctuations
 * - Red: <6 weeks, strong peaks/valleys, no runs >3h, inconsistent
 */
export function classifyReadiness(
  weekly: WeeklyData[],
  activities: ActivityData[]
): ReadinessResult {
  const reasons: string[] = [];
  const weeks = weekly.length;
  const trend = volumeTrend(weekly);
  const durability = longRunDurability(activities, 6);
  const stability = paceStability(activities);
  const reliability = dataReliability(weekly, activities);

  // Evaluate conditions
  const hasEnoughWeeks = weeks >= 8;
  const trendStableOrUp = trend !== null && trend >= -5; // Allow small dip
  const hasLongEnoughRun = durability.maxDurationMin >= THREE_HALF_HOUR_MIN;
  const hasRun3h = durability.maxDurationMin >= THREE_HOUR_MIN;
  const paceIsStable =
    stability.coefficientOfVariation !== null &&
    stability.coefficientOfVariation < 5; // CV < 5% = very stable

  // Week-to-week fluctuation check
  const last8 = weekly.slice(-8);
  let maxFluctuation = 0;
  for (let i = 1; i < last8.length; i++) {
    const prev = last8[i - 1].totalKm;
    const curr = last8[i].totalKm;
    if (prev > 0) {
      const change = Math.abs((curr - prev) / prev) * 100;
      maxFluctuation = Math.max(maxFluctuation, change);
    }
  }
  const hasLargeFluctuations = maxFluctuation > 40;

  // --- Classification ---

  // Red conditions
  if (weeks < 6) {
    reasons.push(`Nog maar ${weeks} weken data (minimaal 6 nodig)`);
    return { status: "red", reasons };
  }

  if (!hasRun3h && reliability.totalLongRuns < 3) {
    reasons.push("Te weinig lange duurlopen voor een betrouwbare inschatting");
    return { status: "red", reasons };
  }

  if (hasLargeFluctuations && !trendStableOrUp) {
    reasons.push("Grote schommelingen in weekvolume en dalende trend");
    return { status: "red", reasons };
  }

  // Green conditions
  if (hasEnoughWeeks && trendStableOrUp && hasLongEnoughRun && paceIsStable) {
    reasons.push("Consistent volume met stabiele of stijgende trend");
    if (durability.maxDurationMin >= THREE_HALF_HOUR_MIN) {
      reasons.push(
        `Langste duurloop: ${Math.round(durability.maxDurationMin)} min (${durability.maxDistanceKm.toFixed(1)} km)`
      );
    }
    reasons.push(
      `Tempo-variatie: ${stability.coefficientOfVariation}% (stabiel)`
    );
    return { status: "green", reasons };
  }

  // Yellow: everything else
  if (!hasEnoughWeeks) {
    reasons.push(`${weeks} weken data — meer data geeft betrouwbaarder beeld`);
  }
  if (!hasLongEnoughRun) {
    reasons.push(
      `Langste run: ${Math.round(durability.maxDurationMin)} min — ≥3.5 uur is wenselijk`
    );
  }
  if (stability.coefficientOfVariation !== null && !paceIsStable) {
    reasons.push(
      `Tempo-variatie: ${stability.coefficientOfVariation}% — focus op gelijkmatiger tempo`
    );
  }
  if (hasLargeFluctuations) {
    reasons.push("Week-tot-week volume schommelt sterk");
  }
  if (trend !== null && !trendStableOrUp) {
    reasons.push("Volume trend is dalend");
  }

  return { status: "yellow", reasons };
}

// --- Race finish projection ---

// Goal: sub 10 hours on Ultravasan 90.
const TARGET_HOURS = 10;
export const TARGET_TOTAL_MIN = TARGET_HOURS * 60;

// Course facts (vasaloppet.se): 92 km with 867 m of ascent, made up of
// ~60 km forest road, 18 km trail, 6 km gravel and 6 km asphalt.
export const COURSE_ASCENT_M = 867;

// Nine aid stations. The original 35 min (~4 min each) is optimistic for a
// first 92 km; 45 min still assumes you keep moving with intent.
export const AID_STATION_MIN = 45;

// Required moving pace to hit the goal once aid-station time is removed.
export const TARGET_PACE = (TARGET_TOTAL_MIN - AID_STATION_MIN) / RACE_DISTANCE_KM;

// Riegel exponents. 1.06 models road racing; ultras fade harder than that.
// The spread is what turns one false-precision number into an honest range.
const RIEGEL = { low: 1.08, mid: 1.13, high: 1.18 } as const;

// Surface cost. Only 18 of 92 km is genuine trail — 60 km is forest road, which
// runs close to road pace, plus 6 km gravel and 6 km asphalt. So the penalty
// against a pavement-trained runner is real but small. The direction is certain
// and the magnitude is a judgement call, which is why it spans the range instead
// of pretending to a single coefficient.
const SURFACE_PENALTY = { low: 0.015, mid: 0.03, high: 0.05 } as const;

// Climbing above what the basis run already contains, at ~45 s per 100 m of
// ascent for a trained runner at ultra effort.
const CLIMB_MIN_PER_100M = 0.75;

// A basis run has to be a genuine long run, not a Sunday shuffle that
// isLongRun happens to flag.
const BASIS_MIN_KM = 25;
// Wide enough that the peak block is still in scope on race day, so that
// tapering doesn't make the projection drift upwards.
const BASIS_WINDOW_WEEKS = 16;
// Used only when no run in the window reports elevation.
const FALLBACK_ASCENT_M_PER_KM = 4;

export interface FinishProjection {
  hasData: boolean;
  runsUsed: number;
  avgPace: number;
  projectedTotalMin: number;
  diffMin: number;
  isOnTarget: boolean;
  /** Optimistic end of the range: least fade, least surface cost. */
  lowMin: number;
  /** Pessimistic end of the range: most fade, most surface cost. */
  highMin: number;
  /** The run the projection is extrapolated from. */
  basisKm: number;
  basisDate: string;
}

/**
 * One finish estimate for a given fade exponent and surface penalty.
 *
 * Riegel extrapolates the basis run to race distance; the surface and climb
 * terms then price in the difference between where you train and where you
 * race. Heat is deliberately absent — nothing in the activity data supports
 * modelling it, so it stays a caveat rather than a fabricated number.
 */
function estimate(
  basisKm: number,
  basisMovingMin: number,
  trainingAscentPerKm: number,
  exponent: number,
  surfacePenalty: number
): number {
  const moving = basisMovingMin * Math.pow(RACE_DISTANCE_KM / basisKm, exponent);
  const surface = moving * surfacePenalty;
  const alreadyInBasis = trainingAscentPerKm * RACE_DISTANCE_KM;
  const excessAscent = Math.max(0, COURSE_ASCENT_M - alreadyInBasis);
  const climb = (excessAscent / 100) * CLIMB_MIN_PER_100M;
  return moving + surface + climb + AID_STATION_MIN;
}

const NO_PROJECTION: FinishProjection = {
  hasData: false,
  runsUsed: 0,
  avgPace: 0,
  projectedTotalMin: 0,
  diffMin: 0,
  isOnTarget: false,
  lowMin: 0,
  highMin: 0,
  basisKm: 0,
  basisDate: "",
};

/**
 * Project a finish time as it would have looked on a given date.
 *
 * Extrapolates the longest long run in the trailing window to race distance
 * with a fade exponent, then adds the measured elevation difference, a surface
 * allowance and aid-station time. Taking the longest run rather than a recent
 * average means the estimate is driven by the most informative run available
 * and doesn't decay during a taper.
 *
 * `asOf` makes the function reusable for historical timelines.
 */
export function projectFinishFrom(
  activities: ActivityData[],
  asOf: Date
): FinishProjection {
  const longRuns = activities
    .filter((a) => a.isLongRun && new Date(a.date) <= asOf)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (longRuns.length === 0) return NO_PROJECTION;

  const windowStart = new Date(asOf);
  windowStart.setDate(windowStart.getDate() - BASIS_WINDOW_WEEKS * 7);
  const inWindow = longRuns.filter((a) => new Date(a.date) >= windowStart);

  const genuine = inWindow.filter((a) => a.distanceKm >= BASIS_MIN_KM);
  const pool = genuine.length > 0 ? genuine : inWindow;
  if (pool.length === 0) return NO_PROJECTION;

  const basis = pool.reduce((a, b) => (b.distanceKm > a.distanceKm ? b : a));

  const withElevation = inWindow.filter(
    (a) => a.elevation !== null && a.distanceKm > 0
  );
  const trainingAscentPerKm =
    withElevation.length > 0
      ? withElevation.reduce(
          (s, a) => s + (a.elevation as number) / a.distanceKm,
          0
        ) / withElevation.length
      : FALLBACK_ASCENT_M_PER_KM;

  const at = (exponent: number, penalty: number) =>
    estimate(
      basis.distanceKm,
      basis.movingTimeMin,
      trainingAscentPerKm,
      exponent,
      penalty
    );

  const projectedTotalMin = at(RIEGEL.mid, SURFACE_PENALTY.mid);

  // The pace tile keeps its own meaning: recent long-run average, which is a
  // training stat rather than the projection basis.
  const recent = longRuns.slice(-5);
  const avgPace = recent.reduce((s, a) => s + a.paceMinKm, 0) / recent.length;

  return {
    hasData: true,
    runsUsed: recent.length,
    avgPace,
    projectedTotalMin,
    diffMin: projectedTotalMin - TARGET_TOTAL_MIN,
    isOnTarget: projectedTotalMin <= TARGET_TOTAL_MIN,
    lowMin: at(RIEGEL.low, SURFACE_PENALTY.low),
    highMin: at(RIEGEL.high, SURFACE_PENALTY.high),
    basisKm: basis.distanceKm,
    basisDate: basis.date,
  };
}

/** Project a finish time from the current training data. */
export function projectFinishTime(activities: ActivityData[]): FinishProjection {
  return projectFinishFrom(activities, new Date());
}
