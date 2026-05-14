import type {
  ExtractedContract,
  CategoryScore,
  ScoreBand,
  CategoryKey,
  Rule,
  RuleHit,
} from "@/lib/types";
import { CATEGORY_WEIGHTS, CATEGORY_LABELS, BAND_THRESHOLDS } from "@/lib/constants";
import { RULES as TERM } from "./termination";
import { RULES as REST } from "./restrictive";
import { RULES as COMP } from "./compliance";
import { RULES as PAY } from "./compensation";
import { RULES as WR } from "./workplace-rights";
import { RULES as FLEX } from "./flexibility";

const RULES_BY_CATEGORY: Record<CategoryKey, Rule[]> = {
  termination: TERM,
  restrictive: REST,
  compliance: COMP,
  compensation: PAY,
  workplaceRights: WR,
  flexibility: FLEX,
};

export const ALL_RULES: Rule[] = Object.values(RULES_BY_CATEGORY).flat();

export function getRuleById(id: string): Rule | undefined {
  return ALL_RULES.find((r) => r.id === id);
}

function toBand(s: number): ScoreBand {
  if (s < BAND_THRESHOLDS.low) return "Low";
  if (s < BAND_THRESHOLDS.medium) return "Medium";
  if (s < BAND_THRESHOLDS.high) return "High";
  return "Critical";
}

function toRuleHit(rule: Rule, e: ExtractedContract): RuleHit {
  const excerpt = (e as any)[rule.category]?.excerpt ?? null;
  return {
    ruleId: rule.id,
    name: rule.name,
    severity: rule.severity,
    points: rule.points,
    citation: rule.citation,
    jurisdiction: rule.jurisdiction,
    jurisdictionNote: rule.jurisdictionNote,
    canliiUrl: rule.canliiUrl,
    explanation: rule.explanation(e),
    excerpt,
  };
}

/**
 * Returns true if the given category section is entirely absent from the contract.
 * Absence of restrictive covenants is not a risk (absence = good), so restrictive is excluded.
 */
function isSectionMissing(key: CategoryKey, e: ExtractedContract): boolean {
  switch (key) {
    case "termination":
      return (
        e.termination.excerpt === null &&
        e.termination.noticePeriod === null &&
        e.termination.severancePay === null &&
        e.termination.savingLanguage === null
      );
    case "compensation":
      return (
        e.compensation.excerpt === null &&
        e.compensation.baseSalary === null &&
        e.compensation.vacationPay === null
      );
    case "compliance":
      return (
        e.compliance.excerpt === null &&
        e.compliance.governingLaw === null &&
        e.compliance.statutoryReferences.length === 0
      );
    case "flexibility":
      return (
        e.flexibility.excerpt === null &&
        e.flexibility.unilateralChangeClause === null &&
        e.flexibility.layoffWithoutPay === null &&
        e.flexibility.probationPeriodMonths === null
      );
    case "workplaceRights":
      return (
        e.workplaceRights.excerpt === null &&
        e.workplaceRights.privacyClause === null &&
        e.workplaceRights.surveillanceClause === null &&
        e.workplaceRights.ipAssignment === null
      );
    case "restrictive":
      // Absence of non-compete / non-solicit clauses is not a risk factor.
      return false;
    default:
      return false;
  }
}

function missingHit(key: CategoryKey): RuleHit {
  const labels: Record<CategoryKey, string> = {
    termination: "termination",
    restrictive: "restrictive covenants",
    compliance: "statutory compliance",
    compensation: "compensation",
    workplaceRights: "workplace rights",
    flexibility: "flexibility & change",
  };
  return {
    ruleId: `${key}-missing`,
    name: "Section absent from contract",
    severity: "Critical",
    points: 100,
    citation: "Complete Alberta employment agreements must address this area explicitly.",
    jurisdiction: "AB-statute",
    explanation: `No ${labels[key]} provisions were found in this contract. Missing clauses create legal uncertainty, default the relationship to statutory minimums (which may not protect either party's interests), and are a common source of employment disputes. A complete Alberta employment agreement must explicitly address this section.`,
    excerpt: null,
  };
}

export function scoreContract(e: ExtractedContract): {
  categories: CategoryScore[];
  overallScore: number;
  overallBand: ScoreBand;
} {
  const categories: CategoryScore[] = (Object.keys(CATEGORY_WEIGHTS) as CategoryKey[]).map(
    (key) => {
      const missing = isSectionMissing(key, e);

      if (missing) {
        // Missing section → max out the category score with a Critical hit
        return {
          key,
          label: CATEGORY_LABELS[key],
          score: 100,
          band: toBand(100),
          hits: [missingHit(key)],
          missing: true,
        };
      }

      const hits: RuleHit[] = [];
      let raw = 0;
      for (const r of RULES_BY_CATEGORY[key]) {
        if (r.fires(e)) {
          raw += r.points;
          hits.push(toRuleHit(r, e));
        }
      }
      const score = Math.min(100, raw);
      return { key, label: CATEGORY_LABELS[key], score, band: toBand(score), hits, missing: false };
    }
  );

  // Sensitivity-weighted overall score:
  // Blend the weighted average (breadth of risk) with the worst single category
  // (severity of worst risk). This ensures one critically-missing or high-risk
  // section cannot be masked by good scores elsewhere.
  const weightedAvg = categories.reduce((s, c) => s + c.score * CATEGORY_WEIGHTS[c.key], 0);
  const maxCategoryScore = Math.max(...categories.map((c) => c.score));

  // 50% weight average + 50% worst category → one Critical category alone
  // pulls the overall to at least the midpoint between 0 and that score.
  const overall = Math.min(100, Math.round(0.5 * weightedAvg + 0.5 * maxCategoryScore));

  return { categories, overallScore: overall, overallBand: toBand(overall) };
}
