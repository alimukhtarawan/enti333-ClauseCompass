import type {
  SeedContract,
  ExtractedContract,
  OverallReport,
  AIComparison,
} from "@/lib/types";
import { scoreContract } from "@/lib/scoring";
import { templateSummary } from "@/lib/summary";

function emptyExtracted(): ExtractedContract {
  return {
    scopeFlag: "in_scope",
    termination: {
      noticePeriod: null,
      severancePay: null,
      savingLanguage: null,
      justCauseDefinition: null,
      excerpt: null,
    },
    restrictive: {
      nonCompete: { present: false, durationMonths: null, geography: null },
      nonSolicit: { present: false, durationMonths: null },
      excerpt: null,
    },
    compliance: {
      governingLaw: null,
      atWillLanguage: null,
      statutoryReferences: [],
      excerpt: null,
    },
    compensation: {
      baseSalary: null,
      overtimeTreatment: null,
      vacationPay: null,
      bonusTerms: null,
      excerpt: null,
    },
    workplaceRights: {
      privacyClause: null,
      surveillanceClause: null,
      ipAssignment: null,
      excerpt: null,
    },
    flexibility: {
      unilateralChangeClause: null,
      layoffWithoutPay: null,
      probationPeriodMonths: null,
      excerpt: null,
    },
  };
}

function buildPrecomputed(
  id: string,
  title: string,
  rawText: string,
  extracted: ExtractedContract,
  aiComparison: AIComparison
): OverallReport {
  const { categories, overallScore, overallBand } = scoreContract(extracted);
  const { summary, questionsForLawyer } = templateSummary(extracted, categories);
  return {
    id,
    title,
    createdAt: "2026-05-13T00:00:00.000Z",
    source: "seed",
    rawText,
    extracted,
    categories,
    overallScore,
    overallBand,
    summary,
    questionsForLawyer,
    aiComparison,
  };
}

function fakeComparison(
  rawTextExcerpt: string,
  chatgptText: string,
  geminiText: string,
  hireguardText: string,
  hireguardCitation: string,
  hireguardRuleId: string
): AIComparison {
  return {
    contractExcerpt: rawTextExcerpt,
    providers: [
      {
        provider: "chatgpt",
        displayName: "ChatGPT-4o-mini",
        status: "ok",
        text: chatgptText,
        citations: [],
        generatedAt: "2026-05-13T00:00:00.000Z",
      },
      {
        provider: "geminiRaw",
        displayName: "Gemini 2.5 Flash (raw)",
        status: "ok",
        text: geminiText,
        citations: [],
        generatedAt: "2026-05-13T00:00:00.000Z",
      },
      {
        provider: "hireguard",
        displayName: "HireGuard (structured)",
        status: "ok",
        text: hireguardText,
        citations: [
          { text: hireguardCitation, matchedRuleId: hireguardRuleId, status: "verified" },
        ],
        generatedAt: "2026-05-13T00:00:00.000Z",
      },
    ],
  };
}

// --- SEED 01: Account Manager Offer Letter (Critical — maximally broken template) ---
const seed01Raw = `OFFER OF EMPLOYMENT — ACCOUNT MANAGER

Northbridge Professional Services Inc. ("the Company") offers you, Jordan Lee, the position of Account Manager commencing June 1, 2026, reporting to the Director of Client Services in Calgary.

1. Compensation. Base salary of CAD $72,000 per annum, paid bi-weekly. Overtime hours, if any, will be paid at the regular hourly rate (straight time). No vacation pay is provided.

2. Probation. The first six (6) months of employment shall be a probationary period during which the Company may terminate the relationship at any time without notice or pay.

3. At-Will Employment. Your employment with the Company is at-will. Either party may terminate the employment at any time, with or without cause, and with or without notice. The Company may terminate your employment for any breach of this letter or any policy in its sole discretion.

4. Notice. If notice is given, two (2) weeks' notice (or pay in lieu) shall apply regardless of length of service.

5. Non-Compete. For twenty-four (24) months after termination, you shall not, anywhere in the world, engage in any business that competes with the Company.

6. Layoff. The Company reserves the right to lay you off temporarily without pay at its discretion.

7. Material Change. The Company may change your role, reporting line, location, and compensation at any time without your consent, and you agree no such change will constitute constructive dismissal.

8. Surveillance. The Company may monitor your communications and devices at any time, without notice, for any reason.

9. Intellectual Property. You assign to the Company all inventions, discoveries, and any creation of any kind made during the period of your employment, whether or not related to Company business.

10. Governing Law. This agreement is governed by the laws of the State of Delaware.

___________________________   ___________________________
Jordan Lee                    For Northbridge Professional Services Inc.`;

