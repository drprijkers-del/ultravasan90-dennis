"use client";

import { useMemo } from "react";
import { ULTRAVASAN_CHECKPOINTS } from "@/lib/mock-data";
import {
  ELEVATION_PROFILE as ELEVATION_POINTS,
  elevationAtKm as interpolateElevation,
} from "@/lib/course-elevation";

interface Props {
  currentKm: number;
}

export function ElevationProfile({ currentKm }: Props) {
  const width = 600;
  const height = 160;
  const padTop = 20;
  const padBottom = 32;
  const padLeft = 36;
  const padRight = 12;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minElev = 140;
  const maxElev = 600;

  const toX = (km: number) => padLeft + (km / 92) * chartW;
  const toY = (elev: number) =>
    padTop + chartH - ((elev - minElev) / (maxElev - minElev)) * chartH;

  // Build SVG path for the elevation area
  const areaPath = useMemo(() => {
    const pts = ELEVATION_POINTS.map((p) => `${toX(p.km)},${toY(p.elevation)}`);
    return `M${padLeft},${toY(minElev)} L${pts.join(" L")} L${toX(92)},${toY(minElev)} Z`;
  }, []);

  const linePath = useMemo(() => {
    const pts = ELEVATION_POINTS.map((p) => `${toX(p.km)},${toY(p.elevation)}`);
    return `M${pts.join(" L")}`;
  }, []);

  // "Completed" area (up to currentKm)
  const completedPath = useMemo(() => {
    if (currentKm <= 0) return "";
    const clampedKm = Math.min(currentKm, 92);
    const pts = ELEVATION_POINTS.filter((p) => p.km <= clampedKm).map(
      (p) => `${toX(p.km)},${toY(p.elevation)}`
    );
    // Add interpolated end point
    const endElev = interpolateElevation(clampedKm);
    pts.push(`${toX(clampedKm)},${toY(endElev)}`);
    return `M${padLeft},${toY(minElev)} L${padLeft},${toY(ELEVATION_POINTS[0].elevation)} L${pts.join(" L")} L${toX(clampedKm)},${toY(minElev)} Z`;
  }, [currentKm]);

  // Runner position
  const runnerElev = interpolateElevation(currentKm);
  const runnerX = toX(Math.min(currentKm, 92));
  const runnerY = toY(runnerElev);

  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      <h3 className="mb-3 text-xs font-medium text-(--text-muted)">
        Hoogteprofiel — Sälen → Mora
      </h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {[200, 300, 400, 500].map((elev) => (
          <g key={elev}>
            <line
              x1={padLeft}
              y1={toY(elev)}
              x2={width - padRight}
              y2={toY(elev)}
              stroke="var(--border-primary)"
              strokeWidth={0.5}
              strokeDasharray="2,3"
            />
            <text
              x={padLeft - 4}
              y={toY(elev) + 3}
              textAnchor="end"
              fontSize={8}
              fill="var(--text-muted)"
            >
              {elev}m
            </text>
          </g>
        ))}

        {/* Full elevation area (grey) */}
        <path d={areaPath} fill="var(--bg-inset)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--border-secondary)"
          strokeWidth={1.5}
        />

        {/* Completed area (orange) */}
        {currentKm > 0 && (
          <>
            <path d={completedPath} fill="#e07a3a" opacity={0.2} />
            <line
              x1={runnerX}
              y1={padTop}
              x2={runnerX}
              y2={toY(minElev)}
              stroke="#e07a3a"
              strokeWidth={0.5}
              strokeDasharray="2,2"
              opacity={0.5}
            />
          </>
        )}

        {/* Checkpoint markers */}
        {ULTRAVASAN_CHECKPOINTS.map((cp) => {
          const elev = interpolateElevation(cp.km);
          const cx = toX(cp.km);
          const cy = toY(elev);
          const isPassed = currentKm >= cp.km;
          return (
            <g key={cp.name}>
              <circle
                cx={cx}
                cy={cy}
                r={3}
                fill={isPassed ? "#e07a3a" : "var(--bg-card)"}
                stroke={isPassed ? "#e07a3a" : "var(--text-muted)"}
                strokeWidth={1.5}
              />
              {/* Checkpoint label — alternate above/below to avoid overlap */}
              <text
                x={cx}
                y={toY(minElev) + 10}
                textAnchor="middle"
                fontSize={6.5}
                fill={isPassed ? "var(--text-primary)" : "var(--text-muted)"}
              >
                {cp.name.replace("Start - ", "").replace("Finish - ", "")}
              </text>
              <text
                x={cx}
                y={toY(minElev) + 18}
                textAnchor="middle"
                fontSize={6}
                fill="var(--text-muted)"
              >
                {cp.km} km
              </text>
            </g>
          );
        })}

        {/* Runner marker */}
        {currentKm > 0 && currentKm < 92 && (
          <g>
            <circle
              cx={runnerX}
              cy={runnerY}
              r={5}
              fill="#e07a3a"
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={runnerX}
              y={runnerY - 10}
              textAnchor="middle"
              fontSize={8}
              fontWeight="bold"
              fill="#e07a3a"
            >
              {Math.round(currentKm)} km
            </text>
          </g>
        )}

        {/* Finish flag */}
        {currentKm >= 92 && (
          <text
            x={toX(92)}
            y={toY(165) - 10}
            textAnchor="middle"
            fontSize={10}
            fill="var(--accent)"
            fontWeight="bold"
          >
            FINISH
          </text>
        )}
      </svg>
    </div>
  );
}
