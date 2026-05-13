import type { Rule } from "@/lib/types";
import { CANLII_URLS } from "@/lib/constants";

export const RULES: Rule[] = [
  {
    id: "comp-001",
    category: "compliance",
    name: "Governing law not Alberta",
    severity: "Medium",
    points: 15,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 4",
    canliiUrl: CANLII_URLS["comp-001"],
    fires: (e) => !!e.compliance.governingLaw && !/alberta/i.test(e.compliance.governingLaw),
    explanation: () =>
      "The governing law clause names a non-Alberta jurisdiction. ESC minimums apply regardless of the chosen law for work performed in Alberta, but the inconsistency creates litigation risk and confusion at termination.",
  },
  {
    id: "comp-002",
    category: "compliance",
    name: "US legal terminology present",
    severity: "High",
    points: 20,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, ss. 55–57",
    canliiUrl: CANLII_URLS["comp-002"],
    fires: (e) => e.compliance.atWillLanguage === true,
    explanation: () =>
      "The contract imports US 'at-will' terminology that has no legal effect in Alberta. Such drafting suggests the template was not adapted for Canadian law and likely contains other latent compliance gaps.",
  },
  {
    id: "comp-003",
    category: "compliance",
    name: "No reference to ESC or Alberta statutes",
    severity: "Medium",
    points: 10,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9 (general)",
    canliiUrl: CANLII_URLS["comp-003"],
    fires: (e) => e.compliance.statutoryReferences.length === 0,
    explanation: () =>
      "The contract does not reference the Alberta Employment Standards Code anywhere. This is not fatal, but the absence of any saving / floor language compounds the risk of a void termination clause under Machtinger.",
  },
];
