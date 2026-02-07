// Mock data for demo mode — realistic 2026 Ultravasan 90 training

import {
  TARGET_BAND,
  EARTH_CIRCUMFERENCE_KM,
  CONSISTENCY_RUNS,
} from "./race-config";

export function isMockMode(): boolean {
  return !process.env.STRAVA_CLIENT_ID || !process.env.DATABASE_URL;
}

// --- Types ---

export interface WeeklyData {
  year: number;
  week: number;
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
  avgHeartrate: number;
  totalElevation: number;
  longestRunKm: number;
}

export interface MonthlyData {
  year: number;
  month: number;
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
  avgHeartrate: number;
  totalElevation: number;
}

export interface LongRunData {
  date: string;
  name: string;
  distanceKm: number;
  paceMinKm: number;
  movingTimeMin: number;
  heartrate: number | null;
  elevation: number | null;
}

export interface SummaryData {
  totalKm: number;
  targetKm: number;
  weeklyAvgKm: number;
  longestRunKm: number;
  totalRuns: number;
  weeksUntilRace: number;
  avgHeartrate: number;
  avgPaceMinKm: number;
  totalElevation: number;
  currentStreak: number;
  totalHours: number;
}

// --- Home data (for dashboard) ---

export interface HomeData {
  currentWeek: { km: number; runs: number; hours: number };
  lastLongRun: { date: string; km: number; pace: number; name: string; polyline: string | null } | null;
  consistencyStreak: number;
  totalSinceNov: { km: number; pctEarth: number };
  status: "op_schema" | "achter_op_schema";
  rollingAvgKm: number;
}

export interface ActivityData {
  id: number;
  date: string;
  name: string;
  distanceKm: number;
  movingTimeMin: number;
  paceMinKm: number;
  heartrate: number | null;
  maxHeartrate: number | null;
  elevation: number | null;
  isLongRun: boolean;
  isSunday: boolean;
  dayOfWeek: number;
  stravaId: string;
}

