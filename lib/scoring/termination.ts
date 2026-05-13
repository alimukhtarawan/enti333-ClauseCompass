import type { Rule } from "@/lib/types";
import { CANLII_URLS } from "@/lib/constants";

export const RULES: Rule[] = [
  {
    id: "term-001",
    category: "termination",
    name: "Missing ESC saving language",
    severity: "High",
    points: 25,
    jurisdiction: "SCC",
    citation:
      "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 56; Machtinger v HOJ Industries Ltd, [1992] 1 SCR 986",
    canliiUrl: CANLII_URLS["term-001"],
    fires: (e) => e.termination.savingLanguage === false,
    explanation: () =>
      "The termination clause lacks 'saving language' guaranteeing at least ESC minimums. Under Machtinger, a clause that could pay below the ESC minimum in any scenario may be void in its entirety, defaulting the employee to common-law reasonable notice.",
  },
  {
    id: "term-002",
    category: "termination",
    name: "At-will termination clause",
    severity: "Critical",
    points: 35,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, ss. 55–57",
    canliiUrl: CANLII_URLS["term-002"],
    fires: (e) => e.compliance.atWillLanguage === true,
    explanation: () =>
      "The contract uses US-style 'at-will' language. Alberta employers cannot terminate without statutory notice (or pay in lieu) once an employee passes the 90-day threshold. At-will language is unenforceable and exposes the employer to wrongful-dismissal damages.",
  },
  {
    id: "term-003",
    category: "termination",
    name: "Overbroad just-cause definition",
    severity: "High",
    points: 20,
    jurisdiction: "SCC",
    citation: "McKinley v BC Tel, 2001 SCC 38",
    canliiUrl: CANLII_URLS["term-003"],
    fires: (e) =>
      /any breach|any violation|sole discretion/i.test(e.termination.justCauseDefinition || ""),
    explanation: () =>
      "Just-cause is defined so broadly (e.g., 'any breach' or 'sole discretion') that it likely fails the McKinley contextual proportionality test. Courts typically read down or strike such definitions, leaving the employer exposed.",
  },
  {
    id: "term-004",
    category: "termination",
    name: "Notice period below ESC floor",
    severity: "High",
    points: 20,
    jurisdiction: "AB-statute",
    citation: "Employment Standards Code (Alberta), RSA 2000, c E-9, s. 56",
    canliiUrl: CANLII_URLS["term-004"],
    fires: (e) =>
      /regardless|fixed|no matter|always/i.test(e.termination.noticePeriod || ""),
    explanation: () =>
      "The notice formula is fixed and ignores tenure-based ESC minimums (1 week at 90 days, scaling to 8 weeks at 10+ years). A clause that could pay less than the statutory floor for a long-tenured employee is at risk of being struck.",
  },
];
