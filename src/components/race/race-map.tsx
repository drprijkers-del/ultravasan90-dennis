"use client";

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  ULTRAVASAN_ROUTE,
  ULTRAVASAN_CHECKPOINTS,
} from "@/lib/mock-data";

interface RacePoint {
  id?: number;
  timestamp: string;
  lat: number;
  lng: number;
}

interface Props {
  points: RacePoint[];
  className?: string;
}

/**
 * 3-point GPS smoothing: average the lat/lng of the last 3 points
 * to reduce GPS jitter.
 */
function smoothPosition(
  points: RacePoint[]
): { lat: number; lng: number } | null {
  if (points.length === 0) return null;

  const recent = points.slice(-3);
  const lat = recent.reduce((s, p) => s + p.lat, 0) / recent.length;
  const lng = recent.reduce((s, p) => s + p.lng, 0) / recent.length;

  return { lat, lng };
}

export default function RaceMap({ points, className }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
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

    // Dark map tiles (CartoDB dark_matter)
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }
    ).addTo(map);

    // Draw route polyline
    L.polyline(ULTRAVASAN_ROUTE, {
      color: "#34d399",
      weight: 3,
      opacity: 0.6,
    }).addTo(map);

    // Add checkpoint markers
    ULTRAVASAN_CHECKPOINTS.forEach((cp) => {
      L.circleMarker([cp.lat, cp.lng], {
        radius: 5,
        fillColor: "#fbbf24",
        color: "#1e293b",
        weight: 2,
        fillOpacity: 1,
      })
        .bindTooltip(`${cp.name} (${cp.km} km)`, {
          permanent: false,
          direction: "top",
          className: "race-tooltip",
        })
        .addTo(map);
    });

    // Fit to route bounds
    const bounds = L.latLngBounds(ULTRAVASAN_ROUTE);
    map.fitBounds(bounds, { padding: [30, 30] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Create a pulsing runner icon with CSS transition for smooth animation
  const createRunnerIcon = useCallback(() => {
    return L.divIcon({
      className: "runner-marker",
      html: `<div style="
        width: 18px;
        height: 18px;
        background: #3b82f6;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 12px rgba(59, 130, 246, 0.6);
        transition: transform 0.3s ease;
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }, []);

  // Update runner position with 3-point smoothing
  useEffect(() => {
    if (!mapRef.current || points.length === 0) return;

    const smoothed = smoothPosition(points);
    if (!smoothed) return;

    const latlng: L.LatLngExpression = [smoothed.lat, smoothed.lng];

    // Update or create runner marker
    if (markerRef.current) {
      markerRef.current.setLatLng(latlng);
    } else {
      markerRef.current = L.marker(latlng, {
        icon: createRunnerIcon(),
        zIndexOffset: 1000,
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
  }, [points, createRunnerIcon]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-[45vh] w-full sm:h-[500px]"}
    />
  );
}
