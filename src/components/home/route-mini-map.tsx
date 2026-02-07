"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { decodePolyline } from "@/lib/decode-polyline";

interface Props {
  polyline: string;
}

export default function RouteMiniMap({ polyline }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const coords = decodePolyline(polyline);
    if (coords.length === 0) return;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
    });

    // Dark tiles
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(map);

    // Draw route
    const latLngs: L.LatLngExpression[] = coords.map(([lat, lng]) => [lat, lng]);
    const line = L.polyline(latLngs, {
      color: "#34d399",
      weight: 3,
      opacity: 0.9,
    }).addTo(map);

    // Start marker
    L.circleMarker(latLngs[0], {
      radius: 4,
      fillColor: "#34d399",
      color: "#fff",
      weight: 2,
      fillOpacity: 1,
    }).addTo(map);

    // End marker
    L.circleMarker(latLngs[latLngs.length - 1], {
      radius: 4,
      fillColor: "#f87171",
      color: "#fff",
      weight: 2,
      fillOpacity: 1,
    }).addTo(map);

    // Fit bounds
    map.fitBounds(line.getBounds(), { padding: [12, 12] });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [polyline]);

  return <div ref={containerRef} className="h-28 w-full rounded-lg" />;
}
