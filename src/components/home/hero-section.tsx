"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getCountdown, TRAINING_TARGET_KM } from "@/lib/race-config";

interface Props {
  totalKm: number;
  totalRuns: number;
  totalHours: number;
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
    <div className="card-elevated rounded-xl bg-(--bg-card) p-5 sm:p-6">
      {/* Top: profile + title + countdown */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-(--accent-orange) sm:h-16 sm:w-16">
            {imgError ? (
              <div className="flex h-full w-full items-center justify-center bg-(--accent-orange-light) text-lg font-bold text-(--accent-orange)">
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
              Op weg naar Ultravasan
            </h1>
            <p className="mt-0.5 text-sm text-(--text-secondary)">
              Elke week dichter bij de startlijn in S&auml;len. 92 km trail, 15 augustus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {countdown.phase === "in_training" ? (
            <>
              <CountdownUnit value={countdown.days} label="dagen" />
              <CountdownUnit value={countdown.hours} label="uren" />
              <CountdownUnit value={countdown.minutes} label="min" />
            </>
          ) : countdown.phase === "race_day" ? (
            <span className="text-lg font-bold text-(--accent-orange)">RACE DAY!</span>
          ) : (
            <span className="text-lg font-bold text-(--accent)">Gefinisht!</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-(--text-muted)">
          <span>{totalKm} / {TRAINING_TARGET_KM} km</span>
          <span>{pct}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-(--bg-inset)">
          <div
            className="h-full rounded-full bg-(--accent) transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Collapsible: race info */}
      <details className="mt-5">
        <summary className="flex items-center gap-2 text-xs font-medium text-(--text-muted) transition-colors hover:text-(--text-secondary)">
          <svg className="h-3.5 w-3.5 transition-transform [[open]>&]:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Over deze race
        </summary>

        <div className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-(--text-secondary)">
            <strong className="text-(--text-primary)">Ultravasan 90</strong> is de hardloopvariant
            van de legendarische <em>Vasaloppet</em> &mdash; de oudste en grootste
            langlaufrace ter wereld (sinds 1922). 92 km over bospaadjes, grindwegen en
            veengebieden van S&auml;len naar Mora in Dalarna. Tijdslimiet: 15,5 uur.
          </p>
          <p className="text-sm leading-relaxed text-(--text-secondary)">
            <strong className="text-(--accent-orange)">Doel: sub 10 uur</strong> &mdash; wie
            onder de 10 uur finisht ontvangt een speciale medaille.
            Ik heb een tweede huis in <strong className="text-(--text-primary)">Finnbodarna</strong>,
            een klein bergdorp in het Vasaloppet-gebied, dus het parcours is vertrouwd terrein.
          </p>

          {/* Coach */}
          <div className="flex items-start gap-3 rounded-lg bg-(--bg-inset) p-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--accent-orange-light) text-sm font-bold text-(--accent-orange)">
              SS
            </div>
            <div>
              <p className="text-sm font-medium text-(--text-primary)">
                Coach: Sophia Sundberg
              </p>
              <p className="mt-1 text-xs leading-relaxed text-(--text-muted)">
                Zweedse ultrarunner &middot; 2e vrouw Ultravasan 90 (2023, 7:25:59) &middot;
                1e Lidings&ouml;loppet Ultra 50K (2012) &middot; Officieel Vasaloppscoach
              </p>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="block font-mono text-2xl font-bold text-(--accent-orange) sm:text-3xl">
        {value}
      </span>
      <span className="text-xs text-(--text-muted)">{label}</span>
    </div>
  );
}
