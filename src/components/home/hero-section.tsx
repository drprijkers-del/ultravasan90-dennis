"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCountdown, RACE_NAME, TRAINING_TARGET_KM } from "@/lib/race-config";

interface Props {
  totalKm: number;
}

export function HeroSection({ totalKm }: Props) {
  const [countdown, setCountdown] = useState(getCountdown());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown()), 60_000);
    return () => clearInterval(t);
  }, []);

  const pct = Math.min(100, Math.round((totalKm / TRAINING_TARGET_KM) * 100));

  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Profile + name */}
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-(--accent-light) sm:h-16 sm:w-16">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-(--accent)">
                DR
              </div>
            ) : (
              <Image
                src="/profile.jpeg"
                alt="Dennis Rijkers"
                fill
                className="object-cover"
                sizes="64px"
                priority
                onError={() => setImgError(true)}
              />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-(--text-primary) sm:text-2xl">
              Dennis <span className="text-(--accent)">&rarr;</span> {RACE_NAME}
            </h1>
            <p className="mt-0.5 text-sm text-(--text-secondary)">
              92 km door de Zweedse wildernis
            </p>
          </div>
        </div>

        {/* Right: Countdown */}
        <div className="flex items-center gap-4 sm:gap-6">
          {countdown.phase === "in_training" ? (
            <>
              <CountdownUnit value={countdown.days} label="dagen" />
              <CountdownUnit value={countdown.hours} label="uren" />
              <CountdownUnit value={countdown.minutes} label="min" />
            </>
          ) : countdown.phase === "race_day" ? (
            <span className="text-lg font-bold text-(--accent)">RACE DAY!</span>
          ) : (
            <span className="text-lg font-bold text-(--accent)">Gefinisht!</span>
          )}
        </div>
      </div>

      {/* Mini progress bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-(--text-muted)">
          <span>{totalKm} km gelopen</span>
          <span>{TRAINING_TARGET_KM} km doel</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-(--bg-inset)">
          <div
            className="h-full rounded-full bg-(--accent) transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-right text-xs text-(--text-muted)">{pct}%</p>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="block font-mono text-2xl font-bold text-(--text-primary) sm:text-3xl">
        {value}
      </span>
      <span className="text-xs text-(--text-muted)">{label}</span>
    </div>
  );
}
