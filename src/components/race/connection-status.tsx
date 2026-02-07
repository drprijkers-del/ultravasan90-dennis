interface ConnectionStatusProps {
  connected: boolean;
  lastUpdate: Date | null;
}

function minutesAgo(date: Date): number {
  return Math.floor((Date.now() - date.getTime()) / 60000);
}

export function ConnectionStatus({
  connected,
  lastUpdate,
}: ConnectionStatusProps) {
  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-sm font-medium text-emerald-600">Live</span>
      </div>
    );
  }

  const mins = lastUpdate ? minutesAgo(lastUpdate) : null;

  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
      <span className="text-sm text-(--text-muted)">
        {mins !== null
          ? `Laatst gezien ${mins} min geleden`
          : "Niet verbonden"}
      </span>
    </div>
  );
}
