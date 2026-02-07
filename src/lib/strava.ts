import { prisma } from "./prisma";

const STRAVA_API = "https://www.strava.com/api/v3";
const STRAVA_OAUTH = "https://www.strava.com/oauth/token";

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete?: { id: number };
}

interface StravaActivity {
  id: number;
  name: string;
  type: string;
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  total_elevation_gain: number;
  map?: { summary_polyline?: string };
}

/**
 * Exchange authorization code for tokens (initial OAuth)
 */
export async function exchangeToken(code: string): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token exchange failed: ${text}`);
  }

  return res.json();
}

/**
 * Get a valid access token, refreshing if expired
 */
export async function getAccessToken(): Promise<string> {
  // First try DB token
  const stored = await prisma.stravaToken.findFirst();

  if (stored && stored.expiresAt > Math.floor(Date.now() / 1000) + 60) {
    return stored.accessToken;
  }

  // Need to refresh
  const refreshToken = stored?.refreshToken || process.env.STRAVA_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("No refresh token available. Complete OAuth flow first.");
  }

  const res = await fetch(STRAVA_OAUTH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava token refresh failed: ${text}`);
  }

  const data: StravaTokenResponse = await res.json();

  if (stored) {
    await prisma.stravaToken.update({
      where: { id: stored.id },
      data: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
      },
    });
  }

  return data.access_token;
}

/**
 * Fetch a single activity from Strava
 */
export async function fetchActivity(activityId: number): Promise<StravaActivity> {
  const token = await getAccessToken();
  const res = await fetch(`${STRAVA_API}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Strava fetch activity failed: ${text}`);
  }

  return res.json();
}

// Long run detection: Sunday OR name contains "long" OR distance > 15km
const LONG_RUN_MIN_DISTANCE_M = 15000;

function isLongRun(activity: StravaActivity): boolean {
  const day = new Date(activity.start_date).getDay(); // 0 = Sunday
  const nameMatch = activity.name.toLowerCase().includes("long");
  const distanceMatch = activity.distance >= LONG_RUN_MIN_DISTANCE_M;
  return day === 0 || nameMatch || distanceMatch;
}

/**
 * Upsert an activity into DB and recompute aggregates
 */
export async function upsertActivity(stravaActivity: StravaActivity) {
  if (stravaActivity.type !== "Run") return;

  const startDate = new Date(stravaActivity.start_date);
  const paceMinKm =
    stravaActivity.average_speed > 0
      ? 1000 / 60 / stravaActivity.average_speed
      : null;

  await prisma.activity.upsert({
    where: { stravaActivityId: BigInt(stravaActivity.id) },
    create: {
      stravaActivityId: BigInt(stravaActivity.id),
      name: stravaActivity.name,
      type: stravaActivity.type,
      startDate,
      distanceM: stravaActivity.distance,
      movingTimeS: stravaActivity.moving_time,
      elapsedTimeS: stravaActivity.elapsed_time,
      averageSpeed: stravaActivity.average_speed,
      averageHeartrate: stravaActivity.average_heartrate ?? null,
      maxHeartrate: stravaActivity.max_heartrate ?? null,
      totalElevationGain: stravaActivity.total_elevation_gain,
      summaryPolyline: stravaActivity.map?.summary_polyline ?? null,
      isLongRun: isLongRun(stravaActivity),
    },
    update: {
      name: stravaActivity.name,
      distanceM: stravaActivity.distance,
      movingTimeS: stravaActivity.moving_time,
      elapsedTimeS: stravaActivity.elapsed_time,
      averageSpeed: stravaActivity.average_speed,
      averageHeartrate: stravaActivity.average_heartrate ?? null,
      maxHeartrate: stravaActivity.max_heartrate ?? null,
      totalElevationGain: stravaActivity.total_elevation_gain,
      summaryPolyline: stravaActivity.map?.summary_polyline ?? null,
      isLongRun: isLongRun(stravaActivity),
    },
  });

  // Recompute aggregates
  await recomputeAggregates();
}

/**
 * Recompute weekly + monthly stats from activities
 */
