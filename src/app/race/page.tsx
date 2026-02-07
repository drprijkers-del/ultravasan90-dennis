"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { ULTRAVASAN_CHECKPOINTS } from "@/lib/mock-data";

// Dynamic import for Leaflet (no SSR)
const RaceMap = dynamic(() => import("@/components/race-map"), { ssr: false });

interface RacePoint {
  id: number;
  timestamp: string;
  lat: number;
  lng: number;
  accuracyM: number | null;
  speedMps: number | null;
}

function distanceBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateDistanceAlongRoute(lat: number, lng: number): number {
  let minDist = Infinity;
  let closestIdx = 0;

  for (let i = 0; i < ULTRAVASAN_CHECKPOINTS.length; i++) {
    const cp = ULTRAVASAN_CHECKPOINTS[i];
    const d = distanceBetween(lat, lng, cp.lat, cp.lng);
    if (d < minDist) {
      minDist = d;
      closestIdx = i;
    }
  }

  return ULTRAVASAN_CHECKPOINTS[closestIdx].km;
}

export default function RacePage() {
  const [points, setPoints] = useState<RacePoint[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/race/stream");
    eventSourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "init" || data.type === "points") {
        setPoints((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const newPoints = data.points.filter(
            (p: RacePoint) => !existing.has(p.id)
          );
          return [...prev, ...newPoints];
        });
        if (data.points.length > 0) {
          setLastUpdate(data.points[data.points.length - 1].timestamp);
        }
      }
    };

    es.onerror = () => setConnected(false);

    return () => {
      es.close();
    };
  }, []);

  const lastPoint = points.length > 0 ? points[points.length - 1] : null;
  const estimatedKm = lastPoint
    ? estimateDistanceAlongRoute(lastPoint.lat, lastPoint.lng)
    : 0;
  const remainingKm = Math.max(0, 92 - estimatedKm);

  // Estimate ETA based on average speed
  let etaText = "—";
  if (lastPoint?.speedMps && lastPoint.speedMps > 0 && remainingKm > 0) {
    const hoursRemaining = (remainingKm * 1000) / lastPoint.speedMps / 3600;
    const etaDate = new Date(
      new Date(lastPoint.timestamp).getTime() + hoursRemaining * 3600000
    );
    etaText = etaDate.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Race Day — Ultravasan 90
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Live tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm text-zinc-500">
            {connected ? "Live" : "Verbinding verbroken"}
          </span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">Afgelegd</p>
          <p className="text-xl font-bold text-emerald-600">
            {estimatedKm.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">Resterend</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {remainingKm.toFixed(1)} km
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">ETA finish</p>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {etaText}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs text-zinc-500">Laatste update</p>
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {lastUpdate
              ? new Date(lastUpdate).toLocaleTimeString("nl-NL")
              : "Wachten..."}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-1000"
          style={{ width: `${Math.min(100, (estimatedKm / 92) * 100)}%` }}
        />
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <RaceMap points={points} />
      </div>

      {/* Checkpoints */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Checkpoints
        </h3>
        <div className="space-y-2">
          {ULTRAVASAN_CHECKPOINTS.map((cp) => {
            const passed = estimatedKm >= cp.km;
            return (
              <div
                key={cp.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      passed ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  />
                  <span
                    className={
                      passed
                        ? "font-medium text-emerald-600 dark:text-emerald-400"
                        : "text-zinc-600 dark:text-zinc-400"
                    }
                  >
                    {cp.name}
                  </span>
                </div>
                <span className="font-mono text-zinc-400">{cp.km} km</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
