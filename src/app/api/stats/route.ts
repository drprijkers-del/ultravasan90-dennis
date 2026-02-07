import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  isMockMode,
  getMockWeeklyData,
  getMockMonthlyData,
  getMockLongRuns,
  getMockSummary,
} from "@/lib/mock-data";

export const revalidate = 60;

const TRAINING_START = "2025-11-01";

export async function GET() {
  if (isMockMode()) {
    return NextResponse.json({
      mock: true,
      weekly: getMockWeeklyData(),
      monthly: getMockMonthlyData(),
      longRuns: getMockLongRuns(),
      summary: getMockSummary(),
      yearBreakdown: [],
      locations: [],
    });
  }

  try {
    // Weekly stats with enriched data
    const weeklyRaw: Array<{
      year: number; week: number; total_km: number; run_count: bigint;
      avg_pace: number; avg_hr: number; total_elev: number; longest_km: number;
    }> = await prisma.$queryRaw`
      SELECT
        EXTRACT(ISOYEAR FROM start_date)::int AS year,
        EXTRACT(WEEK FROM start_date)::int AS week,
        ROUND((SUM(distance_m) / 1000)::numeric, 1)::float AS total_km,
        COUNT(*)::bigint AS run_count,
        ROUND((AVG(CASE WHEN average_speed > 0 THEN 1000.0/60.0/average_speed END))::numeric, 2)::float AS avg_pace,
        ROUND(AVG(average_heartrate)::numeric, 0)::float AS avg_hr,
        ROUND(SUM(COALESCE(total_elevation_gain,0))::numeric, 0)::float AS total_elev,
        ROUND((MAX(distance_m)/1000)::numeric, 1)::float AS longest_km
      FROM activities WHERE type='Run' AND start_date >= ${TRAINING_START}
      GROUP BY year, week ORDER BY year, week
    `;

    const weekly = weeklyRaw.map((w) => ({
      year: w.year, week: w.week,
      label: w.year === 2025 ? `'25 W${w.week}` : `W${w.week}`,
      totalKm: w.total_km, runCount: Number(w.run_count),
      avgPaceMinKm: w.avg_pace || 0, avgHeartrate: w.avg_hr || 0,
      totalElevation: w.total_elev || 0, longestRunKm: w.longest_km || 0,
    }));

    // Monthly stats
    const monthlyRaw: Array<{
      year: number; month: number; total_km: number; run_count: bigint;
      avg_pace: number; avg_hr: number; total_elev: number;
    }> = await prisma.$queryRaw`
      SELECT
        EXTRACT(YEAR FROM start_date)::int AS year,
        EXTRACT(MONTH FROM start_date)::int AS month,
        ROUND((SUM(distance_m)/1000)::numeric, 1)::float AS total_km,
        COUNT(*)::bigint AS run_count,
        ROUND((AVG(CASE WHEN average_speed > 0 THEN 1000.0/60.0/average_speed END))::numeric, 2)::float AS avg_pace,
        ROUND(AVG(average_heartrate)::numeric, 0)::float AS avg_hr,
        ROUND(SUM(COALESCE(total_elevation_gain,0))::numeric, 0)::float AS total_elev
      FROM activities WHERE type='Run' AND start_date >= ${TRAINING_START}
      GROUP BY year, month ORDER BY year, month
    `;

    const mn = ["Jan","Feb","Mrt","Apr","Mei","Jun","Jul","Aug","Sep","Okt","Nov","Dec"];
    const monthly = monthlyRaw.map((m) => ({
      year: m.year, month: m.month, label: `${mn[m.month-1]} '${String(m.year).slice(2)}`,
      totalKm: m.total_km, runCount: Number(m.run_count),
      avgPaceMinKm: m.avg_pace || 0, avgHeartrate: m.avg_hr || 0,
      totalElevation: m.total_elev || 0,
    }));

    // Long runs
    const longRuns = await prisma.activity.findMany({
      where: { isLongRun: true, type: "Run" }, orderBy: { startDate: "asc" },
    });
    const longRunData = longRuns.map((r) => ({
      date: r.startDate.toISOString().split("T")[0],
      name: r.name,
      distanceKm: Math.round((r.distanceM / 1000) * 10) / 10,
      paceMinKm: r.averageSpeed && r.averageSpeed > 0
        ? Math.round((1000 / 60 / r.averageSpeed) * 100) / 100 : 0,
      movingTimeMin: Math.round(r.movingTimeS / 60),
      heartrate: r.averageHeartrate, elevation: r.totalElevationGain,
    }));

    // Summary (all training data)
    const summaryRaw: Array<{
      total_km: number; cnt: bigint; max_km: number; avg_hr: number;
      avg_pace: number; total_elev: number; total_time_min: number;
    }> = await prisma.$queryRaw`
      SELECT
        COALESCE(ROUND((SUM(distance_m)/1000)::numeric,1)::float,0) AS total_km,
        COUNT(*)::bigint AS cnt,
        COALESCE(ROUND((MAX(distance_m)/1000)::numeric,1)::float,0) AS max_km,
        ROUND(AVG(average_heartrate)::numeric,0)::float AS avg_hr,
        ROUND((AVG(CASE WHEN average_speed>0 THEN 1000.0/60.0/average_speed END))::numeric,2)::float AS avg_pace,
        ROUND(SUM(COALESCE(total_elevation_gain,0))::numeric,0)::float AS total_elev,
        ROUND((SUM(moving_time_s)/60.0)::numeric,0)::float AS total_time_min
      FROM activities WHERE type='Run' AND start_date >= ${TRAINING_START}
    `;

    const s = summaryRaw[0];
    const weeksElapsed = Math.max(1, weekly.length);
    const raceDate = new Date("2026-08-15");
    const weeksUntilRace = Math.max(0,
      Math.ceil((raceDate.getTime() - Date.now()) / (7*24*60*60*1000)));

    const summary = {
      totalKm: s?.total_km ?? 0, targetKm: 3000,
      weeklyAvgKm: Math.round(((s?.total_km ?? 0) / weeksElapsed) * 10) / 10,
      longestRunKm: s?.max_km ?? 0, totalRuns: Number(s?.cnt ?? 0),
      weeksUntilRace, avgHeartrate: s?.avg_hr ?? 0,
      avgPaceMinKm: s?.avg_pace ?? 0, totalElevation: s?.total_elev ?? 0,
      currentStreak: weeksElapsed,
      totalHours: Math.round((s?.total_time_min ?? 0) / 60 * 10) / 10,
    };

    // Year breakdown
    const yearBreakdownRaw: Array<{
      year: number; total_km: number; cnt: bigint;
    }> = await prisma.$queryRaw`
      SELECT
        EXTRACT(YEAR FROM start_date)::int AS year,
        COALESCE(ROUND((SUM(distance_m)/1000)::numeric,1)::float,0) AS total_km,
        COUNT(*)::bigint AS cnt
      FROM activities WHERE type='Run' AND start_date >= ${TRAINING_START}
      GROUP BY year ORDER BY year
    `;

    const yearBreakdown = yearBreakdownRaw.map((y) => ({
      year: y.year,
      totalKm: y.total_km,
      totalRuns: Number(y.cnt),
    }));

    // Training locations
    const locationRaw: Array<{
      location: string; total_km: number; cnt: bigint;
    }> = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN name ILIKE 'Amersfoort%' THEN 'Amersfoort'
          WHEN name ILIKE 'Mora%' THEN 'Mora'
          WHEN name ILIKE 'Finnbodarna%' THEN 'Finnbodarna'
          WHEN name ILIKE 'Sälen%' OR name ILIKE 'Salen%' THEN 'Sälen'
          ELSE 'Amersfoort'
        END AS location,
        COALESCE(ROUND((SUM(distance_m)/1000)::numeric,1)::float,0) AS total_km,
        COUNT(*)::bigint AS cnt
      FROM activities WHERE type='Run' AND start_date >= ${TRAINING_START}
      GROUP BY location ORDER BY total_km DESC
    `;

    const locations = locationRaw.map((l) => ({
      location: l.location,
      totalKm: l.total_km,
      totalRuns: Number(l.cnt),
    }));

    return NextResponse.json({
      mock: false, weekly, monthly, longRuns: longRunData, summary,
      yearBreakdown, locations,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
