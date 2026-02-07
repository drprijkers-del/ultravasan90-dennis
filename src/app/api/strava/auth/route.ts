import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/strava";

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirectUri = `${siteUrl}/api/strava/callback`;
  const authUrl = getAuthUrl(redirectUri);
  return NextResponse.redirect(authUrl);
}
