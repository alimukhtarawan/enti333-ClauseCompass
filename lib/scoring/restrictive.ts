import type { Rule } from "@/lib/types";
import { CANLII_URLS } from "@/lib/constants";

export const RULES: Rule[] = [
  {
    id: "rest-001",
    category: "restrictive",
    name: "Non-compete present",
    severity: "High",
    points: 25,
    jurisdiction: "SCC",
    citation: "Shafron v KRG Insurance Brokers (Western) Inc, 2009 SCC 6",
    canliiUrl: CANLII_URLS["rest-001"],
    fires: (e) => e.restrictive.nonCompete.present === true,
    explanation: () =>
      "Non-compete clauses are presumptively unenforceable in Canadian common law. Unless the employer can prove a reasonable proprietary interest and that a non-solicit would not suffice, this clause is unlikely to survive challenge.",
  },
  {
    id: "rest-002",
    category: "restrictive",
    name: "Non-compete duration exceeds 12 months",
    severity: "Critical",
    points: 15,
    jurisdiction: "SCC",
    citation: "Elsley v JG Collins Insurance Agencies Ltd, [1978] 2 SCR 916",
    canliiUrl: CANLII_URLS["rest-002"],
    fires: (e) =>
      e.restrictive.nonCompete.durationMonths !== null &&
      e.restrictive.nonCompete.durationMonths > 12,
    explanation: () =>
      "Non-compete durations beyond 12 months are very rarely upheld. Under Elsley the restraint must be no broader than necessary; courts will not 'blue-pencil' an unreasonable term.",
  },
  {
    id: "rest-003",
    category: "restrictive",
    name: "Non-solicit duration exceeds 24 months",
    severity: "Medium",
    points: 10,
    jurisdiction: "SCC",
    citation: "Elsley v JG Collins Insurance Agencies Ltd, [1978] 2 SCR 916",
    canliiUrl: CANLII_URLS["rest-003"],
    fires: (e) =>
      e.restrictive.nonSolicit.durationMonths !== null &&
      e.restrictive.nonSolicit.durationMonths > 24,
    explanation: () =>
      "Non-solicit beyond 24 months is at the outer edge of enforceability. Even with a legitimate proprietary interest, courts may find the duration unreasonable.",
  },
  {
    id: "rest-004",
    category: "restrictive",
    name: "Unbounded geographic scope",
    severity: "High",
    points: 15,
    jurisdiction: "SCC",
    citation: "Shafron v KRG Insurance Brokers (Western) Inc, 2009 SCC 6",
    canliiUrl: CANLII_URLS["rest-004"],
    fires: (e) => /world|worldwide|globally/i.test(e.restrictive.nonCompete.geography || ""),
    explanation: () =>
      "Worldwide / unbounded geographic scope makes the restraint per se unreasonable under Shafron. Geography must be tied to the actual area of the employer's proprietary interest.",
  },
];
