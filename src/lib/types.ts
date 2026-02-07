// Centralized type definitions for the stats API

export interface WeeklyData {
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
  avgHeartrate: number;
  totalElevation: number;
}

export interface MonthlyData {
  label: string;
  totalKm: number;
  runCount: number;
  avgPaceMinKm: number;
  avgHeartrate: number;
}

export interface LongRunData {
  date: string;
  name: string;
  distanceKm: number;
  paceMinKm: number;
}

export interface YearBreakdown {
  year: number;
  totalKm: number;
  totalRuns: number;
}

export interface LocationData {
  location: string;
  totalKm: number;
  totalRuns: number;
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

export interface HomeData {
  currentWeek: {
    km: number;
    runs: number;
    hours: number;
    funFact: string;
  };
  lastLongRun: {
    date: string;
    km: number;
    pace: number;
    funFact: string;
  } | null;
  consistencyStreak: number;
  totalSinceNov: {
    km: number;
    pctEarth: number;
  };
  status: "op_schema" | "achter_op_schema";
  rollingAvgKm: number;
}

export interface StatsResponse {
  mock: boolean;
  weekly: WeeklyData[];
  monthly: MonthlyData[];
  longRuns: LongRunData[];
  summary: SummaryData;
  yearBreakdown: YearBreakdown[];
  locations: LocationData[];
  homeData: HomeData;
  activities: ActivityData[];
}
