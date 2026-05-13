"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveReport } from "@/lib/storage";
import { extractFileText } from "@/lib/extract-file-text";
import type { OverallReport } from "@/lib/types";

const STAGES = [
  "Extracting fields…",
  "Scoring against Alberta rules…",
  "Composing report…",
];

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileBusy, setFileBusy] = useState<string | null>(null);

  async function onFileChosen(file: File | null) {
    if (!file) return;
    setError(null);
    setFileBusy(`Reading ${file.name}…`);
    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File is larger than 10 MB.");
      }
      const extracted = await extractFileText(file);
      if (!extracted || extracted.length < 200) {
        throw new Error(
          `Only ${extracted.length} characters extracted from "${file.name}". This may be a scanned PDF — please paste the text manually.`
        );
      }
      const trimmed = extracted.slice(0, 20000);
      setText(trimmed);
      if (extracted.length > 20000) {
        setError(
          `Extracted ${extracted.length.toLocaleString()} characters from "${file.name}"; only the first 20,000 will be analyzed. Edit the text below if you need to keep different sections.`
        );
      }
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setFileBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function onAnalyze() {
    setError(null);
    setLoading(true);
    setStage(0);
    const interval = setInterval(
      () => setStage((s) => Math.min(s + 1, STAGES.length - 1)),
      700
    );
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
          setError(
            "The AI extraction service returned an error. " +
              (body?.message ? `Details: ${body.message}` : "Please try again in a moment.")
          );
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
      <h1 className="text-2xl font-semibold">Analyze an Alberta employment contract</h1>
      <p className="text-sm text-slate-600 mt-1">
        Upload a PDF, DOCX, or TXT file — or paste the text directly. The contract text is sent
        to Gemini once for extraction, then scored locally against 19 Alberta-law rules.
      </p>

      <div className="mt-6 card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
            className="hidden"
            id="contract-file-input"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={!!fileBusy || loading}
            className="btn-primary"
          >
            {fileBusy ?? "Upload contract file"}
          </button>
          <span className="text-xs text-slate-500">
            PDF, DOCX, or TXT · max 10 MB · processed in your browser
          </span>
        </div>
      </div>

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
        placeholder="Paste full contract text here, or use the upload button above…"
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
        {tooShort && !loading && text.length === 0 && (
          <span className="text-xs text-slate-500">
            Upload a file or paste at least 200 characters of text.
          </span>
        )}
        {tooShort && !loading && text.length > 0 && (
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
