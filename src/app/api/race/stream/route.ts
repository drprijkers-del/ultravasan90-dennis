import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { RacePoint } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

function serializePoint(p: RacePoint) {
  return {
    id: p.id,
    timestamp: p.timestamp.toISOString(),
    lat: p.lat,
    lng: p.lng,
    accuracyM: p.accuracyM,
    speedMps: p.speedMps,
  };
}

export async function GET(request: NextRequest) {
  const delayMinutes = parseInt(
    process.env.NEXT_PUBLIC_RACE_DELAY_MINUTES || "0",
    10
  );

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: unknown) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      let lastId = 0;

      const poll = async () => {
        try {
          const delayDate = new Date(
            Date.now() - delayMinutes * 60 * 1000
          );

          const points = await prisma.racePoint.findMany({
            where: {
              id: { gt: lastId },
              timestamp: { lte: delayDate },
            },
            orderBy: { timestamp: "asc" },
            take: 50,
          });

          if (points.length > 0) {
            lastId = points[points.length - 1].id;
            sendEvent({
              type: "points",
              points: points.map(serializePoint),
            });
          } else {
            sendEvent({ type: "heartbeat", time: new Date().toISOString() });
          }
        } catch (error) {
          console.error("SSE poll error:", error);
          sendEvent({ type: "error", message: "Poll failed" });
        }
      };

      // Initial data: send last 100 points
      try {
        const delayDate = new Date(
          Date.now() - delayMinutes * 60 * 1000
        );

        const initial = await prisma.racePoint.findMany({
          where: { timestamp: { lte: delayDate } },
          orderBy: { timestamp: "asc" },
          take: 100,
        });

        if (initial.length > 0) {
          lastId = initial[initial.length - 1].id;
          sendEvent({
            type: "init",
            points: initial.map(serializePoint),
          });
        }
      } catch (error) {
        console.error("SSE init error:", error);
      }

      // Poll every 5 seconds
      const interval = setInterval(poll, 5000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
