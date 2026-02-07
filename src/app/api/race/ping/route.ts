import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get("authorization");
  const expectedToken = `Bearer ${process.env.RACE_PING_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { timestamp, lat, lng, accuracy_m, speed_mps } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng required" },
        { status: 400 }
      );
    }

    const point = await prisma.racePoint.create({
      data: {
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        accuracyM: accuracy_m ? parseFloat(accuracy_m) : null,
        speedMps: speed_mps ? parseFloat(speed_mps) : null,
      },
    });

    console.log(`Race point saved: ${point.id} (${lat}, ${lng})`);
    return NextResponse.json({ ok: true, id: point.id });
  } catch (error) {
    console.error("Race ping error:", error);
    return NextResponse.json(
      { error: "Failed to save point" },
      { status: 500 }
    );
  }
}
