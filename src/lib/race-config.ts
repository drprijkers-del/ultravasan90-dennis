// Ultravasan race configuration

// Race date: August 15, 2026 (Ultravasan 90)
export const RACE_DATE = new Date("2026-08-15T05:00:00+02:00");
export const RACE_NAME = "Ultravasan 90";
export const RACE_DISTANCE_KM = 92;

// Training
export const TRAINING_TARGET_KM = 3000;
export const TRAINING_START_DATE = new Date("2025-11-01");

export type TrainingPhase = "in_training" | "race_day" | "finished";

export function getTrainingPhase(): TrainingPhase {
  const now = new Date();
  const raceStart = RACE_DATE;
  const raceEnd = new Date(RACE_DATE.getTime() + 24 * 60 * 60 * 1000);

  if (now < raceStart) return "in_training";
  if (now <= raceEnd) return "race_day";
  return "finished";
}

export function getCountdown() {
  const now = new Date();
  const diff = RACE_DATE.getTime() - now.getTime();
  const phase = getTrainingPhase();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, phase };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, phase };
}

export function formatPace(minPerKm: number): string {
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}u ${m}m` : `${m}m`;
}
