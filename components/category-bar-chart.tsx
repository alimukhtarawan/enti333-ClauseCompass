import type { CategoryScore, ScoreBand } from "@/lib/types";

const BAND_COLOR: Record<ScoreBand, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-600",
};

const BAND_TEXT: Record<ScoreBand, string> = {
  Low: "text-emerald-700",
  Medium: "text-amber-700",
  High: "text-orange-700",
  Critical: "text-red-700",
};

export function CategoryBarChart({ categories }: { categories: CategoryScore[] }) {
  return (
    <div className="space-y-4">
      {categories.map((c) => (
        <div key={c.key}>
          <div className="flex justify-between items-center text-sm mb-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">{c.label}</span>
              {c.missing && (
                <span className="text-[10px] uppercase font-bold tracking-wide bg-red-100 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                  Section absent — max risk
                </span>
              )}
            </div>
            <span className={`tabular-nums font-semibold text-xs ${BAND_TEXT[c.band]}`}>
              {c.score}/100 · {c.band}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${BAND_COLOR[c.band]} ${c.missing ? "animate-pulse" : ""}`}
              style={{ width: `${Math.min(100, c.score)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
