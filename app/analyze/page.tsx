"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveReport } from "@/lib/storage";
import type { OverallReport } from "@/lib/types";

const STAGES = [
  "Extracting fields…",
  "Scoring against Alberta rules…",
  "Composing report…",
];

export default function AnalyzePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function onAnalyze() {
    setError(null);
    setLoading(true);
    setStage(0);
    const interval = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 700);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: text, title: title || undefined }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (res.status === 400 && body?.error === "out_of_scope") {
          setError("This document does not appear to be an Alberta employment contract.");
        } else if (res.status === 502) {
          setError("Analysis service temporarily unavailable. Please try again.");
        } else {
          setError(body?.message || `Request failed (${res.status}).`);
        }
        return;
      }
      const report: OverallReport = await res.json();
      saveReport(report);
      router.push(`/contracts/${report.id}`);
    } catch (e) {
      setError(String(e));
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  const tooShort = text.length < 200;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Paste your Alberta employment contract</h1>
      <p className="text-sm text-slate-600 mt-1">
        Plain text only. No file is sent to our servers — only the text you paste here is sent
        to Gemini for one extraction call.
      </p>

      <label className="block mt-6 text-sm font-medium text-slate-700">
        Title (optional)
      </label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Account Manager Offer Letter"
        className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <label className="block mt-4 text-sm font-medium text-slate-700">
        Contract text
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mt-1 w-full min-h-[400px] rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
        placeholder="Paste full contract text here…"
      />
      <div className="mt-1 text-xs text-slate-500 text-right">
        {text.length}/20000
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onAnalyze}
          disabled={loading || tooShort || text.length > 20000}
          className="btn-primary"
        >
          {loading ? STAGES[stage] : "Analyze contract"}
        </button>
        {tooShort && !loading && (
          <span className="text-xs text-slate-500">
            Need at least 200 characters ({200 - text.length} more).
          </span>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
    </div>
  );
}
