import type { ExtractedContract, CategoryScore, Severity } from "@/lib/types";

const SEVERITY_ORDER: Record<Severity, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };

export function templateSummary(
  _extracted: ExtractedContract,
  categories: CategoryScore[]
): { summary: string; questionsForLawyer: string[] } {
  const allHits = categories.flatMap((c) => c.hits.map((h) => ({ ...h, categoryLabel: c.label })));
  const topHits = [...allHits]
    .sort(
      (a, b) =>
        SEVERITY_ORDER[b.severity] - SEVERITY_ORDER[a.severity] || b.points - a.points
    )
    .slice(0, 3);
  const overall = Math.round(categories.reduce((s, c) => s + c.score, 0) / categories.length);
  const criticalCount = allHits.filter((h) => h.severity === "Critical").length;
  const highCount = allHits.filter((h) => h.severity === "High").length;

  const para1 =
    topHits.length === 0
      ? `This contract scored ${overall}/100 across six risk categories. No rules fired at this level of analysis.`
      : `This contract scored ${overall}/100 across six risk categories, with ${criticalCount} Critical and ${highCount} High-severity issues identified. Highest-risk areas: ${topHits
          .map((h) => h.categoryLabel)
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 2)
          .join(" and ")}.`;
  const para2 =
    topHits.length === 0
      ? "HireGuard recommends a standard legal review before signing."
      : `Most pressing concern: "${topHits[0].name}" (${topHits[0].severity}). ${
          topHits[0].explanation.split(".")[0]
        }. Review with an Alberta employment lawyer before signing.`;

  const questions = topHits
    .slice(0, 5)
    .map(
      (h) =>
        `Regarding "${h.name}": is this clause enforceable in Alberta under the cited authority, and what alternative language would you recommend?`
    );
  if (questions.length < 3) {
    questions.push(
      "Are there Alberta-specific clauses missing that you'd recommend adding?",
      "How does this contract compare to others you've seen in our industry?",
      "What's the most common dispute pattern with contracts like this?"
    );
  }
  return { summary: `${para1}\n\n${para2}`, questionsForLawyer: questions.slice(0, 5) };
}
