export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-5">
      <Skeleton className="mb-3 h-4 w-24" />
      <Skeleton className="mb-2 h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-5">
      <Skeleton className="mb-4 h-4 w-40" />
      <Skeleton className="h-[200px] w-full sm:h-[260px]" />
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="rounded-xl border border-(--border-primary) bg-(--bg-card) p-6">
      <Skeleton className="mb-3 h-8 w-64" />
      <Skeleton className="mb-4 h-5 w-48" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
