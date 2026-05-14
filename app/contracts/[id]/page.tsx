"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { findSeed } from "@/lib/seed";
import { loadReport } from "@/lib/storage";
import { CATEGORY_WEIGHTS, BAND_THRESHOLDS, DISCLAIMER } from "@/lib/constants";
import type { OverallReport } from "@/lib/types";
import { RiskScoreGauge } from "@/components/risk-score-gauge";
import { CategoryBarChart } from "@/components/category-bar-chart";
import { RedFlagCard } from "@/components/red-flag-card";
import { AIComparisonPanel } from "@/components/ai-comparison-panel";
import { ScoreBandPill } from "@/components/score-band-pill";

const SEVERITY_ORDER = { Critical: 4, High: 3, Medium: 2, Low: 1 } as const;

export default function ContractReportPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [report, setReport] = useState<OverallReport | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (id?.startsWith("seed-")) {
      const seed = findSeed(id);
      setReport(seed?.precomputed ?? null);
    } else {
      setReport(loadReport(id));
    }
  }, [id]);

  if (!mounted) return null;
  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p>Report not found. <Link href="/portfolio" className="text-brand underline">Back to portfolio</Link>.</p>
      </div>
    );
  }

  const categories = report.categories ?? [];
  const summaryText = report.summary ?? "";
  const questions = report.questionsForLawyer ?? [];
  const allHits = categories
    .flatMap((c) => c.hits ?? [])
    .sort(
      (a, b) =>
        SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity] || b.points - a.points
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="bg-slate-100 px-2 py-0.5 rounded">
          {report.source === "seed" ? "Sample" : "User-pasted"}
        </span>
        <span>{new Date(report.createdAt).toLocaleString()}</span>
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mt-2">{report.title}</h1>

      <section className="card p-6 mt-6">
        <RiskScoreGauge score={report.overallScore} band={report.overallBand} />
      </section>

      <section className="card p-6 mt-6">
        <h2 className="text-lg font-semibold mb-4">Category breakdown</h2>
        <CategoryBarChart categories={categories} />
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Summary</h2>
        {summaryText.split("\n\n").map((p, i) => (
          <p key={i} className="mt-2 text-slate-700 leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Red flags ({allHits.length})</h2>
        {allHits.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            No rules fired against this contract. A standard legal review is still recommended.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            {allHits.map((h) => (
              <RedFlagCard key={h.ruleId} hit={h} />
            ))}
          </div>
        )}
      </section>

      <AIComparisonPanel
        report={report}
        contractText={report.rawText ?? ""}
        initial={report.aiComparison}
      />

      <section className="mt-8 card p-6">
        <h2 className="text-lg font-semibold">Questions for your Alberta employment lawyer</h2>
        <ol className="mt-3 list-decimal list-inside space-y-2 text-sm text-slate-700">
          {questions.map((q, i) => (
            <li key={i}>{q}</li>
          ))}
        </ol>
      </section>

      <details className="mt-6 card p-4 text-sm">
        <summary className="cursor-pointer font-medium">How we score</summary>
        <div className="mt-3 text-slate-700">
          <p className="mb-2">
            Each category is scored 0–100 by summing the points of fired rules (capped at 100).
            The overall score is the weighted average:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(CATEGORY_WEIGHTS).map(([k, w]) => (
              <li key={k}>
                {k}: {Math.round(w * 100)}%
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Bands: 0–{BAND_THRESHOLDS.low - 1} Low · {BAND_THRESHOLDS.low}–
            {BAND_THRESHOLDS.medium - 1} Medium · {BAND_THRESHOLDS.medium}–
            {BAND_THRESHOLDS.high - 1} High · {BAND_THRESHOLDS.high}–100 Critical.
          </p>
        </div>
      </details>

      <div className="mt-8 flex flex-wrap gap-3">
        <ExportPdfButton report={report} />
        <Link href="/portfolio" className="btn-secondary">
          Back to portfolio
        </Link>
      </div>

      <footer className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
        {DISCLAIMER}
      </footer>
    </div>
  );
}

const ExportPdfButton = dynamic(
  () => import("./export-pdf-button").then((m) => m.ExportPdfButton),
  { ssr: false }
);
