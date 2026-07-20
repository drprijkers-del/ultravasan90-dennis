import { ULTRAVASAN_CHECKPOINTS } from "./mock-data";
import { RACE_DATE } from "./race-config";
import { AID_STATION_MIN, TARGET_TOTAL_MIN } from "./race-readiness";

// Intermediate aid stations = every checkpoint except start and finish.
const AID_STATIONS = ULTRAVASAN_CHECKPOINTS.length - 2;
const RACE_KM = ULTRAVASAN_CHECKPOINTS[ULTRAVASAN_CHECKPOINTS.length - 1].km;

// Sub-10 splits: distribute the moving budget evenly by distance and the aid
// allowance evenly across the stations reached so far. Even-by-distance is a
// first-order plan — the first half is hillier, so treat the early splits as
// ceilings and bank a little time on the flatter run into Mora.
const MOVING_BUDGET_MIN = TARGET_TOTAL_MIN - AID_STATION_MIN;
export const MOVING_PACE = MOVING_BUDGET_MIN / RACE_KM;
const AID_PER_STATION = AID_STATION_MIN / AID_STATIONS;

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

// The plan is fully determined by the fixed course and the sub-10 target, so
// build it once at module scope.
export const CHECKPOINT_PLAN: PlanRow[] = ULTRAVASAN_CHECKPOINTS.map(
  (cp, idx) => {
    const isFinish = idx === ULTRAVASAN_CHECKPOINTS.length - 1;
    const stationsReached = Math.min(idx, AID_STATIONS);
    const arrival = cp.km * MOVING_PACE + stationsReached * AID_PER_STATION;
    const prevKm = idx === 0 ? 0 : ULTRAVASAN_CHECKPOINTS[idx - 1].km;
    const prevArrival =
      idx === 0
        ? 0
        : prevKm * MOVING_PACE +
          Math.min(idx - 1, AID_STATIONS) * AID_PER_STATION;
    const segKm = cp.km - prevKm;
    return {
      name: cp.name,
      km: cp.km,
      segPace: segKm > 0 ? (arrival - prevArrival) / segKm : 0,
      arrival,
      isFinish,
      fuel: fuelNote(idx, isFinish),
    };
  }
);
