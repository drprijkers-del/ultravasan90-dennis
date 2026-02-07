interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, subtitle, accent, icon }: StatCardProps) {
  return (
    <div className="card-elevated rounded-xl bg-(--bg-card) p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-(--text-muted) sm:text-sm">
          {title}
        </p>
        {icon && <span className="text-lg text-(--text-muted)">{icon}</span>}
      </div>
      <p
        className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${
          accent ? "text-(--accent)" : "text-(--text-primary)"
        }`}
      >
        {value}
      </p>
      {subtitle && (
        <p className="mt-1 text-xs text-(--text-muted) sm:text-sm">
          {subtitle}
        </p>
      )}
    </div>
  );
}
