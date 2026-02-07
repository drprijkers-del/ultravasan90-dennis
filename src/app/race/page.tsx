"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { ULTRAVASAN_CHECKPOINTS } from "@/lib/mock-data";
import { RaceStats } from "@/components/race/race-stats";
import { CheckpointList } from "@/components/race/checkpoint-list";
import { ReplayToggle } from "@/components/race/replay-toggle";
import { ConnectionStatus } from "@/components/race/connection-status";
import { getCountdown, RACE_DATE, RACE_DISTANCE_KM } from "@/lib/race-config";

// Dynamic import for Leaflet (no SSR)
const RaceMap = dynamic(() => import("@/components/race/race-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[45vh] items-center justify-center bg-(--bg-inset) sm:h-[500px]">
      <p className="text-sm text-(--text-muted)">Kaart laden...</p>
    </div>
  ),
});

interface RacePoint {
  id?: number;
  timestamp: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
  speedMps?: number | null;
}

interface ReplayPoint {
  timestamp: string;
  lat: number;
  lng: number;
  speedMps: number;
}

// ---------------------------------------------------------------------------
// Haversine distance (km)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Estimate distance along the route based on nearest checkpoint
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 3-point GPS smoothing for position estimation
// ---------------------------------------------------------------------------
function smoothedPosition(points: RacePoint[]): { lat: number; lng: number } | null {
  if (points.length === 0) return null;
  const recent = points.slice(-3);
  return {
    lat: recent.reduce((s, p) => s + p.lat, 0) / recent.length,
    lng: recent.reduce((s, p) => s + p.lng, 0) / recent.length,
  };
}

