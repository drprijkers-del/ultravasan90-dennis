import { NextRequest, NextResponse } from "next/server";
import { fetchActivity, upsertActivity } from "@/lib/strava";

// GET: Strava webhook verification
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.STRAVA_VERIFY_TOKEN) {
    console.log("Strava webhook verified");
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Strava webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Strava webhook event:", JSON.stringify(body));

    const { object_type, aspect_type, object_id } = body;

    // Only process activity create/update events
    if (object_type !== "activity") {
      return NextResponse.json({ ok: true });
    }

    if (aspect_type === "create" || aspect_type === "update") {
      // Fetch full activity details and upsert
      try {
        const activity = await fetchActivity(object_id);
        await upsertActivity(activity);
        console.log(`Activity ${object_id} processed successfully`);
      } catch (err) {
        console.error(`Failed to process activity ${object_id}:`, err);
      }
    }

    // Always return 200 to Strava
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}