const seed01Extracted: ExtractedContract = {
  scopeFlag: "in_scope",
  termination: {
    noticePeriod: "two (2) weeks regardless of length of service",
    severancePay: null,
    savingLanguage: false,
    justCauseDefinition:
      "for any breach of this letter or any policy in its sole discretion",
    excerpt: {
      text: "Either party may terminate the employment at any time, with or without cause, and with or without notice. Two weeks' notice or pay in lieu shall apply regardless of length of service.",
      confidence: 0.97,
    },
  },
  restrictive: {
    nonCompete: { present: true, durationMonths: 24, geography: "anywhere in the world" },
    nonSolicit: { present: false, durationMonths: null },
    excerpt: {
      text: "For twenty-four (24) months after termination, you shall not, anywhere in the world, engage in any business that competes with the Company.",
      confidence: 0.97,
    },
  },
  compliance: {
    governingLaw: "State of Delaware",
    atWillLanguage: true,
    statutoryReferences: [],
    excerpt: {
      text: "Your employment with the Company is at-will. This agreement is governed by the laws of the State of Delaware.",
      confidence: 0.98,
    },
  },
  compensation: {
    baseSalary: "CAD $72,000 per annum",
    overtimeTreatment: "straight-time",
    vacationPay: null,
    bonusTerms: null,
    excerpt: {
      text: "Overtime hours, if any, will be paid at the regular hourly rate (straight time). No vacation pay is provided.",
      confidence: 0.96,
    },
  },
  workplaceRights: {
    privacyClause: null,
    surveillanceClause:
      "The Company may monitor your communications and devices at any time, without notice, for any reason.",
    ipAssignment:
      "all inventions, discoveries, and any creation of any kind made during the period of your employment",
    excerpt: {
      text: "The Company may monitor your communications and devices at any time, without notice. You assign to the Company all inventions and any creation made during employment.",
      confidence: 0.96,
    },
  },
  flexibility: {
    unilateralChangeClause: true,
    layoffWithoutPay: true,
    probationPeriodMonths: 6,
    excerpt: {
      text: "The first six (6) months of employment shall be a probationary period. The Company may lay you off temporarily without pay. The Company may change your role, reporting line, location, and compensation at any time.",
      confidence: 0.96,
    },
  },
};

// --- SEED 02: Software Developer Employment Agreement (Critical) ---
const seed02Raw = `EMPLOYMENT AGREEMENT — SOFTWARE DEVELOPER

This Employment Agreement is entered into between Apex Code Labs Inc. (the "Employer") and Sam Patel (the "Employee").

1. Position. Employee is hired as a Software Developer.

2. At-Will Employment. Employee acknowledges that this is an at-will employment relationship. Either party may terminate the employment at any time, with or without cause, and with or without notice.

3. Compensation. Base salary of CAD $95,000 per annum.

4. Vacation. Three weeks of paid vacation per year.

5. Non-Competition. During employment and for twenty-four (24) months following termination of employment for any reason, Employee shall not, anywhere in the world, directly or indirectly engage in any business that competes with the Employer.

6. Non-Solicitation. For twelve (12) months following termination, Employee shall not solicit any client or employee of the Employer.

7. Intellectual Property. Employee assigns to the Employer all inventions, discoveries, and works conceived during employment.

8. Governing Law. This Agreement shall be governed by the laws of the State of Delaware.

Signed, Sam Patel and Apex Code Labs Inc.`;

