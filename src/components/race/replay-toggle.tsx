interface ReplayToggleProps {
  active: boolean;
  onToggle: () => void;
}

export function ReplayToggle({ active, onToggle }: ReplayToggleProps) {
  return (
    <div className="flex items-center gap-3">
      {active && (
        <span className="rounded-full bg-(--accent-2-light) px-2.5 py-0.5 text-xs font-semibold text-(--accent-2-text)">
          Demo
        </span>
      )}
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          active ? "bg-(--accent-2)" : "bg-(--border-secondary)"
        }`}
        role="switch"
        aria-checked={active}
        aria-label="Demo modus"
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ${
            active ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className="text-xs font-medium text-(--text-muted)">
        Replay demo
      </span>
    </div>
  );
}
