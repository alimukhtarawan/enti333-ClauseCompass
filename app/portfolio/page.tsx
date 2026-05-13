"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SEED_CONTRACTS } from "@/lib/seed";
import { listUserReports } from "@/lib/storage";
import type { OverallReport } from "@/lib/types";
import { ScoreBandPill } from "@/components/score-band-pill";

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false);
  const [userReports, setUserReports] = useState<OverallReport[]>([]);

  useEffect(() => {
    setUserReports(listUserReports());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const seedReports = SEED_CONTRACTS.map((s) => s.precomputed);
  const all = [...seedReports, ...userReports].sort((a, b) => b.overallScore - a.overallScore);
  const top3Ids = new Set(all.slice(0, 3).map((r) => r.id));

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your contracts</h1>
        <Link href="/analyze" className="btn-primary">
          Add another contract
        </Link>
      </div>
      <p className="text-sm text-slate-600 mt-1">
        {seedReports.length} sample contracts + {userReports.length} of your own. Click any row
        for the full report.
      </p>

      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-left">
            <tr>
              <th className="px-4 py-3 font-medium text-slate-700">Title</th>
              <th className="px-4 py-3 font-medium text-slate-700">Source</th>
              <th className="px-4 py-3 font-medium text-slate-700">Overall</th>
              <th className="px-4 py-3 font-medium text-slate-700">Top category</th>
              <th className="px-4 py-3 font-medium text-slate-700">Top red flag</th>
            </tr>
          </thead>
          <tbody>
            {all.map((r) => {
              const topCat = [...r.categories].sort((a, b) => b.score - a.score)[0];
              const topHit = r.categories.flatMap((c) => c.hits).sort((a, b) => b.points - a.points)[0];
              const isTop = top3Ids.has(r.id);
              const isSerious = r.overallBand === "High" || r.overallBand === "Critical";
              return (
                <tr
                  key={r.id}
                  className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                    isSerious ? "border-l-4 border-l-red-500" : ""
                  }`}
                  onClick={() => (window.location.href = `/contracts/${r.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link href={`/contracts/${r.id}`} className="font-medium text-slate-900 hover:text-brand">
                        {r.title}
                      </Link>
                      {isTop && (
                        <span className="text-[10px] uppercase font-semibold tracking-wide bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          Top risk
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {r.source === "seed" ? "Sample" : "User-pasted"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums font-semibold">{r.overallScore}</span>
                      <ScoreBandPill band={r.overallBand} />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {topCat?.label ?? "—"}{" "}
                    <span className="text-xs text-slate-500">({topCat?.score ?? 0})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-xs">
                    {topHit ? topHit.name : "No rules fired"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
