import type { Rule } from "@/lib/types";
import { CANLII_URLS } from "@/lib/constants";

export const RULES: Rule[] = [
  {
    id: "flex-001",
    category: "flexibility",
    name: "Unilateral material change clause",
    severity: "High",
    points: 25,
    jurisdiction: "persuasive-non-AB",
    citation: "Wronko v Western Inventory Service Ltd, 2008 ONCA 327",
    jurisdictionNote: "Persuasive authority — Ontario Court of Appeal, not binding in Alberta.",
    canliiUrl: CANLII_URLS["flex-001"],
    fires: (e) => e.flexibility.unilateralChangeClause === true,
    explanation: () =>
      "The contract reserves the employer's right to make unilateral material changes. Per Wronko, an employee who refuses such a change is constructively dismissed and entitled to common-law notice — exactly the opposite of the clause's intended effect.",
  },
  {
    id: "flex-002",
    category: "flexibility",
    name: "Layoff without pay",
    severity: "High",
    points: 20,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, ss. 62–64",
    canliiUrl: CANLII_URLS["flex-002"],
    fires: (e) => e.flexibility.layoffWithoutPay === true,
    explanation: () =>
      "The contract permits unpaid temporary layoff. Under ESC ss. 62–64 a layoff is permitted only in defined circumstances and for limited durations; outside those bounds it is treated as a termination triggering notice / pay obligations.",
  },
  {
    id: "flex-003",
    category: "flexibility",
    name: "Probation period exceeds 3 months",
    severity: "Low",
    points: 10,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 55(2)(a)",
    canliiUrl: CANLII_URLS["flex-003"],
    fires: (e) =>
      e.flexibility.probationPeriodMonths !== null && e.flexibility.probationPeriodMonths > 3,
    explanation: () =>
      "ESC notice obligations apply after 90 days regardless of any contractual probation period. A probation longer than 3 months is misleading and may give rise to unexpected notice entitlements.",
  },
];
