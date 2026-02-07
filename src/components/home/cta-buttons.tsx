import Link from "next/link";

export function CTAButtons() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/race"
        className="flex-1 rounded-xl bg-(--accent) px-6 py-3.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        Volg Race Day live
      </Link>
      <Link
        href="/progress"
        className="flex-1 rounded-xl border border-(--border-secondary) bg-(--bg-card) px-6 py-3.5 text-center text-sm font-semibold text-(--text-primary) transition-colors hover:bg-(--bg-card-hover)"
      >
        Bekijk Progress
      </Link>
    </div>
  );
}
