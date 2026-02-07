"use client";

import { useEffect, useState } from "react";
import { getCountdown, RACE_NAME } from "@/lib/race-config";

export function Countdown() {
  const [countdown, setCountdown] = useState(getCountdown());

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (countdown.phase === "finished") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950">
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          {RACE_NAME}
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
          Gefinisht!
        </p>
      </div>
    );
  }

  if (countdown.phase === "race_day") {
    return (
      <div className="rounded-xl border-2 border-orange-400 bg-orange-50 p-5 dark:border-orange-600 dark:bg-orange-950">
        <p className="text-sm font-bold text-orange-600 dark:text-orange-400">
          {RACE_NAME}
        </p>
        <p className="mt-1 text-2xl font-bold text-orange-700 dark:text-orange-300">
          RACE DAY!
        </p>
        <p className="mt-1 text-xs text-orange-500">
          Volg live op de Race Day pagina →
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {RACE_NAME}
        </p>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
          In training
        </span>
      </div>
      <div className="mt-3 flex gap-4">
        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {countdown.days}
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            dagen
          </p>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {countdown.hours}
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            uren
          </p>
        </div>
        <div className="text-center">
          <span className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {countdown.minutes}
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            min
          </p>
        </div>
      </div>
    </div>
  );
}