const seed02Extracted: ExtractedContract = {
  ...emptyExtracted(),
  termination: {
    noticePeriod: "with or without notice (at-will)",
    severancePay: null,
    savingLanguage: false,
    justCauseDefinition: "with or without cause (sole discretion)",
    excerpt: {
      text: "Either party may terminate the employment at any time, with or without cause, and with or without notice.",
      confidence: 0.99,
    },
  },
  restrictive: {
    nonCompete: { present: true, durationMonths: 24, geography: "anywhere in the world" },
    nonSolicit: { present: true, durationMonths: 12 },
    excerpt: {
      text: "Employee shall not, anywhere in the world, directly or indirectly engage in any business that competes with the Employer for twenty-four (24) months.",
      confidence: 0.98,
    },
  },
  compliance: {
    governingLaw: "State of Delaware",
    atWillLanguage: true,
    statutoryReferences: [],
    excerpt: { text: "This Agreement shall be governed by the laws of the State of Delaware.", confidence: 0.99 },
  },
  compensation: {
    baseSalary: "CAD $95,000 per annum",
    overtimeTreatment: "unstated",
    vacationPay: "Three weeks paid vacation per year",
    bonusTerms: null,
    excerpt: { text: "Three weeks of paid vacation per year.", confidence: 0.9 },
  },
  workplaceRights: {
    privacyClause: null,
    surveillanceClause: null,
    ipAssignment: "all inventions, discoveries, and works conceived during employment",
    excerpt: {
      text: "Employee assigns to the Employer all inventions, discoveries, and works conceived during employment.",
      confidence: 0.95,
    },
  },
};

// --- SEED 03: Restaurant Server Contract (High) ---
const seed03Raw = `PART-TIME SERVER AGREEMENT

The Riverbend Bistro Ltd. ("Employer") engages Casey Brown ("Employee") as a part-time Server commencing immediately.

1. Hours. Employee will be scheduled for variable shifts as required by the business, including evenings and weekends.

2. Wages. Hourly wage of $17.50 per hour. Overtime hours will be paid at straight time.

3. Vacation. Vacation will be addressed when scheduling permits.

4. Termination. Either party may end this engagement on two (2) weeks' notice.

5. Tips. Tips are pooled and distributed weekly.

6. Conduct. Employee will adhere to all Bistro policies.

This agreement is governed by Alberta law.`;

const seed03Extracted: ExtractedContract = {
  ...emptyExtracted(),
  termination: {
    noticePeriod: "two (2) weeks",
    severancePay: null,
    savingLanguage: null,
    justCauseDefinition: null,
    excerpt: { text: "Either party may end this engagement on two (2) weeks' notice.", confidence: 0.95 },
  },
  compliance: {
    governingLaw: "Alberta",
    atWillLanguage: false,
    statutoryReferences: [],
    excerpt: { text: "This agreement is governed by Alberta law.", confidence: 0.99 },
  },
  compensation: {
    baseSalary: "$17.50 per hour",
    overtimeTreatment: "straight-time",
    vacationPay: null,
    bonusTerms: null,
    excerpt: { text: "Overtime hours will be paid at straight time.", confidence: 0.97 },
  },
};

// --- SEED 04: Executive Employment Agreement (High) ---
const seed04Raw = `EXECUTIVE EMPLOYMENT AGREEMENT — VICE PRESIDENT, OPERATIONS

Summit Industries Ltd. ("Company") and Morgan Reyes ("Executive") agree:

1. Role. Executive is appointed Vice President, Operations.

2. Compensation. Base salary of CAD $235,000 plus annual bonus per Board discretion. Six (6) weeks of paid vacation per year (in excess of statutory minimum).

3. Just Cause. The Company may terminate Executive for cause without notice or pay. Cause includes any breach of this agreement or any violation of Company policy as determined by the Board in its sole discretion.

4. Without Cause Termination. The Company may terminate Executive without cause on twelve (12) months' notice or pay in lieu.

5. Material Change. The Company reserves the right to make material changes to Executive's role, reporting line, location, and compensation at any time, and Executive agrees that no such change shall constitute constructive dismissal.

6. Intellectual Property. Executive assigns to Company any creation, invention, or work product produced during the employment relationship.

7. Governing Law. This agreement is governed by the laws of Alberta.`;

