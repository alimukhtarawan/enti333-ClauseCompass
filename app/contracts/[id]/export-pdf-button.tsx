"use client";

import { useState } from "react";
import type { OverallReport } from "@/lib/types";
import { downloadPdf } from "@/components/pdf-report";

export function ExportPdfButton({ report }: { report: OverallReport }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          await downloadPdf(report);
        } finally {
          setBusy(false);
        }
      }}
      disabled={busy}
      className="btn-primary"
    >
      {busy ? "Building PDF…" : "Export as PDF"}
    </button>
  );
}
