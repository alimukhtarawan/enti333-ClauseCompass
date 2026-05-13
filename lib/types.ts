export type Severity = "Low" | "Medium" | "High" | "Critical";
export type Jurisdiction = "AB-statute" | "AB-caselaw" | "SCC" | "persuasive-non-AB";
export type ScoreBand = Severity;
export type CategoryKey =
  | "termination"
  | "restrictive"
  | "compliance"
  | "compensation"
  | "workplaceRights"
  | "flexibility";

export interface ClauseExcerpt {
  text: string;
  confidence: number;
}

export interface ExtractedContract {
  scopeFlag: "in_scope" | "out_of_scope";
  scopeReason?: string;
  termination: {
    noticePeriod: string | null;
    severancePay: string | null;
    savingLanguage: boolean | null;
    justCauseDefinition: string | null;
    excerpt: ClauseExcerpt | null;
  };
  restrictive: {
    nonCompete: { present: boolean; durationMonths: number | null; geography: string | null };
    nonSolicit: { present: boolean; durationMonths: number | null };
    excerpt: ClauseExcerpt | null;
  };
  compliance: {
    governingLaw: string | null;
    atWillLanguage: boolean | null;
    statutoryReferences: string[];
    excerpt: ClauseExcerpt | null;
  };
  compensation: {
    baseSalary: string | null;
    overtimeTreatment: "1.5x" | "straight-time" | "unstated" | null;
    vacationPay: string | null;
    bonusTerms: string | null;
    excerpt: ClauseExcerpt | null;
  };
  workplaceRights: {
    privacyClause: string | null;
    surveillanceClause: string | null;
    ipAssignment: string | null;
    excerpt: ClauseExcerpt | null;
  };
  flexibility: {
    unilateralChangeClause: boolean | null;
    layoffWithoutPay: boolean | null;
    probationPeriodMonths: number | null;
    excerpt: ClauseExcerpt | null;
  };
}

export interface Rule {
  id: string;
  category: CategoryKey;
  name: string;
  severity: Severity;
  points: number;
  citation: string;
  jurisdiction: Jurisdiction;
  jurisdictionNote?: string;
  canliiUrl?: string;
  fires: (e: ExtractedContract) => boolean;
  explanation: (e: ExtractedContract) => string;
}

export interface RuleHit {
  ruleId: string;
  name: string;
  severity: Severity;
  points: number;
  citation: string;
  jurisdiction: Jurisdiction;
  jurisdictionNote?: string;
  canliiUrl?: string;
  explanation: string;
  excerpt: ClauseExcerpt | null;
}

export interface CategoryScore {
  key: CategoryKey;
  label: string;
  score: number;
  band: ScoreBand;
  hits: RuleHit[];
}

export type ComparisonProvider = "chatgpt" | "geminiRaw" | "hireguard";

export interface CitationInOutput {
  text: string;
  matchedRuleId?: string;
  status: "verified" | "unverified-possible-hallucination";
}

export interface ProviderOpinion {
  provider: ComparisonProvider;
  displayName: string;
  status: "ok" | "error";
  errorMessage?: string;
  text: string;
  citations: CitationInOutput[];
  generatedAt: string;
}

export interface AIComparison {
  providers: ProviderOpinion[];
  contractExcerpt: string;
}

export interface OverallReport {
  id: string;
  title: string;
  createdAt: string;
  source: "seed" | "user-paste";
  rawText: string;
  extracted: ExtractedContract;
  categories: CategoryScore[];
  overallScore: number;
  overallBand: ScoreBand;
  summary: string;
  questionsForLawyer: string[];
  aiComparison?: AIComparison;
}

export interface SeedContract {
  id: string;
  title: string;
  role: string;
  rawText: string;
  precomputed: OverallReport;
}