const seed04Extracted: ExtractedContract = {
  ...emptyExtracted(),
  termination: {
    noticePeriod: "twelve (12) months",
    severancePay: "12 months' pay in lieu",
    savingLanguage: true,
    justCauseDefinition:
      "any breach of this agreement or any violation of Company policy as determined by the Board in its sole discretion",
    excerpt: {
      text: "Cause includes any breach of this agreement or any violation of Company policy as determined by the Board in its sole discretion.",
      confidence: 0.97,
    },
  },
  compliance: {
    governingLaw: "Alberta",
    atWillLanguage: false,
    statutoryReferences: [],
    excerpt: { text: "This agreement is governed by the laws of Alberta.", confidence: 0.99 },
  },
  compensation: {
    baseSalary: "CAD $235,000",
    overtimeTreatment: "unstated",
    vacationPay: "Six (6) weeks of paid vacation per year",
    bonusTerms: "annual bonus per Board discretion",
    excerpt: { text: "Six (6) weeks of paid vacation per year (in excess of statutory minimum).", confidence: 0.97 },
  },
  workplaceRights: {
    privacyClause: null,
    surveillanceClause: null,
    ipAssignment:
      "any creation, invention, or work product produced during the employment relationship",
    excerpt: {
      text: "Executive assigns to Company any creation, invention, or work product produced during the employment relationship.",
      confidence: 0.95,
    },
  },
  flexibility: {
    unilateralChangeClause: true,
    layoffWithoutPay: null,
    probationPeriodMonths: null,
    excerpt: {
      text: "The Company reserves the right to make material changes to Executive's role, reporting line, location, and compensation at any time.",
      confidence: 0.97,
    },
  },
};

// --- SEED 05: Clean Reference Contract (Low) ---
const seed05Raw = `EMPLOYMENT AGREEMENT — SENIOR ANALYST

Foothill Advisory Inc. ("Employer") and Riley Singh ("Employee") agree as follows:

1. Position. Employee is hired as a Senior Analyst commencing July 15, 2026, reporting to the Director of Research in the Calgary office.

2. Compensation. Base salary of CAD $88,000 per annum, paid bi-weekly. Overtime, where applicable, will be paid at 1.5 times the regular hourly rate in accordance with the Alberta Employment Standards Code.

3. Vacation. Four weeks of paid vacation per year, with vacation pay of not less than 6% of wages, in accordance with the Alberta Employment Standards Code.

4. Probation. The first three (3) months of employment will be a probationary period.

5. Termination. The Employer may terminate this employment on the greater of (a) the notice or pay in lieu prescribed by the Alberta Employment Standards Code, or (b) the notice specified in the Termination Schedule. In no case shall the Employee receive less than the minimums prescribed by the Alberta Employment Standards Code, including any continuation of statutory benefits.

6. Confidentiality. Employee will keep confidential information of the Employer confidential during and after employment. No non-competition covenant applies.

7. Privacy. Any monitoring of workplace systems will be conducted in accordance with Alberta's Personal Information Protection Act and on reasonable prior notice.

8. Governing Law. This agreement is governed by the laws of Alberta.`;

const seed05Extracted: ExtractedContract = {
  ...emptyExtracted(),
  termination: {
    noticePeriod:
      "the greater of (a) ESC notice or (b) the notice specified in the Termination Schedule",
    severancePay: "as required by ESC",
    savingLanguage: true,
    justCauseDefinition: null,
    excerpt: {
      text: "In no case shall the Employee receive less than the minimums prescribed by the Alberta Employment Standards Code.",
      confidence: 0.99,
    },
  },
  restrictive: {
    nonCompete: { present: false, durationMonths: null, geography: null },
    nonSolicit: { present: false, durationMonths: null },
    excerpt: { text: "No non-competition covenant applies.", confidence: 0.95 },
  },
  compliance: {
    governingLaw: "Alberta",
    atWillLanguage: false,
    statutoryReferences: ["Alberta Employment Standards Code", "Personal Information Protection Act"],
    excerpt: {
      text: "This agreement is governed by the laws of Alberta.",
      confidence: 0.99,
    },
  },
  compensation: {
    baseSalary: "CAD $88,000 per annum",
    overtimeTreatment: "1.5x",
    vacationPay: "6% of wages",
    bonusTerms: null,
    excerpt: {
      text: "Overtime, where applicable, will be paid at 1.5 times the regular hourly rate.",
      confidence: 0.97,
    },
  },
  workplaceRights: {
    privacyClause: "Alberta PIPA-compliant monitoring on reasonable prior notice",
    surveillanceClause: "Any monitoring of workplace systems will be conducted in accordance with PIPA on reasonable prior notice.",
    ipAssignment: null,
    excerpt: {
      text: "Any monitoring of workplace systems will be conducted in accordance with Alberta's Personal Information Protection Act.",
      confidence: 0.97,
    },
  },
  flexibility: {
    unilateralChangeClause: false,
    layoffWithoutPay: false,
    probationPeriodMonths: 3,
    excerpt: {
      text: "The first three (3) months of employment will be a probationary period.",
      confidence: 0.95,
    },
  },
};

