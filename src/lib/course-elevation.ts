// Approximate elevation profile for Ultravasan 90 (Sälen → Mora), from the
// official course profile: hilly first half, long descent and flat last ~19 km.
// Approximate, not a surveyed GPX — good enough to tilt pacing splits by terrain,
// not accurate to the metre. Swap for real GPX data when available.
export const ELEVATION_PROFILE: { km: number; elevation: number }[] = [
  { km: 0, elevation: 490 },
  { km: 3, elevation: 520 },
  { km: 6, elevation: 560 },
  { km: 9, elevation: 580 },
  { km: 11, elevation: 540 }, // Smågån
  { km: 14, elevation: 560 },
  { km: 17, elevation: 530 },
  { km: 20, elevation: 550 },
  { km: 24, elevation: 510 }, // Mångsbodarna
  { km: 28, elevation: 540 },
  { km: 31, elevation: 560 },
  { km: 35, elevation: 540 }, // Risberg
  { km: 38, elevation: 500 },
  { km: 41, elevation: 470 },
  { km: 44, elevation: 450 },
  { km: 47, elevation: 430 }, // Evertsberg
  { km: 50, elevation: 370 },
  { km: 53, elevation: 320 },
  { km: 56, elevation: 300 }, // Oxberg
  { km: 59, elevation: 280 },
  { km: 62, elevation: 270 }, // Hökberg
  { km: 65, elevation: 250 },
  { km: 68, elevation: 235 },
  { km: 71, elevation: 220 }, // Eldris
  { km: 75, elevation: 200 },
  { km: 79, elevation: 190 },
  { km: 83, elevation: 180 },
  { km: 87, elevation: 172 },
  { km: 92, elevation: 165 }, // Mora
];

const LAST = ELEVATION_PROFILE[ELEVATION_PROFILE.length - 1];

/** Linearly interpolated elevation (m) at a given kilometre. */
export function elevationAtKm(km: number): number {
  if (km <= 0) return ELEVATION_PROFILE[0].elevation;
  if (km >= LAST.km) return LAST.elevation;
  for (let i = 1; i < ELEVATION_PROFILE.length; i++) {
    if (ELEVATION_PROFILE[i].km >= km) {
      const prev = ELEVATION_PROFILE[i - 1];
      const next = ELEVATION_PROFILE[i];
      const t = (km - prev.km) / (next.km - prev.km);
      return prev.elevation + t * (next.elevation - prev.elevation);
    }
  }
  return LAST.elevation;
}
