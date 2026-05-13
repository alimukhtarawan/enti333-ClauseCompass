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

export function scoreContract(e: ExtractedContract): {
  categories: CategoryScore[];
  overallScore: number;
  overallBand: ScoreBand;
} {
  const categories: CategoryScore[] = (Object.keys(CATEGORY_WEIGHTS) as CategoryKey[]).map(
    (key) => {
      const hits: RuleHit[] = [];
      let raw = 0;
      for (const r of RULES_BY_CATEGORY[key]) {
        if (r.fires(e)) {
          raw += r.points;
          hits.push(toRuleHit(r, e));
        }
      }
      const score = Math.min(100, raw);
      return { key, label: CATEGORY_LABELS[key], score, band: toBand(score), hits };
    }
  );
  const overall = Math.round(
    categories.reduce((s, c) => s + c.score * CATEGORY_WEIGHTS[c.key], 0)
  );
  return { categories, overallScore: overall, overallBand: toBand(overall) };
}
