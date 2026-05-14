"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useT } from "@/lib/i18n";
import { getCountdown } from "@/lib/race-config";
import { VerdictCard } from "@/components/home/verdict-card";
import { HeroSkeleton, CardSkeleton } from "@/components/skeleton";
import type { StatsResponse } from "@/lib/types";

export default function Home() {
  const t = useT();
  const [data, setData] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(getCountdown());
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
    const timer = setInterval(() => setCountdown(getCountdown()), 60_000);
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return (
      <div className="card-elevated rounded-xl bg-(--bg-card) px-6 py-12 text-center text-(--danger)">
        {t("common.error")}: {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <HeroSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Hero ─── */}
      <div className="card-elevated overflow-hidden rounded-xl bg-(--bg-card)">
        <div className="relative h-36 w-full sm:h-44">
          <Image
            src="/hero-dalarna.jpg"
            alt="Trail in Dalarna"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-(--bg-card) to-transparent" />
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:-mt-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-(--accent-orange)">
                {imgError ? (
                  <div className="flex h-full w-full items-center justify-center bg-(--accent-orange-light) text-sm font-bold text-(--accent-orange)">
                    DR
                  </div>
                ) : (
                  <Image
                    src="/profile.jpeg"
                    alt="Dennis Rijkers"
                    fill
                    className="object-cover"
                    sizes="48px"
                    priority
                    onError={() => setImgError(true)}
                  />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-(--text-primary)">
                  {t("home.title")}
                </h1>
                <p className="text-sm text-(--text-secondary)">
                  {t("home.subtitle")}
                </p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-4">
              {countdown.phase === "in_training" ? (
                <>
                  <CountdownUnit value={countdown.days} label={t("home.countdown.days")} />
                  <CountdownUnit value={countdown.hours} label={t("home.countdown.hours")} />
                  <CountdownUnit value={countdown.minutes} label={t("home.countdown.min")} />
                </>
              ) : countdown.phase === "race_day" ? (
                <span className="text-lg font-bold text-(--accent-orange)">{t("home.countdown.raceDay")}</span>
              ) : (
                <span className="text-lg font-bold text-(--accent)">{t("home.countdown.finished")}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {data.mock && (
        <div className="rounded-lg bg-(--accent-2-light) px-4 py-3 text-sm text-(--accent-2-text)">
          {t("progress.demo")}
        </div>
      )}

      {/* ─── The verdict: am I on route for the goal? ─── */}
      <VerdictCard weekly={data.weekly} activities={data.activities} />

      {/* ─── Navigation ─── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/progress"
          className="card-elevated flex items-center gap-3 rounded-xl bg-(--bg-card) p-4 transition-colors hover:bg-(--bg-card-hover) sm:p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--accent-orange-light) text-(--accent-orange)">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-(--text-primary)">{t("home.moreDetails")}</p>
            <p className="text-xs text-(--text-muted)">{t("progress.intro")}</p>
          </div>
        </Link>
        <Link
          href="/race"
          className="card-elevated flex items-center gap-3 rounded-xl bg-(--bg-card) p-4 transition-colors hover:bg-(--bg-card-hover) sm:p-5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--accent-orange-light) text-(--accent-orange)">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-(--text-primary)">{t("home.raceDay")}</p>
            <p className="text-xs text-(--text-muted)">{t("race.preRaceDesc")}</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="block font-mono text-xl font-bold text-(--accent-orange) sm:text-2xl">
        {value}
      </span>
      <span className="text-xs text-(--text-muted)">{label}</span>
    </div>
  );
}
