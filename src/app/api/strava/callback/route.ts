import { NextRequest, NextResponse } from "next/server";
import { exchangeToken } from "@/lib/strava";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const tokenData = await exchangeToken(code);
    const athleteId = tokenData.athlete?.id;

    if (!athleteId) {
      return NextResponse.json({ error: "No athlete ID" }, { status: 400 });
    }

    await prisma.stravaToken.upsert({
      where: { athleteId: BigInt(athleteId) },
      create: {
        athleteId: BigInt(athleteId),
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_at,
      },
    });

    console.log(`Strava OAuth complete for athlete ${athleteId}`);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    return NextResponse.redirect(`${siteUrl}/?connected=true`);
  } catch (error) {
    console.error("Strava callback error:", error);
    return NextResponse.json(
      { error: "OAuth failed", details: String(error) },
      { status: 500 }
    );
  }
}
