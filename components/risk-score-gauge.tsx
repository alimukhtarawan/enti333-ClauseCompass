import type { ScoreBand } from "@/lib/types";

const BAND_COLOR: Record<ScoreBand, string> = {
  Low: "#10b981",
  Medium: "#f59e0b",
  High: "#f97316",
  Critical: "#dc2626",
};

export function RiskScoreGauge({ score, band }: { score: number; band: ScoreBand }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = c * pct;
  const color = BAND_COLOR[band];
  return (
    <div className="flex items-center gap-6">
      <svg width="160" height="160" viewBox="0 0 160 160" aria-label={`Risk score ${score} out of 100`}>
        <circle cx="80" cy="80" r={r} stroke="#e2e8f0" strokeWidth="14" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={r}
          stroke={color}
          strokeWidth="14"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
          transform="rotate(-90 80 80)"
          strokeLinecap="round"
        />
        <text x="80" y="78" textAnchor="middle" fontSize="32" fontWeight="700" fill="#0f172a">
          {score}
        </text>
        <text x="80" y="100" textAnchor="middle" fontSize="11" fill="#64748b">
          /100
        </text>
      </svg>
      <div>
        <div className="text-sm text-slate-500 uppercase tracking-wider">Overall risk</div>
        <div className="text-2xl font-semibold mt-1" style={{ color }}>
          {band}
        </div>
        <div className="text-xs text-slate-500 mt-2 max-w-xs">
          Weighted across six Alberta-law categories (termination, restrictive covenants,
          compliance, compensation, workplace rights, flexibility).
        </div>
      </div>
    </div>
  );
}
