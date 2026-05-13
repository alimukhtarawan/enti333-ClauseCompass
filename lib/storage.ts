import type { OverallReport } from "@/lib/types";

const PREFIX = "hireguard:report:";

export function saveReport(report: OverallReport): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + report.id, JSON.stringify(report));
}

export function loadReport(id: string): OverallReport | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PREFIX + id);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OverallReport;
  } catch {
    return null;
  }
}

export function listUserReports(): OverallReport[] {
  if (typeof window === "undefined") return [];
  const out: OverallReport[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (!k || !k.startsWith(PREFIX)) continue;
    try {
      const v = window.localStorage.getItem(k);
      if (v) out.push(JSON.parse(v));
    } catch {
      /* ignore */
    }
  }
  return out;
}
