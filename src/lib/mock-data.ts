// Mock data for demo mode — realistic 2026 Ultravasan 90 training

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

// Seeded pseudo-random for consistent demo data across page loads
function sr(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

export function getMockWeeklyData(): WeeklyData[] {
  // 2026 base building phase (weeks 1-6, current = ~W6)
  const plan: Array<{
    km: number; hr: number; pace: number; elev: number; runs: number; long: number;
  }> = [
    { km: 42, hr: 142, pace: 5.88, elev: 320, runs: 4, long: 18.2 },
    { km: 48, hr: 140, pace: 5.82, elev: 380, runs: 4, long: 20.5 },
    { km: 38, hr: 144, pace: 5.95, elev: 260, runs: 3, long: 16.8 }, // recovery week
    { km: 52, hr: 139, pace: 5.78, elev: 420, runs: 5, long: 22.0 },
    { km: 55, hr: 138, pace: 5.72, elev: 450, runs: 5, long: 24.3 },
    { km: 46, hr: 141, pace: 5.85, elev: 360, runs: 4, long: 19.5 }, // current
  ];

  return plan.map((p, i) => {
    const r = sr(i + 2026);
    return {
      year: 2026,
      week: i + 1,
      label: `W${i + 1}`,
      totalKm: Math.round((p.km + (r - 0.5) * 5) * 10) / 10,
      runCount: p.runs,
      avgPaceMinKm: Math.round((p.pace + (r - 0.5) * 0.12) * 100) / 100,
      avgHeartrate: Math.round(p.hr + (r - 0.5) * 3),
      totalElevation: Math.round(p.elev + (r - 0.5) * 60),
      longestRunKm: Math.round((p.long + (r - 0.5) * 2) * 10) / 10,
    };
  });
}

export function getMockMonthlyData(): MonthlyData[] {
  return [
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

export function getMockLongRuns(): LongRunData[] {
  return [
    { date: "2026-01-04", name: "Base Long Run", distanceKm: 18.2, paceMinKm: 6.05, movingTimeMin: 110, heartrate: 145, elevation: 180 },
    { date: "2026-01-11", name: "Sunday Long Run", distanceKm: 20.5, paceMinKm: 5.95, movingTimeMin: 122, heartrate: 143, elevation: 220 },
    { date: "2026-01-18", name: "Trail Long Run", distanceKm: 16.8, paceMinKm: 6.15, movingTimeMin: 103, heartrate: 148, elevation: 340 },
    { date: "2026-01-25", name: "Sunday Long Run", distanceKm: 22.0, paceMinKm: 5.88, movingTimeMin: 129, heartrate: 142, elevation: 195 },
    { date: "2026-02-01", name: "Build Long Run", distanceKm: 24.3, paceMinKm: 5.80, movingTimeMin: 141, heartrate: 140, elevation: 280 },
    { date: "2026-02-08", name: "Easy Long Run", distanceKm: 19.5, paceMinKm: 5.92, movingTimeMin: 115, heartrate: 144, elevation: 210 },
  ];
}

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
