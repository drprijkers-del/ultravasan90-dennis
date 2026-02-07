"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ULTRAVASAN_ROUTE,
  ULTRAVASAN_CHECKPOINTS,
} from "@/lib/mock-data";

interface RacePoint {
  id: number;
  timestamp: string;
  lat: number;
  lng: number;
}

interface Props {
  points: RacePoint[];
}

export default function RaceMap({ points }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.CircleMarker | null>(null);
  const trailRef = useRef<L.Polyline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [61.08, 13.9],
      zoom: 10,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    // Draw route
    L.polyline(ULTRAVASAN_ROUTE, {
      color: "#10b981",
      weight: 3,
      opacity: 0.7,
    }).addTo(map);

    // Add checkpoint markers
    ULTRAVASAN_CHECKPOINTS.forEach((cp) => {
      L.circleMarker([cp.lat, cp.lng], {
        radius: 5,
        fillColor: "#f59e0b",
        color: "#fff",
        weight: 2,
        fillOpacity: 1,
      })
        .bindTooltip(`${cp.name} (${cp.km} km)`, {
          permanent: false,
          direction: "top",
        })
        .addTo(map);
    });

    // Fit to route
    const bounds = L.latLngBounds(ULTRAVASAN_ROUTE);
    map.fitBounds(bounds, { padding: [30, 30] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update runner position
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    const lastPoint = points[points.length - 1];
    const latlng: L.LatLngExpression = [lastPoint.lat, lastPoint.lng];

    // Update or create runner marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#3b82f6",
        color: "#fff",
        weight: 3,
        fillOpacity: 1,
      })
        .bindTooltip("Dennis", { permanent: true, direction: "top" })
        .addTo(mapRef.current);
    }

    // Update trail
    const trailCoords: L.LatLngExpression[] = points.map((p) => [
      p.lat,
      p.lng,
    ]);

    if (trailRef.current) {
      trailRef.current.setLatLngs(trailCoords);
    } else {
      trailRef.current = L.polyline(trailCoords, {
        color: "#3b82f6",
        weight: 3,
        opacity: 0.8,
      }).addTo(mapRef.current);
    }
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="h-[400px] w-full sm:h-[500px]"
    />
  );
}
