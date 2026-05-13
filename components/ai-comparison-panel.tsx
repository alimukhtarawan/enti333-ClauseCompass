"use client";

import { useState, useEffect, useRef } from "react";
import type { AIComparison, OverallReport, ProviderOpinion } from "@/lib/types";

export function AIComparisonPanel({
  report,
  contractText,
  initial,
}: {
  report: OverallReport;
  contractText: string;
  initial?: AIComparison;
}) {
  const [comparison, setComparison] = useState<AIComparison | null>(initial ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (initial || !contractText || report.source === "seed") return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contractText, reportId: report.id }),
    })
      .then((r) => r.json())
      .then(setComparison)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [report.id, initial, contractText, report.source]);

  return (
    <section aria-label="AI opinions comparison" className="mt-8">
      <h2 className="text-xl font-semibold">How do raw AI tools compare?</h2>
      <p className="text-sm text-slate-600 mt-1">
        Same contract, three opinions. Citations flagged with ⚠ are not in our verified
        Alberta-law whitelist and may be hallucinated.
      </p>
      {loading && (
        <p className="text-sm text-slate-500 mt-4">
          Loading comparison from ChatGPT and raw Gemini…
        </p>
      )}
      {error && <p className="text-sm text-red-600 mt-4">Comparison failed: {error}</p>}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {comparison.providers.map((p) => (
            <ProviderColumn key={p.provider} opinion={p} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProviderColumn({ opinion }: { opinion: ProviderOpinion }) {
  const isHireguard = opinion.provider === "hireguard";
  return (
    <div
      className={`card p-4 ${
        isHireguard ? "border-emerald-500 border-2" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-sm">{opinion.displayName}</h3>
        {isHireguard && (
          <span className="text-xs text-emerald-700 font-medium">structured</span>
        )}
      </div>
      {opinion.status === "error" ? (
        <p className="mt-3 text-sm text-red-600">
          Service unavailable: {opinion.errorMessage}
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {opinion.text}
          </p>
          {opinion.citations.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs">
              {opinion.citations.map((c, i) => (
                <li
                  key={i}
                  className={
                    c.status === "verified"
                      ? "text-emerald-700"
                      : "text-amber-700"
                  }
                >
                  {c.status === "verified" ? "✓ Verified" : "⚠ Unverified"}: {c.text}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
