import type { Rule } from "@/lib/types";
import { CANLII_URLS } from "@/lib/constants";

export const RULES: Rule[] = [
  {
    id: "pay-001",
    category: "compensation",
    name: "Overtime paid at straight time",
    severity: "Critical",
    points: 30,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 21 (≥1.5x required)",
    canliiUrl: CANLII_URLS["pay-001"],
    fires: (e) => e.compensation.overtimeTreatment === "straight-time",
    explanation: () =>
      "Paying overtime at straight time violates ESC s. 21, which requires at least 1.5x the regular wage rate for overtime hours. This is a common source of ESC complaints and back-pay orders across an entire workforce.",
  },
  {
    id: "pay-002",
    category: "compensation",
    name: "Overtime treatment unstated",
    severity: "Medium",
    points: 10,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 21",
    canliiUrl: CANLII_URLS["pay-002"],
    fires: (e) => e.compensation.overtimeTreatment === "unstated",
    explanation: () =>
      "The contract is silent on overtime. ESC minimums apply by default, but ambiguous drafting commonly leads to underpayment in practice and complaints to Employment Standards.",
  },
  {
    id: "pay-003",
    category: "compensation",
    name: "Vacation pay missing",
    severity: "High",
    points: 20,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 35 (4% minimum)",
    canliiUrl: CANLII_URLS["pay-003"],
    fires: (e) => e.compensation.vacationPay === null,
    explanation: () =>
      "No vacation pay clause is present. ESC s. 35 requires a minimum of 4% vacation pay. Silent contracts create payroll disputes and may trigger back-pay assessments.",
  },
];
