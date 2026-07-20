import { ULTRAVASAN_CHECKPOINTS } from "./mock-data";
import { RACE_DATE } from "./race-config";
import { AID_STATION_MIN, TARGET_TOTAL_MIN } from "./race-readiness";

// Intermediate aid stations = every checkpoint except start and finish.
const AID_STATIONS = ULTRAVASAN_CHECKPOINTS.length - 2;
export const RACE_KM = ULTRAVASAN_CHECKPOINTS[ULTRAVASAN_CHECKPOINTS.length - 1].km;

// Defaults: the pace a sub-10 needs at the modelled aid time, so the plan opens
// on the goal line and the user adjusts from there.
export const DEFAULT_AID_MIN = AID_STATION_MIN;
export const DEFAULT_PACE_MIN_KM =
  (TARGET_TOTAL_MIN - DEFAULT_AID_MIN) / RACE_KM;

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
function fuelNote(idx: number, isFinish: boolean): string {
  if (isFinish) return "Binnen — klaar";
  if (idx === 0) return "Nog niets nodig";
  if (idx === 1) return "Eerste gel + drinken";
  return "Vullen, eten + gel mee voor onderweg";
}

export interface PlanRow {
  name: string;
  km: number;
  /** Average pace of the segment leading into this checkpoint, min/km. */
  segPace: number;
  /** Cumulative elapsed minutes from the start. */
  arrival: number;
  isFinish: boolean;
  fuel: string;
}

export interface RacePlan {
  rows: PlanRow[];
  paceMinKm: number;
  aidTotalMin: number;
  finishMin: number;
}

/**
 * Build the checkpoint schedule for a chosen running pace and total standing
 * time. Moving time is even by distance at `paceMinKm`; `aidTotalMin` is spread
 * evenly across the stations reached so far. This is a target/deadline plan, not
 * the fade-aware projection on the progress page — even splits are what you pace
 * off, and the first half being hillier is a caveat, not a per-segment model.
 */
export function computePlan(
  paceMinKm: number,
  aidTotalMin: number
): RacePlan {
  const aidPerStation = aidTotalMin / AID_STATIONS;

  const rows: PlanRow[] = ULTRAVASAN_CHECKPOINTS.map((cp, idx) => {
    const isFinish = idx === ULTRAVASAN_CHECKPOINTS.length - 1;
    const stationsReached = Math.min(idx, AID_STATIONS);
    const arrival = cp.km * paceMinKm + stationsReached * aidPerStation;
    const prevKm = idx === 0 ? 0 : ULTRAVASAN_CHECKPOINTS[idx - 1].km;
    const prevStations = Math.min(Math.max(idx - 1, 0), AID_STATIONS);
    const prevArrival =
      idx === 0 ? 0 : prevKm * paceMinKm + prevStations * aidPerStation;
    const segKm = cp.km - prevKm;
    return {
      name: cp.name,
      km: cp.km,
      segPace: segKm > 0 ? (arrival - prevArrival) / segKm : 0,
      arrival,
      isFinish,
      fuel: fuelNote(idx, isFinish),
    };
  });

  return {
    rows,
    paceMinKm,
    aidTotalMin,
    finishMin: RACE_KM * paceMinKm + aidTotalMin,
  };
}
