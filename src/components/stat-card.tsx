interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

export function StatCard({ title, value, subtitle, accent }: StatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {title}
      </p>
      <p
        className={`mt-1 text-3xl font-bold tracking-tight ${
          accent
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-zinc-900 dark:text-zinc-100"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}
