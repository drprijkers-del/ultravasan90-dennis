// Chart colors — Recharts needs JS hex values, can't use CSS vars directly

export const colors = {
  emerald: {
    primary: "#34d399",
    muted: "#059669",
    light: "#6ee7b7",
    bar: "#34d399",
    barLight: "#6ee7b740",
  },
  amber: {
    primary: "#fbbf24",
    muted: "#d97706",
    light: "#fcd34d",
  },
  red: {
    primary: "#f87171",
    muted: "#ef4444",
  },
  purple: {
    primary: "#a78bfa",
    muted: "#7c3aed",
  },
  zinc: {
    grid: "#27272a",
    gridLight: "#e4e4e7",
    text: "#a1a1aa",
    textLight: "#71717a",
  },
} as const;

export const tooltipStyle = {
  background: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--text-primary)",
} as const;

export const gridStroke = "#27272a";