// ===========================================================================
// Page Component
// ===========================================================================
export default function RacePage() {
  const [points, setPoints] = useState<RacePoint[]>([]);
  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [replayMode, setReplayMode] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const replayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const replayDataRef = useRef<ReplayPoint[]>([]);
  const replayIndexRef = useRef(0);

  // -------------------------------------------------------------------------
  // SSE connection (live mode)
  // -------------------------------------------------------------------------
  const connectSSE = useCallback(() => {
    if (eventSourceRef.current) return;

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
          setLastUpdate(
            new Date(data.points[data.points.length - 1].timestamp)
          );
        }
      }
    };

    es.onerror = () => setConnected(false);
  }, []);

  const disconnectSSE = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
  }, []);

  // -------------------------------------------------------------------------
  // Replay mode
  // -------------------------------------------------------------------------
  const startReplay = useCallback(async () => {
    // Load replay data if not already cached
    if (replayDataRef.current.length === 0) {
      const res = await fetch("/data/replay.json");
      replayDataRef.current = await res.json();
    }

    // Reset state
    replayIndexRef.current = 0;
    setPoints([]);
    setLastUpdate(null);
    setConnected(true);

    // Drip-feed points every 2 seconds
    replayTimerRef.current = setInterval(() => {
      const idx = replayIndexRef.current;
      const data = replayDataRef.current;

      if (idx >= data.length) {
        // Replay finished
        if (replayTimerRef.current) clearInterval(replayTimerRef.current);
        replayTimerRef.current = null;
        return;
      }

      const point = data[idx];
      setPoints((prev) => [
        ...prev,
        {
          id: idx,
          timestamp: point.timestamp,
          lat: point.lat,
          lng: point.lng,
          speedMps: point.speedMps,
        },
      ]);
      setLastUpdate(new Date(point.timestamp));
      replayIndexRef.current = idx + 1;
    }, 2000);
  }, []);

  const stopReplay = useCallback(() => {
    if (replayTimerRef.current) {
      clearInterval(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  }, []);

  // -------------------------------------------------------------------------
  // Toggle between live / replay
  // -------------------------------------------------------------------------
  const handleToggleReplay = useCallback(() => {
    if (replayMode) {
      // Switch OFF replay -> go back to live
      stopReplay();
      setReplayMode(false);
      setPoints([]);
      setLastUpdate(null);
      connectSSE();
    } else {
      // Switch ON replay -> disconnect live, start replay
      disconnectSSE();
      setReplayMode(true);
      startReplay();
    }
  }, [replayMode, stopReplay, connectSSE, disconnectSSE, startReplay]);

  // -------------------------------------------------------------------------
  // Initial SSE connection (live mode by default)
  // -------------------------------------------------------------------------
  useEffect(() => {
    // Only connect SSE when race is active (not in pre-race training phase)
    const { phase } = getCountdown();
    if (phase !== "in_training") {
      connectSSE();
    }
    return () => {
      disconnectSSE();
      stopReplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Derived state
  // -------------------------------------------------------------------------
  const smoothed = smoothedPosition(points);
  const estimatedKm = smoothed
    ? estimateDistanceAlongRoute(smoothed.lat, smoothed.lng)
    : 0;
  const remainingKm = Math.max(0, 92 - estimatedKm);

  // Determine last point speed for ETA
  const lastPoint = points.length > 0 ? points[points.length - 1] : null;
  let etaText = "\u2014";
  if (lastPoint?.speedMps && lastPoint.speedMps > 0 && remainingKm > 0) {
    const hoursRemaining =
      (remainingKm * 1000) / lastPoint.speedMps / 3600;
    const etaDate = new Date(
      new Date(lastPoint.timestamp).getTime() + hoursRemaining * 3600000
    );
    etaText = etaDate.toLocaleTimeString("nl-NL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Next checkpoint
  const nextCp = ULTRAVASAN_CHECKPOINTS.find((cp) => cp.km > estimatedKm);
  const nextCheckpoint = nextCp
    ? {
        name: nextCp.name,
        km: nextCp.km,
        eta:
          lastPoint?.speedMps && lastPoint.speedMps > 0
            ? new Date(
                new Date(lastPoint.timestamp).getTime() +
                  ((nextCp.km - estimatedKm) * 1000) /
                    lastPoint.speedMps /
                    3600 *
                    3600000
              ).toLocaleTimeString("nl-NL", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : undefined,
      }
    : null;

  // -------------------------------------------------------------------------
  // Phase detection
  // -------------------------------------------------------------------------
  const countdown = getCountdown();
  const isPreRace = countdown.phase === "in_training";
  const raceDate = RACE_DATE.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // -------------------------------------------------------------------------
  // Render — Pre-race state
  // -------------------------------------------------------------------------
  if (isPreRace && !replayMode) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-(--text-primary)">
              Race Day — Ultravasan 90
            </h1>
            <p className="mt-1 text-sm text-(--text-muted)">
              Live tracking wordt actief op racedag
            </p>
          </div>
          <ReplayToggle active={replayMode} onToggle={handleToggleReplay} />
        </div>

        {/* Countdown hero */}
        <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-6 text-center sm:p-10">
          <p className="text-xs font-medium uppercase tracking-wider text-(--text-muted)">
            Start over
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 sm:gap-6">
            <div>
              <span className="text-4xl font-bold text-(--accent) sm:text-5xl">
                {countdown.days}
              </span>
              <p className="mt-1 text-xs text-(--text-muted)">dagen</p>
            </div>
            <span className="text-2xl text-(--text-muted)">:</span>
            <div>
              <span className="text-4xl font-bold text-(--text-primary) sm:text-5xl">
                {countdown.hours}
              </span>
              <p className="mt-1 text-xs text-(--text-muted)">uur</p>
            </div>
            <span className="text-2xl text-(--text-muted)">:</span>
            <div>
              <span className="text-4xl font-bold text-(--text-primary) sm:text-5xl">
                {countdown.minutes}
              </span>
              <p className="mt-1 text-xs text-(--text-muted)">min</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-(--text-secondary)">
            {raceDate} &middot; 05:00 &middot; Sälen → Mora &middot; {RACE_DISTANCE_KM} km
          </p>
        </div>

        {/* Map preview (static, no tracking dots) */}
        <div className="overflow-hidden rounded-xl border border-(--border-primary)">
          <RaceMap points={[]} className="h-[35vh] w-full sm:h-100" />
        </div>

        {/* Checkpoints preview */}
        <CheckpointList currentKm={0} />

        {/* Info */}
        <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-4 sm:p-5">
          <h3 className="text-sm font-medium text-(--text-muted)">
            Hoe werkt live tracking?
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-(--text-secondary)">
            <li>
              Op racedag wordt Dennis&apos; GPS-positie elke paar minuten bijgewerkt
            </li>
            <li>
              Je ziet zijn voortgang op de kaart met geschatte aankomsttijden
            </li>
            <li>
              Gebruik de &quot;Demo&quot; knop om een voorbeeld van de tracking te bekijken
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // Render — Active race / replay / finished
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">
            Race Day — Ultravasan 90
          </h1>
          <p className="mt-1 text-sm text-(--text-muted)">
            {replayMode ? "Demo modus — herhaalde route" : "Live tracking"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus
            connected={replayMode ? true : connected}
            lastUpdate={lastUpdate}
          />
          <ReplayToggle active={replayMode} onToggle={handleToggleReplay} />
        </div>
      </div>

      {/* Demo mode banner */}
      {replayMode && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400">
          Demo modus actief — punten worden elke 2 seconden afgespeeld
        </div>
      )}

      {/* Progress bar */}
      <div className="h-2 overflow-hidden rounded-full bg-(--bg-inset)">
        <div
          className="h-full rounded-full bg-(--accent) transition-all duration-1000"
          style={{ width: `${Math.min(100, (estimatedKm / 92) * 100)}%` }}
        />
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-xl border border-(--border-primary)">
        <RaceMap
          points={points}
          className="h-[45vh] w-full sm:h-[500px]"
        />
      </div>

      {/* Stats */}
      <RaceStats
        estimatedKm={estimatedKm}
        remainingKm={remainingKm}
        etaFinish={etaText}
        lastUpdate={lastUpdate}
        nextCheckpoint={nextCheckpoint}
      />

      {/* Checkpoints */}
      <CheckpointList currentKm={estimatedKm} />
    </div>
  );
}
