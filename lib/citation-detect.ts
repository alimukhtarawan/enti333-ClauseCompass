import { VERIFIED_CITATION_TOKENS, CITATION_REGEXES } from "@/lib/constants";
import type { CitationInOutput } from "@/lib/types";

export function extractCitations(text: string): CitationInOutput[] {
  const found = new Set<string>();
  for (const re of CITATION_REGEXES) {
    const m = text.match(re);
    if (m) for (const t of m) found.add(t.trim());
  }
  return Array.from(found).map((token) => {
    const lower = token.toLowerCase();
    const verified = VERIFIED_CITATION_TOKENS.some((v) => lower.includes(v));
    return {
      text: token,
      status: verified ? "verified" : "unverified-possible-hallucination",
    };
  });
}
