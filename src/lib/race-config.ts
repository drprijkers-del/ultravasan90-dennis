// Ultravasan race configuration

// Race date: August 15, 2026 (Ultravasan 90)
export const RACE_DATE = new Date("2026-08-15T05:00:00+02:00");
export const RACE_NAME = "Ultravasan 90";
export const RACE_DISTANCE_KM = 92;

// Training
export const TRAINING_TARGET_KM = 3000;
export const TRAINING_START_DATE = new Date("2025-11-01");

// Training targets
export const TARGET_BAND = { min: 45, max: 65 } as const; // weekly km
export const LONGRUN_KM = 15;
export const CONSISTENCY_RUNS = 3; // min runs per week for streak
export const SAFE_DELAY_MINUTES = 2;
export const EARTH_CIRCUMFERENCE_KM = 40075;

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
  if (!minPerKm || minPerKm <= 0) return "\u2014";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return h > 0 ? `${h}u ${m}m` : `${m}m`;
}

export function distanceFunFact(km: number): string {
  if (km >= 42) return "Dat is een marathon!";
  if (km >= 30) return "Amsterdam \u2192 Zandvoort en terug";
  if (km >= 20) return "Amsterdam \u2192 Haarlem";
  if (km >= 15) return "Rondje Amersfoort Vathorst";
  if (km >= 10) return "Centraal \u2192 Amstelveen";
  if (km >= 5) return "Rondje Vondelpark";
  return "Lekker gelopen!";
}