const seed01Cmp = fakeComparison(
  seed01Raw.slice(0, 500),
  "The two-week notice clause is concerning because Alberta employment law typically follows the 'reasonable notice' standard. Under Bardal factors and given an Account Manager's role, two weeks may be inadequate after even a few years of service. Employers should also confirm compliance with the Alberta Employment Standards Code minimums under section 56.",
  "The most concerning issue is the fixed two-week notice regardless of tenure. Under the Alberta Employment Standards Code (section 56) and the leading case Wallace v United Grain Growers, an employee with significant tenure is entitled to substantially more than two weeks. The clause may also fail the Machtinger test if it could pay below ESC minimums in any scenario, voiding the clause entirely.",
  "Most pressing: 'Missing ESC saving language' (High). The termination clause lacks 'saving language' guaranteeing at least ESC minimums. Under Machtinger, a clause that could pay below the ESC minimum in any scenario may be void in its entirety, defaulting the employee to common-law reasonable notice. Citation: Employment Standards Code (Alberta), RSA 2000, c E-9, s. 56; Machtinger v HOJ Industries Ltd, [1992] 1 SCR 986.",
  "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 56; Machtinger v HOJ Industries Ltd, [1992] 1 SCR 986",
  "term-001"
);

const seed02Cmp = fakeComparison(
  seed02Raw.slice(0, 500),
  "The non-compete is overly broad — twenty-four months and worldwide is unlikely to be enforced. Courts in Alberta and elsewhere in Canada apply a reasonableness test (see Elsley v JG Collins, [1978] 2 SCR 916) and will rarely uphold worldwide restraints. The at-will language is also problematic in a Canadian context.",
  "The contract uses US 'at-will' employment language and is governed by Delaware law, which is fundamentally inconsistent with Alberta law. Under the Alberta Employment Standards Code (RSA 2000, c E-9, sections 55–57) and Machtinger v HOJ, employers cannot terminate without statutory notice. The 24-month worldwide non-compete is also unenforceable per Shafron v KRG, 2009 SCC 6, which held that overbroad restraints cannot be saved by 'blue pencilling'.",
  "Most pressing: 'At-will termination clause' (Critical). The contract uses US-style 'at-will' language. Alberta employers cannot terminate without statutory notice (or pay in lieu) once an employee passes the 90-day threshold. At-will language is unenforceable and exposes the employer to wrongful-dismissal damages. Citation: Employment Standards Code (Alberta), RSA 2000, c E-9, ss. 55–57.",
  "Employment Standards Code (Alberta), RSA 2000, c E-9, ss. 55–57",
  "term-002"
);

const seed03Cmp = fakeComparison(
  seed03Raw.slice(0, 500),
  "Paying overtime at straight time is a problem. Most jurisdictions require an overtime premium of 1.5x. The Riverbend Bistro should review its payroll practices to make sure they comply with Canadian Labour Standards Act overtime provisions to avoid back-pay claims.",
  "Paying overtime at straight time directly violates the Alberta Employment Standards Code, section 21, which requires overtime to be paid at not less than 1.5 times the regular wage. Continuing this practice exposes the employer to ESC complaints and back-pay assessments across the entire hourly workforce. The contract is also silent on vacation pay, which under ESC s. 35 must be at least 4% of wages.",
  "Most pressing: 'Overtime paid at straight time' (Critical). Paying overtime at straight time violates ESC s. 21, which requires at least 1.5x the regular wage rate for overtime hours. This is a common source of ESC complaints and back-pay orders across an entire workforce. Citation: Employment Standards Code (Alberta), RSA 2000, c E-9, s. 21 (≥1.5x required).",
  "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 21 (≥1.5x required)",
  "pay-001"
);

