"use client";

import { useState } from "react";

export interface FilterState {
  period: "4w" | "12w" | "ytd" | "all";
  type: "all" | "longrun" | "interval" | "easy";
  sundaysOnly: boolean;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

const periods: { value: FilterState["period"]; label: string }[] = [
  { value: "4w", label: "4w" },
  { value: "12w", label: "12w" },
  { value: "ytd", label: "YTD" },
  { value: "all", label: "All" },
];

const types: { value: FilterState["type"]; label: string }[] = [
  { value: "all", label: "Alle" },
  { value: "longrun", label: "Long run" },
  { value: "interval", label: "Interval" },
  { value: "easy", label: "Easy" },
];

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "bg-(--accent) text-(--bg-primary)"
          : "bg-(--bg-inset) text-(--text-secondary) hover:text-(--text-primary)"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {/* Period */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-(--text-muted)">Periode</span>
        <div className="flex gap-1">
          {periods.map((p) => (
            <Pill
              key={p.value}
              active={filters.period === p.value}
              onClick={() => onChange({ ...filters, period: p.value })}
            >
              {p.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-(--text-muted)">Type</span>
        <div className="flex gap-1">
          {types.map((t) => (
            <Pill
              key={t.value}
              active={filters.type === t.value}
              onClick={() => onChange({ ...filters, type: t.value })}
            >
              {t.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* Sundays only */}
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={filters.sundaysOnly}
          onChange={(e) =>
            onChange({ ...filters, sundaysOnly: e.target.checked })
          }
          className="h-4 w-4 rounded border border-(--border-primary) accent-(--accent)"
        />
        <span className="text-xs font-medium text-(--text-secondary)">
          Alleen zondag
        </span>
      </label>
    </div>
  );

  return (
    <div className="sticky top-[57px] z-10 -mx-4 border-b border-(--border-primary) bg-(--bg-primary)/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      {/* Mobile toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between rounded-lg bg-(--bg-inset) px-3 py-2 text-sm font-medium text-(--text-secondary)"
        >
          <span>Filters</span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {open && <div className="mt-3">{content}</div>}
      </div>

      {/* Desktop: always visible */}
      <div className="hidden md:block">{content}</div>
    </div>
  );
}
