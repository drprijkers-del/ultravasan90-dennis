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
  slate: {
    grid: "#334155",
    gridLight: "#e2e8f0",
    text: "#94a3b8",
    textLight: "#64748b",
  },
} as const;

export const tooltipStyle = {
  background: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--text-primary)",
} as const;

export const gridStroke = "#334155";
