import type { CategoryScore, ScoreBand } from "@/lib/types";

const BAND_COLOR: Record<ScoreBand, string> = {
  Low: "bg-emerald-500",
  Medium: "bg-amber-500",
  High: "bg-orange-500",
  Critical: "bg-red-600",
};

export function CategoryBarChart({ categories }: { categories: CategoryScore[] }) {
  return (
    <div className="space-y-3">
      {categories.map((c) => (
        <div key={c.key}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">{c.label}</span>
            <span className="tabular-nums text-slate-600">
              {c.score}/100 · {c.band}
            </span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${BAND_COLOR[c.band]}`}
              style={{ width: `${Math.min(100, c.score)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
