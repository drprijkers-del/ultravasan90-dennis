// Chart colors — Recharts needs JS hex values, can't use CSS vars directly

export const colors = {
  emerald: {
    primary: "#059669",
    muted: "#10b981",
    light: "#6ee7b7",
    bar: "#059669",
    barLight: "#05966930",
  },
  orange: {
    primary: "#d96c2c",
    muted: "#b8622e",
    light: "#f0a06a",
  },
  amber: {
    primary: "#d97706",
    muted: "#b45309",
    light: "#fbbf24",
  },
  red: {
    primary: "#dc2626",
    muted: "#ef4444",
  },
  purple: {
    primary: "#7c3aed",
    muted: "#6d28d9",
  },
  zinc: {
    grid: "#e5e7eb",
    gridLight: "#f3f4f6",
    text: "#6b7280",
    textLight: "#9ca3af",
  },
} as const;

export const tooltipStyle = {
  background: "var(--chart-tooltip-bg)",
  border: "1px solid var(--chart-tooltip-border)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--text-primary)",
} as const;

export const gridStroke = "#e5e7eb";
