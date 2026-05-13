import type { ScoreBand } from "@/lib/types";
import { cn } from "@/lib/utils";

const BAND_COLORS: Record<ScoreBand, string> = {
  Low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  High: "bg-orange-100 text-orange-900 border-orange-200",
  Critical: "bg-red-100 text-red-800 border-red-200",
};

export function ScoreBandPill({ band, className }: { band: ScoreBand; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        BAND_COLORS[band],
        className
      )}
    >
      {band}
    </span>
  );
}
