"use client";

import type { OverallReport } from "@/lib/types";
import { DISCLAIMER } from "@/lib/constants";

export async function downloadPdf(report: OverallReport): Promise<void> {
  const { pdf, Document, Page, Text, View, StyleSheet } = await import("@react-pdf/renderer");

  const styles = StyleSheet.create({
    page: { padding: 36, fontSize: 10, fontFamily: "Helvetica" },
    h1: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
    h2: { fontSize: 13, fontWeight: 700, marginTop: 14, marginBottom: 6 },
    h3: { fontSize: 11, fontWeight: 700, marginTop: 8, marginBottom: 4 },
    p: { marginBottom: 4, lineHeight: 1.4 },
    meta: { color: "#475569", fontSize: 9, marginBottom: 8 },
    hit: {
      marginBottom: 8,
      padding: 6,
      borderLeft: 2,
      borderLeftColor: "#cbd5e1",
      backgroundColor: "#f8fafc",
    },
    sev: { fontWeight: 700 },
    cite: { color: "#475569", fontSize: 9, marginTop: 2 },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 36,
      right: 36,
      fontSize: 7,
      color: "#64748b",
    },
  });

  const Doc = (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <Text style={styles.h1}>HireGuard Risk Report</Text>
        <Text style={styles.meta}>
          {report.title} · {new Date(report.createdAt).toLocaleDateString()} · Overall:{" "}
          {report.overallScore}/100 ({report.overallBand})
        </Text>
        <Text style={styles.h2}>Summary</Text>
        {report.summary.split("\n\n").map((para, i) => (
          <Text key={i} style={styles.p}>
            {para}
          </Text>
        ))}
        <Text style={styles.h2}>Category scores</Text>
        {report.categories.map((c) => (
          <Text key={c.key} style={styles.p}>
            {c.label}: {c.score}/100 ({c.band})
          </Text>
        ))}
        <Text style={styles.h2}>Red flags</Text>
        {report.categories.flatMap((c) =>
          c.hits.map((h) => (
            <View key={c.key + h.ruleId} style={styles.hit} wrap={false}>
              <Text>
                <Text style={styles.sev}>[{h.severity}] </Text>
                {h.name} ({c.label})
              </Text>
              <Text style={styles.p}>{h.explanation}</Text>
              <Text style={styles.cite}>{h.citation}</Text>
            </View>
          ))
        )}
        <Text style={styles.h2}>Questions for your Alberta employment lawyer</Text>
        {report.questionsForLawyer.map((q, i) => (
          <Text key={i} style={styles.p}>
            {i + 1}. {q}
          </Text>
        ))}
        <Text style={styles.footer} fixed>
          {DISCLAIMER}
        </Text>
      </Page>
    </Document>
  );

  const blob = await pdf(Doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hireguard-${report.id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
