"use client";

import Image from "next/image";
import { useState } from "react";

export function AthleteProfile() {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-start gap-5">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-emerald-100 dark:bg-emerald-900">
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              DR
            </div>
          ) : (
            <Image
              src="/profile.jpeg"
              alt="Dennis Rijkers"
              fill
              className="object-cover"
              sizes="96px"
              priority
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Dennis Rijkers
          </h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              In training
            </span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Ultravasan 90 — 15 aug 2026
            </span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Ultrarunner in opleiding. Van nul naar 92 km door de Zweedse
            wildernis. Elke week een stap dichter bij de finish in Mora.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span>
              Coach:{" "}
              <span className="font-medium text-zinc-600 dark:text-zinc-300">
                Sophia Sundberg
              </span>
              <span className="ml-1 text-zinc-400">
                — Officieel Vasaloppscoach, 2e vrouw Ultravasan 90 (2023)
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