const seed04Cmp = fakeComparison(
  seed04Raw.slice(0, 500),
  "The just-cause definition is too broad. Defining cause as 'any breach' or anything determined by the Board in 'sole discretion' likely fails the McKinley v BC Tel proportionality test (2001 SCC 38). The unilateral change clause is also a concern — courts have repeatedly held that such reservations do not defeat constructive dismissal claims.",
  "The 'sole discretion' just-cause definition is the central problem. Under McKinley v BC Tel, 2001 SCC 38, just cause requires a contextual proportionality analysis — an employer cannot expand cause by contract to include 'any breach.' Courts will read down or strike such language. The unilateral material-change clause is similarly problematic; per Wronko v Western Inventory Service, 2008 ONCA 327, an employee who refuses such a change may treat the contract as repudiated.",
  "Most pressing: 'Overbroad just-cause definition' (High). Just-cause is defined so broadly (e.g., 'any breach' or 'sole discretion') that it likely fails the McKinley contextual proportionality test. Courts typically read down or strike such definitions, leaving the employer exposed. Citation: McKinley v BC Tel, 2001 SCC 38.",
  "McKinley v BC Tel, 2001 SCC 38",
  "term-003"
);

const seed05Cmp = fakeComparison(
  seed05Raw.slice(0, 500),
  "This agreement looks well drafted. The termination clause references ESC minimums explicitly, overtime is at 1.5x, vacation pay is above the statutory floor, and there is no non-compete. The privacy clause acknowledges PIPA. From an HR perspective there is nothing urgent to flag.",
  "This is a comparatively clean Alberta employment agreement. Termination references the Alberta Employment Standards Code (RSA 2000, c E-9) minimums with saving language consistent with the Machtinger requirement. Overtime at 1.5x complies with ESC section 21. Vacation pay at 6% exceeds the section 35 minimum of 4%. The PIPA-aligned monitoring clause is appropriate. No restrictive covenant means no Shafron / Elsley exposure.",
  "No rules fired on this contract at the current scoring level.",
  "Employment Standards Code (Alberta), RSA 2000, c E-9 (clean reference)",
  "none"
);

export const SEED_CONTRACTS: SeedContract[] = [
  {
    id: "seed-01",
    title: "Account Manager Offer Letter",
    role: "FT salaried",
    rawText: seed01Raw,
    precomputed: buildPrecomputed(
      "seed-01",
      "Account Manager Offer Letter",
      seed01Raw,
      seed01Extracted,
      seed01Cmp
    ),
  },
  {
    id: "seed-02",
    title: "Software Developer Employment Agreement",
    role: "FT salaried",
    rawText: seed02Raw,
    precomputed: buildPrecomputed(
      "seed-02",
      "Software Developer Employment Agreement",
      seed02Raw,
      seed02Extracted,
      seed02Cmp
    ),
  },
  {
    id: "seed-03",
    title: "Restaurant Server Contract",
    role: "PT hourly",
    rawText: seed03Raw,
    precomputed: buildPrecomputed(
      "seed-03",
      "Restaurant Server Contract",
      seed03Raw,
      seed03Extracted,
      seed03Cmp
    ),
  },
  {
    id: "seed-04",
    title: "Executive Employment Agreement",
    role: "Executive",
    rawText: seed04Raw,
    precomputed: buildPrecomputed(
      "seed-04",
      "Executive Employment Agreement",
      seed04Raw,
      seed04Extracted,
      seed04Cmp
    ),
  },
  {
    id: "seed-05",
    title: "Clean Reference Contract",
    role: "FT salaried",
    rawText: seed05Raw,
    precomputed: buildPrecomputed(
      "seed-05",
      "Clean Reference Contract",
      seed05Raw,
      seed05Extracted,
      seed05Cmp
    ),
  },
];

export function findSeed(id: string): SeedContract | undefined {
  return SEED_CONTRACTS.find((s) => s.id === id);
}
