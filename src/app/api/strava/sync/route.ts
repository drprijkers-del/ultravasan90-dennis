import { NextRequest, NextResponse } from "next/server";
import { syncAllActivities } from "@/lib/strava";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  try {
    const year = request.nextUrl.searchParams.get("year");
    // Default: sync from 2025 onwards; pass ?year=all for everything
    let after = Math.floor(new Date("2025-01-01").getTime() / 1000);
    if (year === "all") {
      after = 0;
    } else if (year) {
      after = Math.floor(new Date(`${year}-01-01`).getTime() / 1000);
    }

    const count = await syncAllActivities(after);

    return NextResponse.json({
      success: true,
      message: `Synced ${count} runs from Strava`,
      runsImported: count,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
