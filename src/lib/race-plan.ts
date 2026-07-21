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

// Fuelling. The race-day challenge is avoiding a carbohydrate deficit — the 50k
// fade was empty-tank, not fitness. Target carbs/hour is the knob; gels are the
// primary vehicle, with sports drink assumed to cover a steady baseline so gels
// fill the rest. Assumptions, all tunable at the top here:
export const DEFAULT_CARBS_PER_HOUR = 70; // g/h target
export const GEL_CARBS = 22; // SiS GO Isotonic, g each
const DRINK_CARBS_PER_HOUR = 25; // g/h from sipping the 2:1 flask
const FLUID_L_PER_HOUR = 0.6; // baseline; more in heat
export const VEST_GELS = 18; // gels carried at the start
// Partner meets near halfway to reset flasks and gels; the checkpoint at/after
// this distance is flagged. Evertsberg (47 km) is the classic mid-point.
const PARTNER_KM = RACE_KM / 2;
// Past this point gels turn sickening — stations should push real food.
const REAL_FOOD_FROM_KM = 60;

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

// Fuel action per checkpoint, as an i18n key suffix resolved under `plan.*`.
// The concrete gel count is carried separately on the row.
export type FuelKey =
  | "fuelStart"
  | "fuelDrink"
  | "fuelPartner"
  | "fuelFood"
  | "fuelFinish";

function fuelAction(km: number, isFinish: boolean, isPartner: boolean): FuelKey {
  if (isFinish) return "fuelFinish";
  if (km === 0) return "fuelStart";
  if (isPartner) return "fuelPartner";
  if (km >= REAL_FOOD_FROM_KM) return "fuelFood";
  return "fuelDrink";
}

export interface PlanRow {
  name: string;
  km: number;
  /** Average pace of the segment leading into this checkpoint, min/km. */
  segPace: number;
  /** Cumulative elapsed minutes from the start. */
  arrival: number;
  isFinish: boolean;
  /** Gels to take in the segment leading into this checkpoint. */
  gels: number;
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
  // --- Fuelling ---
  carbsPerHour: number;
  /** Total carbohydrate over the race, g. */
  totalCarbs: number;
  /** Total gels the plan calls for. */
  totalGels: number;
  /** Gels carried in the vest at the start. */
  vestGels: number;
  /** Total fluid, litres (baseline; more in heat). */
  fluidL: number;
}

/**
 * Build the checkpoint schedule for a chosen running pace, standing time,
 * temperature and carbohydrate target. Moving time is redistributed across
 * segments by terrain (fixed total); each segment's gel count comes from its
 * duration and the carbs/hour target, with sports drink assumed to cover a
 * steady baseline so gels fill the remainder.
 */
export function computePlan(
  basePaceMinKm: number,
  aidTotalMin: number,
  tempC: number = DEFAULT_TEMP_C,
  carbsPerHour: number = DEFAULT_CARBS_PER_HOUR
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

  // Gels cover the carb target above what the drink baseline supplies.
  const gelCarbsPerHour = Math.max(0, carbsPerHour - DRINK_CARBS_PER_HOUR);

  // The first checkpoint at/after halfway is the partner reset.
  const partnerIdx = ULTRAVASAN_CHECKPOINTS.findIndex(
    (cp, i) => i > 0 && cp.km >= PARTNER_KM
  );

  let cumMoving = 0;
  let prevArrival = 0;
  let totalGels = 0;
  const rows: PlanRow[] = ULTRAVASAN_CHECKPOINTS.map((cp, idx) => {
    const isFinish = idx === ULTRAVASAN_CHECKPOINTS.length - 1;
    const stationsReached = Math.min(idx, AID_STATIONS);
    if (idx > 0) {
      cumMoving += (segments[idx - 1].effort / totalEffort) * movingBudget;
    }
    const arrival = cumMoving + stationsReached * aidPerStation;
    const seg = idx > 0 ? segments[idx - 1] : null;
    const segMoving = seg ? (seg.effort / totalEffort) * movingBudget : 0;
    const segHours = (arrival - prevArrival) / 60;
    const gels = idx === 0 ? 0 : Math.round((gelCarbsPerHour * segHours) / GEL_CARBS);
    prevArrival = arrival;
    totalGels += gels;
    return {
      name: cp.name,
      km: cp.km,
      segPace: seg && seg.dist > 0 ? segMoving / seg.dist : 0,
      arrival,
      isFinish,
      gels,
      fuel: fuelAction(cp.km, isFinish, idx === partnerIdx),
    };
  });

  const finishMin = movingBudget + aidTotalMin;
  const finishHours = finishMin / 60;

  return {
    rows,
    paceMinKm,
    basePaceMinKm,
    aidTotalMin,
    tempC,
    heatMin: (paceMinKm - basePaceMinKm) * RACE_KM,
    finishMin,
    carbsPerHour,
    totalCarbs: Math.round(carbsPerHour * finishHours),
    totalGels,
    vestGels: VEST_GELS,
    fluidL: Math.round(FLUID_L_PER_HOUR * finishHours * 10) / 10,
  };
}