// Seeded pseudo-random for consistent demo data across page loads
function sr(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// Weekly data: 16 weeks from 2025-W44 (Nov 2025) through 2026-W6
// ---------------------------------------------------------------------------
// Phase plan:
//   W44-W47 (Nov):  early base building, 30-42 km/week
//   W48-W52 (Dec):  base building ramp, 36-50 km/week, W50 recovery, W52 holiday
//   W01-W03 (Jan):  build phase, 38-48 km/week, W03 recovery
//   W04-W06 (Feb):  continued build, 46-55 km/week, W06 current (partial)
// ---------------------------------------------------------------------------

export function getMockWeeklyData(): WeeklyData[] {
  const plan: Array<{
    year: number;
    week: number;
    label: string;
    km: number;
    hr: number;
    pace: number;
    elev: number;
    runs: number;
    long: number;
  }> = [
    // --- 2025 November: early base ---
    { year: 2025, week: 44, label: "'25 W44", km: 30, hr: 148, pace: 6.12, elev: 180, runs: 3, long: 12.5 },
    { year: 2025, week: 45, label: "'25 W45", km: 35, hr: 146, pace: 6.05, elev: 220, runs: 3, long: 14.0 },
    { year: 2025, week: 46, label: "'25 W46", km: 38, hr: 145, pace: 6.00, elev: 250, runs: 4, long: 15.2 },
    { year: 2025, week: 47, label: "'25 W47", km: 42, hr: 144, pace: 5.95, elev: 280, runs: 4, long: 16.5 },

    // --- 2025 December: base ramp ---
    { year: 2025, week: 48, label: "'25 W48", km: 45, hr: 143, pace: 5.92, elev: 310, runs: 4, long: 17.8 },
    { year: 2025, week: 49, label: "'25 W49", km: 48, hr: 142, pace: 5.88, elev: 350, runs: 4, long: 18.5 },
    { year: 2025, week: 50, label: "'25 W50", km: 36, hr: 146, pace: 6.02, elev: 220, runs: 3, long: 14.0 }, // recovery
    { year: 2025, week: 51, label: "'25 W51", km: 50, hr: 141, pace: 5.85, elev: 380, runs: 5, long: 19.0 },
    { year: 2025, week: 52, label: "'25 W52", km: 38, hr: 145, pace: 5.98, elev: 240, runs: 3, long: 15.5 }, // holiday

    // --- 2026 January: build phase ---
    { year: 2026, week: 1, label: "W1", km: 42, hr: 142, pace: 5.88, elev: 320, runs: 4, long: 18.2 },
    { year: 2026, week: 2, label: "W2", km: 48, hr: 140, pace: 5.82, elev: 380, runs: 4, long: 20.5 },
    { year: 2026, week: 3, label: "W3", km: 38, hr: 144, pace: 5.95, elev: 260, runs: 3, long: 16.8 }, // recovery
    { year: 2026, week: 4, label: "W4", km: 52, hr: 139, pace: 5.78, elev: 420, runs: 5, long: 22.0 },

    // --- 2026 February: continued build ---
    { year: 2026, week: 5, label: "W5", km: 55, hr: 138, pace: 5.72, elev: 450, runs: 5, long: 24.3 },
    { year: 2026, week: 6, label: "W6", km: 46, hr: 141, pace: 5.85, elev: 360, runs: 4, long: 19.5 }, // current week (partial)
  ];

  return plan.map((p, i) => {
    const r = sr(i + 7000);
    return {
      year: p.year,
      week: p.week,
      label: p.label,
      totalKm: Math.round((p.km + (r - 0.5) * 5) * 10) / 10,
      runCount: p.runs,
      avgPaceMinKm: Math.round((p.pace + (r - 0.5) * 0.12) * 100) / 100,
      avgHeartrate: Math.round(p.hr + (r - 0.5) * 3),
      totalElevation: Math.round(p.elev + (r - 0.5) * 60),
      longestRunKm: Math.round((p.long + (r - 0.5) * 2) * 10) / 10,
    };
  });
}

// ---------------------------------------------------------------------------
// Monthly data: Nov 2025 -- Feb 2026 (4 months)
// ---------------------------------------------------------------------------

export function getMockMonthlyData(): MonthlyData[] {
  return [
    {
      year: 2025, month: 11, label: "Nov 2025",
      totalKm: 145, runCount: 14, avgPaceMinKm: 6.03,
      avgHeartrate: 146, totalElevation: 930,
    },
    {
      year: 2025, month: 12, label: "Dec 2025",
      totalKm: 217, runCount: 19, avgPaceMinKm: 5.93,
      avgHeartrate: 143, totalElevation: 1500,
    },
    {
      year: 2026, month: 1, label: "Jan 2026",
      totalKm: 182, runCount: 17, avgPaceMinKm: 5.86,
      avgHeartrate: 141, totalElevation: 1420,
    },
    {
      year: 2026, month: 2, label: "Feb 2026",
      totalKm: 99, runCount: 9, avgPaceMinKm: 5.79,
      avgHeartrate: 139, totalElevation: 810,
    },
  ];
}

// ---------------------------------------------------------------------------
// Long runs (>= 15 km)
// ---------------------------------------------------------------------------

export function getMockLongRuns(): LongRunData[] {
  return [
    // November 2025
    { date: "2025-11-16", name: "First Long Run",       distanceKm: 15.2, paceMinKm: 6.18, movingTimeMin: 94,  heartrate: 149, elevation: 140 },
    { date: "2025-11-23", name: "Sunday Long Run",      distanceKm: 16.5, paceMinKm: 6.10, movingTimeMin: 101, heartrate: 147, elevation: 165 },
    // December 2025
    { date: "2025-12-07", name: "Base Long Run",        distanceKm: 17.8, paceMinKm: 6.02, movingTimeMin: 107, heartrate: 146, elevation: 190 },
    { date: "2025-12-14", name: "Trail Long Run",       distanceKm: 18.5, paceMinKm: 5.98, movingTimeMin: 111, heartrate: 145, elevation: 240 },
    { date: "2025-12-21", name: "Recovery Long Run",    distanceKm: 15.5, paceMinKm: 6.08, movingTimeMin: 94,  heartrate: 148, elevation: 155 },
    { date: "2025-12-28", name: "End of Year Long Run", distanceKm: 19.0, paceMinKm: 5.95, movingTimeMin: 113, heartrate: 143, elevation: 210 },
    // January 2026
    { date: "2026-01-04", name: "Base Long Run",        distanceKm: 18.2, paceMinKm: 6.05, movingTimeMin: 110, heartrate: 145, elevation: 180 },
    { date: "2026-01-11", name: "Sunday Long Run",      distanceKm: 20.5, paceMinKm: 5.95, movingTimeMin: 122, heartrate: 143, elevation: 220 },
    { date: "2026-01-18", name: "Trail Long Run",       distanceKm: 16.8, paceMinKm: 6.15, movingTimeMin: 103, heartrate: 148, elevation: 340 },
    { date: "2026-01-25", name: "Sunday Long Run",      distanceKm: 22.0, paceMinKm: 5.88, movingTimeMin: 129, heartrate: 142, elevation: 195 },
    // February 2026
    { date: "2026-02-01", name: "Build Long Run",       distanceKm: 24.3, paceMinKm: 5.80, movingTimeMin: 141, heartrate: 140, elevation: 280 },
    { date: "2026-02-08", name: "Easy Long Run",        distanceKm: 19.5, paceMinKm: 5.92, movingTimeMin: 115, heartrate: 144, elevation: 210 },
  ];
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export function getMockSummary(): SummaryData {
  const weekly = getMockWeeklyData();
  const totalKm = Math.round(weekly.reduce((s, w) => s + w.totalKm, 0) * 10) / 10;
  const totalRuns = weekly.reduce((s, w) => s + w.runCount, 0);
  const avgHr = Math.round(weekly.reduce((s, w) => s + w.avgHeartrate, 0) / weekly.length);
  const avgPace = Math.round((weekly.reduce((s, w) => s + w.avgPaceMinKm, 0) / weekly.length) * 100) / 100;
  const totalElev = weekly.reduce((s, w) => s + w.totalElevation, 0);
  const longestRun = Math.max(...weekly.map((w) => w.longestRunKm));
  const totalHours = Math.round((totalKm * avgPace) / 60 * 10) / 10;

  const raceDate = new Date("2026-08-15");
  const weeksUntilRace = Math.max(
    0,
    Math.ceil((raceDate.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
  );

  return {
    totalKm,
    targetKm: 3000,
    weeklyAvgKm: Math.round((totalKm / weekly.length) * 10) / 10,
    longestRunKm: longestRun,
    totalRuns,
    weeksUntilRace,
    avgHeartrate: avgHr,
    avgPaceMinKm: avgPace,
    totalElevation: totalElev,
    currentStreak: weekly.length,
    totalHours,
  };
}

// ---------------------------------------------------------------------------
// Home data (dashboard)
// ---------------------------------------------------------------------------

export function getMockHomeData(): HomeData {
  const weekly = getMockWeeklyData();
  const longRuns = getMockLongRuns();

  // Current week = last entry in weekly data
  const currentWeek = weekly[weekly.length - 1];
  const currentHours =
    Math.round((currentWeek.totalKm * currentWeek.avgPaceMinKm) / 60 * 10) / 10;

  // Last long run (most recent by date)
  const sortedLongRuns = [...longRuns].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastLong = sortedLongRuns[0] ?? null;

  // Consistency streak: count backward through weeks where runCount >= CONSISTENCY_RUNS
  let streak = 0;
  for (let i = weekly.length - 1; i >= 0; i--) {
    if (weekly[i].runCount >= CONSISTENCY_RUNS) {
      streak++;
    } else {
      break;
    }
  }

  // Total since Nov
  const totalKm = Math.round(weekly.reduce((s, w) => s + w.totalKm, 0) * 10) / 10;
  const pctEarth =
    Math.round((totalKm / EARTH_CIRCUMFERENCE_KM) * 100 * 1000) / 1000;

  // 4-week rolling average (last 4 weeks)
  const last4 = weekly.slice(-4);
  const rollingAvgKm =
    Math.round((last4.reduce((s, w) => s + w.totalKm, 0) / last4.length) * 10) / 10;

  // Status: compare rolling avg to TARGET_BAND
  const status: "op_schema" | "achter_op_schema" =
    rollingAvgKm >= TARGET_BAND.min ? "op_schema" : "achter_op_schema";

  return {
    currentWeek: {
      km: currentWeek.totalKm,
      runs: currentWeek.runCount,
      hours: currentHours,
    },
    lastLongRun: lastLong
      ? {
          date: lastLong.date,
          km: lastLong.distanceKm,
          pace: lastLong.paceMinKm,
          name: lastLong.name,
          // Mock polyline: ~20km loop near Amersfoort/Vathorst
          polyline: "o~o~Hwr`]{@uDaByBiBkAcCe@qDRcC~@oBpBkAnC_@nDXpCdApBfBhAlCVpD_@nCmAnBcBhAsCRwCe@oCqAoBcBaAsCUqDd@oCpAoBbBiAhCYnDf@nCnAnBdBbArCXrDa@pCeAnBsBbBcCtAqDd@sDe@sCsAoBeBaAuCQsDh@mCxAkBjBaAxCQtDr@pCvAjBhBx@rCJtD",
        }
      : null,
    consistencyStreak: streak,
    totalSinceNov: { km: totalKm, pctEarth },
    status,
    rollingAvgKm,
  };
}

// ---------------------------------------------------------------------------
// Activities (~27 varied runs from Nov 2025 to Feb 2026)
// ---------------------------------------------------------------------------

export function getMockActivities(): ActivityData[] {
  const activities: ActivityData[] = [];
  let id = 1;

  // Helper: get day of week (0=Sun, 1=Mon, ..., 6=Sat)
  function dayOfWeek(dateStr: string): number {
    return new Date(dateStr).getDay();
  }

  // ~27 activities: mix of easy, interval, tempo, and long runs
  const rawActivities: Array<{
    date: string;
    name: string;
    km: number;
    paceBase: number;
    type: "easy" | "long" | "interval" | "tempo";
  }> = [
    // November 2025
    { date: "2025-11-04", name: "Easy Morning Run",       km: 7.2,  paceBase: 6.10, type: "easy" },
    { date: "2025-11-07", name: "Easy Run",               km: 6.5,  paceBase: 6.15, type: "easy" },
    { date: "2025-11-09", name: "Sunday Long Run",        km: 12.5, paceBase: 6.20, type: "long" },
    { date: "2025-11-12", name: "Interval 6x1000m",       km: 9.8,  paceBase: 5.45, type: "interval" },
    { date: "2025-11-14", name: "Recovery Run",           km: 5.5,  paceBase: 6.30, type: "easy" },
    { date: "2025-11-16", name: "Sunday Long Run",        km: 15.2, paceBase: 6.18, type: "long" },
    { date: "2025-11-20", name: "Easy Run",               km: 8.0,  paceBase: 6.08, type: "easy" },
    { date: "2025-11-23", name: "Sunday Long Run",        km: 16.5, paceBase: 6.10, type: "long" },
    // December 2025
    { date: "2025-12-02", name: "Easy Run",               km: 7.8,  paceBase: 6.05, type: "easy" },
    { date: "2025-12-04", name: "Interval 5x1200m",       km: 10.5, paceBase: 5.40, type: "interval" },
    { date: "2025-12-07", name: "Sunday Long Run",        km: 17.8, paceBase: 6.02, type: "long" },
    { date: "2025-12-10", name: "Easy Morning Run",       km: 6.0,  paceBase: 6.12, type: "easy" },
    { date: "2025-12-14", name: "Trail Long Run",         km: 18.5, paceBase: 5.98, type: "long" },
    { date: "2025-12-17", name: "Tempo Run",              km: 8.5,  paceBase: 5.55, type: "tempo" },
    { date: "2025-12-21", name: "Recovery Long Run",      km: 15.5, paceBase: 6.08, type: "long" },
    { date: "2025-12-28", name: "End of Year Long Run",   km: 19.0, paceBase: 5.95, type: "long" },
    // January 2026
    { date: "2026-01-04", name: "Base Long Run",          km: 18.2, paceBase: 6.05, type: "long" },
    { date: "2026-01-07", name: "Interval 8x800m",        km: 11.2, paceBase: 5.35, type: "interval" },
    { date: "2026-01-11", name: "Sunday Long Run",        km: 20.5, paceBase: 5.95, type: "long" },
    { date: "2026-01-15", name: "Easy Run",               km: 7.0,  paceBase: 6.00, type: "easy" },
    { date: "2026-01-18", name: "Trail Long Run",         km: 16.8, paceBase: 6.15, type: "long" },
    { date: "2026-01-21", name: "Interval 6x1000m",       km: 10.0, paceBase: 5.38, type: "interval" },
    { date: "2026-01-25", name: "Sunday Long Run",        km: 22.0, paceBase: 5.88, type: "long" },
    // February 2026
    { date: "2026-02-01", name: "Build Long Run",         km: 24.3, paceBase: 5.80, type: "long" },
    { date: "2026-02-04", name: "Easy Recovery Run",      km: 6.2,  paceBase: 6.15, type: "easy" },
    { date: "2026-02-06", name: "Interval 5x1000m",       km: 9.5,  paceBase: 5.42, type: "interval" },
    { date: "2026-02-08", name: "Easy Long Run",          km: 19.5, paceBase: 5.92, type: "long" },
  ];

  for (const act of rawActivities) {
    const r = sr(id + 3000);
    const km = Math.round((act.km + (r - 0.5) * 1.0) * 10) / 10;
    const pace = Math.round((act.paceBase + (r - 0.5) * 0.15) * 100) / 100;
    const movingTimeMin = Math.round(km * pace);
    const dow = dayOfWeek(act.date);
    const isSunday = dow === 0;
    const isLongRun = km >= 15;

    // Heart rate: higher for intervals, moderate for tempo, lower for easy/long
    let hrBase: number;
    switch (act.type) {
      case "interval": hrBase = 162; break;
      case "tempo":    hrBase = 155; break;
      case "long":     hrBase = 145; break;
      default:         hrBase = 140; break;
    }
    const heartrate = Math.round(hrBase + (r - 0.5) * 6);
    const maxHeartrate = Math.round(hrBase + 15 + (r - 0.5) * 8);

    // Elevation: more for trail/long runs, less for easy
    let elevBase: number;
    if (act.name.toLowerCase().includes("trail")) {
      elevBase = km * 14;
    } else if (isLongRun) {
      elevBase = km * 10;
    } else {
      elevBase = km * 6;
    }
    const elevation = Math.round(elevBase + (r - 0.5) * 20);

    activities.push({
      id,
      date: act.date,
      name: act.name,
      distanceKm: km,
      movingTimeMin,
      paceMinKm: pace,
      heartrate,
      maxHeartrate,
      elevation,
      isLongRun,
      isSunday,
      dayOfWeek: dow,
      stravaId: `mock_${id}_${act.date.replace(/-/g, "")}`,
    });
    id++;
  }

  // Sort descending by date (most recent first)
  activities.sort((a, b) => b.date.localeCompare(a.date));
  return activities;
}

// --- Route data ---

export const ULTRAVASAN_CHECKPOINTS = [
  { name: "Start - Sälen", km: 0, lat: 61.1575, lng: 13.2633 },
  { name: "Smågån", km: 11, lat: 61.1380, lng: 13.4200 },
  { name: "Mångsbodarna", km: 24, lat: 61.1100, lng: 13.5800 },
  { name: "Risberg", km: 35, lat: 61.0900, lng: 13.7200 },
  { name: "Evertsberg", km: 47, lat: 61.0600, lng: 13.8600 },
  { name: "Oxberg", km: 56, lat: 61.0400, lng: 14.0000 },
  { name: "Hökberg", km: 62, lat: 61.0300, lng: 14.1200 },
  { name: "Eldris", km: 71, lat: 61.0150, lng: 14.2800 },
  { name: "Finish - Mora", km: 92, lat: 61.0060, lng: 14.5430 },
];

export const ULTRAVASAN_ROUTE: [number, number][] = [
  [61.1575, 13.2633], [61.1520, 13.3000], [61.1480, 13.3400],
  [61.1380, 13.4200], [61.1300, 13.4800], [61.1200, 13.5300],
  [61.1100, 13.5800], [61.1000, 13.6500], [61.0900, 13.7200],
  [61.0800, 13.7900], [61.0700, 13.8200], [61.0600, 13.8600],
  [61.0500, 13.9300], [61.0400, 14.0000], [61.0350, 14.0600],
  [61.0300, 14.1200], [61.0250, 14.1800], [61.0200, 14.2300],
  [61.0150, 14.2800], [61.0120, 14.3500], [61.0100, 14.4200],
  [61.0080, 14.4800], [61.0060, 14.5430],
];