async function recomputeAggregates() {
  // Weekly stats
  const weeklyRaw: Array<{ year: number; week: number; total_km: number; run_count: bigint }> =
    await prisma.$queryRaw`
    SELECT
      EXTRACT(ISOYEAR FROM start_date)::int AS year,
      EXTRACT(WEEK FROM start_date)::int AS week,
      ROUND((SUM(distance_m) / 1000)::numeric, 2)::float AS total_km,
      COUNT(*)::bigint AS run_count
    FROM activities
    WHERE type = 'Run'
    GROUP BY year, week
    ORDER BY year, week
  `;

  for (const w of weeklyRaw) {
    await prisma.weeklyStat.upsert({
      where: { year_week: { year: w.year, week: w.week } },
      create: { year: w.year, week: w.week, totalKm: w.total_km, runCount: Number(w.run_count) },
      update: { totalKm: w.total_km, runCount: Number(w.run_count) },
    });
  }

  // Monthly stats
  const monthlyRaw: Array<{ year: number; month: number; total_km: number; run_count: bigint }> =
    await prisma.$queryRaw`
    SELECT
      EXTRACT(YEAR FROM start_date)::int AS year,
      EXTRACT(MONTH FROM start_date)::int AS month,
      ROUND((SUM(distance_m) / 1000)::numeric, 2)::float AS total_km,
      COUNT(*)::bigint AS run_count
    FROM activities
    WHERE type = 'Run'
    GROUP BY year, month
    ORDER BY year, month
  `;

  for (const m of monthlyRaw) {
    await prisma.monthlyStat.upsert({
      where: { year_month: { year: m.year, month: m.month } },
      create: { year: m.year, month: m.month, totalKm: m.total_km, runCount: Number(m.run_count) },
      update: { totalKm: m.total_km, runCount: Number(m.run_count) },
    });
  }
}

/**
 * Fetch all activities (paginated) from Strava since a given epoch timestamp
 */
export async function fetchAllActivities(after = 0): Promise<StravaActivity[]> {
  const token = await getAccessToken();
  const all: StravaActivity[] = [];
  let page = 1;
  const perPage = 200;

  while (true) {
    const url = `${STRAVA_API}/athlete/activities?after=${after}&page=${page}&per_page=${perPage}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Strava fetch activities failed (page ${page}): ${text}`);
    }

    const activities: StravaActivity[] = await res.json();
    if (activities.length === 0) break;
    all.push(...activities);
    if (activities.length < perPage) break;
    page++;
  }

  return all;
}

/**
 * Sync all activities: fetch from Strava, upsert into DB, recompute aggregates
 */
export async function syncAllActivities(after = 0): Promise<number> {
  const activities = await fetchAllActivities(after);
  const runs = activities.filter((a) => a.type === "Run");

  for (const run of runs) {
    const startDate = new Date(run.start_date);
    await prisma.activity.upsert({
      where: { stravaActivityId: BigInt(run.id) },
      create: {
        stravaActivityId: BigInt(run.id),
        name: run.name,
        type: run.type,
        startDate,
        distanceM: run.distance,
        movingTimeS: run.moving_time,
        elapsedTimeS: run.elapsed_time,
        averageSpeed: run.average_speed,
        averageHeartrate: run.average_heartrate ?? null,
        maxHeartrate: run.max_heartrate ?? null,
        totalElevationGain: run.total_elevation_gain,
        summaryPolyline: run.map?.summary_polyline ?? null,
        isLongRun: isLongRun(run),
      },
      update: {
        name: run.name,
        distanceM: run.distance,
        movingTimeS: run.moving_time,
        elapsedTimeS: run.elapsed_time,
        averageSpeed: run.average_speed,
        averageHeartrate: run.average_heartrate ?? null,
        maxHeartrate: run.max_heartrate ?? null,
        totalElevationGain: run.total_elevation_gain,
        summaryPolyline: run.map?.summary_polyline ?? null,
        isLongRun: isLongRun(run),
      },
    });
  }

  await recomputeAggregates();
  return runs.length;
}

/**
 * Get OAuth authorization URL
 */
export function getAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "activity:read_all",
  });
  return `https://www.strava.com/oauth/authorize?${params.toString()}`;
}
