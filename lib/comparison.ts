import { GoogleGenerativeAI } from "@google/generative-ai";
import { RAW_OPINION_PROMPT, RAW_OPINION_SYSTEM } from "@/lib/prompts/raw-opinion-v1";
import { extractCitations } from "@/lib/citation-detect";
import { rawChatGPTOpinion } from "@/lib/openai";
import { scoreContract, getRuleById } from "@/lib/scoring";
import type {
  ProviderOpinion,
  AIComparison,
  OverallReport,
  ExtractedContract,
} from "@/lib/types";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
const gem = new GoogleGenerativeAI(apiKey);

export async function rawGeminiOpinion(contractText: string): Promise<ProviderOpinion> {
  try {
    const model = gem.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: RAW_OPINION_SYSTEM,
      generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
    });
    const r = await model.generateContent(
      `${RAW_OPINION_PROMPT}\n\nCONTRACT:\n<<<\n${contractText.slice(0, 8000)}\n>>>`
    );
    const text = r.response.text().trim();
    return {
      provider: "geminiRaw",
      displayName: "Gemini 2.5 Flash (raw)",
      status: "ok",
      text,
      citations: extractCitations(text),
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      provider: "geminiRaw",
      displayName: "Gemini 2.5 Flash (raw)",
      status: "error",
      errorMessage: String(err).slice(0, 200),
      text: "",
      citations: [],
      generatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Build the HireGuard provider column from the trusted, server-derived report.
 * Citations come exclusively from the rule registry (lib/scoring/*) — never
 * from a client-supplied report — so they are always genuinely verified.
 */
export function buildHireguardOpinion(report: OverallReport): ProviderOpinion {
  const topHit = report.categories
    .flatMap((c) => c.hits)
    .sort((a, b) => b.points - a.points)[0];

  if (!topHit) {
    return {
      provider: "hireguard",
      displayName: "HireGuard (structured)",
      status: "ok",
      text: "No rules fired on this contract at the current scoring level.",
      citations: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const trustedRule = getRuleById(topHit.ruleId);
  if (!trustedRule) {
    return {
      provider: "hireguard",
      displayName: "HireGuard (structured)",
      status: "ok",
      text: `Most pressing: "${topHit.name}" (${topHit.severity}).`,
      citations: [],
      generatedAt: new Date().toISOString(),
    };
  }

  const text = `Most pressing: "${trustedRule.name}" (${trustedRule.severity}). ${topHit.explanation} Citation: ${trustedRule.citation}.`;
  return {
    provider: "hireguard",
    displayName: "HireGuard (structured)",
    status: "ok",
    text,
    citations: [
      {
        text: trustedRule.citation,
        matchedRuleId: trustedRule.id,
        status: "verified",
      },
    ],
    generatedAt: new Date().toISOString(),
  };
}

export async function getLiveComparison(
  contractText: string,
  trustedExtracted: ExtractedContract
): Promise<AIComparison> {
  // Re-derive scoring server-side from the trusted Extracted payload so the
  // HireGuard column's "verified" citations cannot be forged by a client.
  const { categories, overallScore, overallBand } = scoreContract(trustedExtracted);
  const trustedReport: OverallReport = {
    id: "transient",
    title: "transient",
    createdAt: new Date().toISOString(),
    source: "user-paste",
    rawText: contractText.slice(0, 8000),
    extracted: trustedExtracted,
    categories,
    overallScore,
    overallBand,
    summary: "",
    questionsForLawyer: [],
  };

  const [chatgpt, geminiRaw] = await Promise.all([
    rawChatGPTOpinion(contractText),
    rawGeminiOpinion(contractText),
  ]);
  return {
    providers: [chatgpt, geminiRaw, buildHireguardOpinion(trustedReport)],
    contractExcerpt: contractText.slice(0, 500),
  };
}
