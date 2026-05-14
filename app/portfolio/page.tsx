"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

  const sorted = [...userReports].sort((a, b) => b.overallScore - a.overallScore);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: "#1a3060" }}>
            Your analyzed contracts
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {sorted.length === 0
              ? "No contracts analyzed yet."
              : `${sorted.length} contract${sorted.length === 1 ? "" : "s"} analyzed.`}
          </p>
        </div>
        <Link href="/analyze" className="btn-primary">
          Analyze a contract
        </Link>
      </div>

      {sorted.length === 0 ? (
        <div className="mt-16 text-center py-20 card">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-lg font-semibold text-slate-800">No contracts yet</h2>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
            Upload your first Alberta employment contract to get a risk score, flag missing
            clauses, and see a full breakdown across six legal categories.
          </p>
          <Link href="/analyze" className="btn-primary mt-6 inline-flex">
            Upload a contract
          </Link>
        </div>
      ) : (
        <div className="mt-6 card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-left">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">Title</th>
                <th className="px-4 py-3 font-medium text-slate-700">Analyzed</th>
                <th className="px-4 py-3 font-medium text-slate-700">Risk Level</th>
                <th className="px-4 py-3 font-medium text-slate-700">Top category</th>
                <th className="px-4 py-3 font-medium text-slate-700">Highest flag</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const cats = r.categories ?? [];
                const topCat = [...cats].sort((a, b) => b.score - a.score)[0];
                const topHit = cats
                  .flatMap((c) => c.hits ?? [])
                  .sort((a, b) => b.points - a.points)[0];
                const isSerious = r.overallBand === "High" || r.overallBand === "Critical";
                const hasMissing = cats.some((c) => c.missing);
                return (
                  <tr
                    key={r.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                      isSerious ? "border-l-4 border-l-red-500" : ""
                    }`}
                    onClick={() => (window.location.href = `/contracts/${r.id}`)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/contracts/${r.id}`}
                          className="font-medium text-slate-900 hover:underline"
                          style={{ color: "#1a3060" }}
                        >
                          {r.title}
                        </Link>
                        {hasMissing && (
                          <span className="text-[10px] uppercase font-semibold tracking-wide bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                            Missing clauses
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-semibold">{r.overallScore}</span>
                        <ScoreBandPill band={r.overallBand} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {topCat ? (
                        <>
                          {topCat.label}{" "}
                          <span className="text-xs text-slate-500">({topCat.score})</span>
                          {topCat.missing && (
                            <span className="ml-1 text-[10px] uppercase font-semibold bg-red-100 text-red-700 px-1 py-0.5 rounded">
                              absent
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
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
      )}
    </div>
  );
}
