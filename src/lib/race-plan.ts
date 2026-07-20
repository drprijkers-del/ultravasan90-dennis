import { ULTRAVASAN_CHECKPOINTS } from "./mock-data";
import { RACE_DATE } from "./race-config";
import { AID_STATION_MIN, TARGET_TOTAL_MIN } from "./race-readiness";
import { elevationAtKm } from "./course-elevation";

// Intermediate aid stations = every checkpoint except start and finish.
const AID_STATIONS = ULTRAVASAN_CHECKPOINTS.length - 2;
export const RACE_KM = ULTRAVASAN_CHECKPOINTS[ULTRAVASAN_CHECKPOINTS.length - 1].km;

// Defaults: the pace a sub-10 needs at the modelled aid time, so the plan opens
// on the goal line and the user adjusts from there.
export const DEFAULT_AID_MIN = AID_STATION_MIN;
export const DEFAULT_PACE_MIN_KM =
  (TARGET_TOTAL_MIN - DEFAULT_AID_MIN) / RACE_KM;

// Heat cost. Below ~15C running is unaffected; above it pace fades. The rate is
// a judgement coefficient (~0.4% slower per degree), not a measurement — this
// athlete has no hot-weather data to fit — so it's a user-set scenario knob on
// the plan, deliberately kept out of the data-driven projection. Default 15C
// means no penalty, so the plan opens unchanged.
export const HEAT_NEUTRAL_C = 15;
export const DEFAULT_TEMP_C = HEAT_NEUTRAL_C;
const HEAT_PCT_PER_C = 0.4;

function heatFactor(tempC: number): number {
  return 1 + (Math.max(0, tempC - HEAT_NEUTRAL_C) * HEAT_PCT_PER_C) / 100;
}

// Terrain weighting. Splits are tilted by how much a segment climbs and drops,
// so the schedule expects you slower up the rolling first half and faster on the
// long descent into Mora — total time unchanged. Costs are in km-equivalents per
// metre: ~100 m of climb ≈ +0.8 km of effort, ~100 m of descent ≈ -0.3 km (a
// descent gives back far less than a climb takes). Coarse profile, so this is a
// realistic tilt, not a to-the-second split.
const CLIMB_KM_PER_M = 0.8 / 100;
const DESCENT_KM_PER_M = 0.3 / 100;

/** Ascent and descent (m) over a segment, sampled from the elevation profile. */
function segmentRelief(fromKm: number, toKm: number): { gain: number; loss: number } {
  let gain = 0;
  let loss = 0;
  let prev = elevationAtKm(fromKm);
  // Sample at ~1 km so rolling terrain isn't cancelled by checkpoint-net change.
  const steps = Math.max(1, Math.round(toKm - fromKm));
  for (let s = 1; s <= steps; s++) {
    const km = fromKm + ((toKm - fromKm) * s) / steps;
    const e = elevationAtKm(km);
    const d = e - prev;
    if (d > 0) gain += d;
    else loss += -d;
    prev = e;
  }
  return { gain, loss };
}

/**
 * Effort-weighted length of a segment in km-equivalents: flat distance plus a
 * climb penalty minus a smaller descent credit, floored so a steep drop never
 * makes a segment "negative distance".
 */
function effortKm(distKm: number, gain: number, loss: number): number {
  const adjusted = distKm + gain * CLIMB_KM_PER_M - loss * DESCENT_KM_PER_M;
  return Math.max(distKm * 0.5, adjusted);
}

const START_HOUR = RACE_DATE.getHours();
const START_MIN = RACE_DATE.getMinutes();

/** Elapsed minutes as h:mm. */
export function elapsedToClock(min: number): string {
  const total = Math.round(min);
  return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}

