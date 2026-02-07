import { TARGET_BAND } from "@/lib/race-config";

interface Props {
  status: "op_schema" | "achter_op_schema";
  rollingAvgKm: number;
}

export function StatusBadge({ status, rollingAvgKm }: Props) {
  const onTrack = status === "op_schema";

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm ${
        onTrack
          ? "bg-(--accent-light) text-(--accent-text)"
          : "bg-(--accent-2-light) text-(--accent-2-text)"
      }`}
    >
      <span className="text-base">{onTrack ? "\u2705" : "\u26A0\uFE0F"}</span>
      <span className="font-medium">
        {onTrack ? "Op schema" : "Achter op schema"}
      </span>
      <span className="hidden text-xs opacity-75 sm:inline">
        &middot; 4-weken gem: {rollingAvgKm.toFixed(1)} km/week (doel: {TARGET_BAND.min}&ndash;{TARGET_BAND.max})
      </span>
    </div>
  );
}
