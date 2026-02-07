// Chart colors — Recharts needs JS hex values, can't use CSS vars directly

export const colors = {
  emerald: {
    primary: "#34d399",
    muted: "#059669",
    light: "#6ee7b7",
    bar: "#34d399",
    barLight: "#34d39940",
  },
  orange: {
    primary: "#e07a3a",
    muted: "#b8622e",
    light: "#f0a06a",
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
    grid: "#2a2823",
    gridLight: "#e2dfd8",
    text: "#9d9a93",
    textLight: "#6e6b64",
  },
} as const;

export const tooltipStyle = {
  background: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--text-primary)",
} as const;

export const gridStroke = "#2a2823";