/** Wall-clock time of day given the race start. */
export function timeOfDay(min: number): string {
  const t = Math.round(START_HOUR * 60 + START_MIN + min);
  const h = Math.floor(t / 60) % 24;
  const m = t % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// Carbs come in from the first station and keep coming — the point is not to
// wait for the legs to complain. Stations sit ~11 km apart, further than one
// gel covers, so the plan carries gels for the gaps and refills/eats on arrival.
// Returns an i18n key suffix; the component resolves it under `plan.*`.
export type FuelKey = "fuelNone" | "fuelFirst" | "fuelStation" | "fuelFinish";

function fuelNote(idx: number, isFinish: boolean): FuelKey {
  if (isFinish) return "fuelFinish";
  if (idx === 0) return "fuelNone";
  if (idx === 1) return "fuelFirst";
  return "fuelStation";
}

export interface PlanRow {
  name: string;
  km: number;
  /** Average pace of the segment leading into this checkpoint, min/km. */
  segPace: number;
  /** Cumulative elapsed minutes from the start. */
  arrival: number;
  isFinish: boolean;
  /** i18n key suffix resolved under `plan.*`. */
  fuel: FuelKey;
}

export interface RacePlan {
  rows: PlanRow[];
  /** Effective running pace after the heat adjustment, min/km. */
  paceMinKm: number;
  /** Pace the user set, before heat, min/km. */
  basePaceMinKm: number;
  aidTotalMin: number;
  tempC: number;
  /** Minutes added by heat vs a neutral-temperature run (0 at/below 15C). */
  heatMin: number;
  finishMin: number;
}

/**
 * Build the checkpoint schedule for a chosen running pace, total standing time
 * and expected temperature. Moving time is even by distance at the heat-adjusted
 * pace; `aidTotalMin` is spread evenly across the stations reached so far. This
 * is a target/deadline plan, not the fade-aware projection on the progress page
 * — even splits are what you pace off, and the first half being hillier is a
 * caveat, not a per-segment model.
 */
export function computePlan(
  basePaceMinKm: number,
  aidTotalMin: number,
  tempC: number = DEFAULT_TEMP_C
): RacePlan {
  const paceMinKm = basePaceMinKm * heatFactor(tempC);
  const aidPerStation = aidTotalMin / AID_STATIONS;

  // Total moving budget stays fixed; terrain only redistributes it across
  // segments, so the finish time is unchanged by the weighting.
  const movingBudget = RACE_KM * paceMinKm;
  const segments = ULTRAVASAN_CHECKPOINTS.slice(1).map((cp, i) => {
    const prevKm = ULTRAVASAN_CHECKPOINTS[i].km;
    const dist = cp.km - prevKm;
    const { gain, loss } = segmentRelief(prevKm, cp.km);
    return { dist, effort: effortKm(dist, gain, loss) };
  });
  const totalEffort = segments.reduce((s, x) => s + x.effort, 0);

  let cumMoving = 0;
  const rows: PlanRow[] = ULTRAVASAN_CHECKPOINTS.map((cp, idx) => {
    const isFinish = idx === ULTRAVASAN_CHECKPOINTS.length - 1;
    const stationsReached = Math.min(idx, AID_STATIONS);
    if (idx > 0) {
      cumMoving += (segments[idx - 1].effort / totalEffort) * movingBudget;
    }
    const arrival = cumMoving + stationsReached * aidPerStation;
    const seg = idx > 0 ? segments[idx - 1] : null;
    const segMoving = seg ? (seg.effort / totalEffort) * movingBudget : 0;
    return {
      name: cp.name,
      km: cp.km,
      segPace: seg && seg.dist > 0 ? segMoving / seg.dist : 0,
      arrival,
      isFinish,
      fuel: fuelNote(idx, isFinish),
    };
  });

  return {
    rows,
    paceMinKm,
    basePaceMinKm,
    aidTotalMin,
    tempC,
    heatMin: (paceMinKm - basePaceMinKm) * RACE_KM,
    finishMin: movingBudget + aidTotalMin,
  };
}
