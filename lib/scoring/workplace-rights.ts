import type { Rule } from "@/lib/types";
import { CANLII_URLS } from "@/lib/constants";

export const RULES: Rule[] = [
  {
    id: "wr-001",
    category: "workplaceRights",
    name: "Unilateral surveillance language",
    severity: "Medium",
    points: 15,
    jurisdiction: "AB-statute",
    citation: "Personal Information Protection Act (Alberta), SA 2003, c P-6.5, s. 15",
    canliiUrl: CANLII_URLS["wr-001"],
    fires: (e) =>
      !!e.workplaceRights.surveillanceClause &&
      /any time|without notice/i.test(e.workplaceRights.surveillanceClause),
    explanation: () =>
      "The surveillance clause permits monitoring 'at any time' or 'without notice'. Alberta PIPA s. 15 requires reasonable notice and a defined purpose for collecting employee personal information.",
  },
  {
    id: "wr-002",
    category: "workplaceRights",
    name: "Overbroad IP assignment",
    severity: "Medium",
    points: 10,
    jurisdiction: "AB-caselaw",
    citation: "Alberta common law (general — flag for lawyer)",
    fires: (e) =>
      !!e.workplaceRights.ipAssignment &&
      /all inventions|any creation/i.test(e.workplaceRights.ipAssignment),
    explanation: () =>
      "The IP assignment captures 'all inventions' or 'any creation' without carving out pre-existing IP, off-hours work, or unrelated personal projects. Such overbreadth is commonly read down or struck.",
  },
];
