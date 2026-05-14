import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { ExtractedContract } from "@/lib/types";
import { EXTRACT_SYSTEM_PROMPT } from "@/lib/prompts/extract-v1";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY. See .env.example.");
const client = new GoogleGenerativeAI(apiKey);

export class LLMSchemaError extends Error {}

const excerptSchema = z
  .object({ text: z.string(), confidence: z.number() })
  .nullable();

// Helper: coerce null/undefined/missing categories to a sensible default object
// before strict shape checking. Gemini sometimes nulls an entire category when
// it's not present in the contract, even though we asked for null fields inside.
function nullable<T extends z.ZodTypeAny>(schema: T, fallback: z.infer<T>) {
  return z
    .union([schema, z.null(), z.undefined()])
    .transform((v) => (v == null ? fallback : v))
    .pipe(schema);
}

const terminationDefault = {
  noticePeriod: null,
  severancePay: null,
  savingLanguage: null,
  justCauseDefinition: null,
  excerpt: null,
};
const restrictiveDefault = {
  nonCompete: { present: false, durationMonths: null, geography: null },
  nonSolicit: { present: false, durationMonths: null },
  excerpt: null,
};
const complianceDefault = {
  governingLaw: null,
  atWillLanguage: null,
  statutoryReferences: [],
  excerpt: null,
};
const compensationDefault = {
  baseSalary: null,
  overtimeTreatment: null,
  vacationPay: null,
  bonusTerms: null,
  excerpt: null,
};
const workplaceRightsDefault = {
  privacyClause: null,
  surveillanceClause: null,
  ipAssignment: null,
  excerpt: null,
};
const flexibilityDefault = {
  unilateralChangeClause: null,
  layoffWithoutPay: null,
  probationPeriodMonths: null,
  excerpt: null,
};

const terminationSchema = z.object({
  noticePeriod: z.string().nullable(),
  severancePay: z.string().nullable(),
  savingLanguage: z.boolean().nullable(),
  justCauseDefinition: z.string().nullable(),
  excerpt: excerptSchema,
});
const restrictiveSchema = z.object({
  nonCompete: z
    .object({
      present: z.boolean(),
      durationMonths: z.number().nullable(),
      geography: z.string().nullable(),
    })
    .default(restrictiveDefault.nonCompete),
  nonSolicit: z
    .object({
      present: z.boolean(),
      durationMonths: z.number().nullable(),
    })
    .default(restrictiveDefault.nonSolicit),
  excerpt: excerptSchema,
});
const complianceSchema = z.object({
  governingLaw: z.string().nullable(),
  atWillLanguage: z.boolean().nullable(),
  statutoryReferences: z.array(z.string()).default([]),
  excerpt: excerptSchema,
});
const compensationSchema = z.object({
  baseSalary: z.string().nullable(),
  overtimeTreatment: z
    .enum(["1.5x", "straight-time", "unstated"])
    .nullable()
    .or(z.literal("").transform(() => null)),
  vacationPay: z.string().nullable(),
  bonusTerms: z.string().nullable(),
  excerpt: excerptSchema,
});
const workplaceRightsSchema = z.object({
  privacyClause: z.string().nullable(),
  surveillanceClause: z.string().nullable(),
  ipAssignment: z.string().nullable(),
  excerpt: excerptSchema,
});
const flexibilitySchema = z.object({
  unilateralChangeClause: z.boolean().nullable(),
  layoffWithoutPay: z.boolean().nullable(),
  probationPeriodMonths: z.number().nullable(),
  excerpt: excerptSchema,
});

const extractedContractSchema = z.object({
  scopeFlag: z.enum(["in_scope", "out_of_scope"]),
  scopeReason: z.string().nullable().optional().transform((v) => v ?? undefined),
  termination: nullable(terminationSchema, terminationDefault as any),
  restrictive: nullable(restrictiveSchema, restrictiveDefault as any),
  compliance: nullable(complianceSchema, complianceDefault as any),
  compensation: nullable(compensationSchema, compensationDefault as any),
  workplaceRights: nullable(workplaceRightsSchema, workplaceRightsDefault as any),
  flexibility: nullable(flexibilitySchema, flexibilityDefault as any),
});

function emptyExtracted(scopeReason: string): ExtractedContract {
  return {
    scopeFlag: "out_of_scope",
    scopeReason,
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

function stripFences(s: string): string {
  return s
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function tryParseJson(raw: string): unknown {
  // Try direct parse first; otherwise extract first {...} block.
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(raw.slice(start, end + 1));
    }
    throw new Error("No JSON object found in model response");
  }
}

export class LLMOverloadedError extends Error {}

// gemini-2.0-flash and gemini-2.0-flash-lite are both retired for new users.
// gemini-1.5-flash is the stable long-term-support fallback on the free tier.
const MODEL_CHAIN = ["gemini-2.5-flash", "gemini-1.5-flash"] as const;

function isOverload(err: unknown): boolean {
  const s = String(err);
  return /\b(503|429|UNAVAILABLE|overloaded|high demand|rate.?limit|quota)\b/i.test(s);
}

function isNotFound(err: unknown): boolean {
  const s = String(err);
  return /\b404\b|not found|not supported for generateContent/i.test(s);
}

function isTransient(err: unknown): boolean {
  const s = String(err);
  return (
    isOverload(err) ||
    /Empty model response|No JSON object|fetch failed|ECONNRESET|ETIMEDOUT|network/i.test(s)
  );
}

async function callOnce(
  modelName: string,
  text: string
): Promise<ExtractedContract> {
  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: EXTRACT_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });
  const userMessage = `CONTRACT TEXT:\n<<<\n${text}\n>>>\n\nReturn the JSON object now.`;
  const r = await model.generateContent(userMessage);
  const raw = stripFences(r.response.text() ?? "");
  if (!raw) {
    const finish = r.response?.candidates?.[0]?.finishReason;
    throw new Error(`Empty model response (finishReason=${finish ?? "unknown"})`);
  }
  const parsed = tryParseJson(raw);
  return extractedContractSchema.parse(parsed);
}

export async function extractContract(text: string): Promise<ExtractedContract> {
  let lastErr: unknown;
  for (const modelName of MODEL_CHAIN) {
    // Up to 3 attempts per model with exponential backoff (350ms, 1.4s, 4s)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await callOnce(modelName, text);
      } catch (e) {
        lastErr = e;
        // 404 = model unavailable in this API version → skip straight to next model
        if (isNotFound(e)) break;
        if (!isTransient(e)) {
          // Permanent error (e.g., schema mismatch) — don't burn retries on this model.
          break;
        }
        const delay = 350 * Math.pow(4, attempt);
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    // If the last error wasn't overload/not-found, switching models won't help.
    if (!isOverload(lastErr) && !isNotFound(lastErr)) break;
  }
  if (isOverload(lastErr)) {
    throw new LLMOverloadedError(
      "All Gemini models are currently rate-limited or overloaded. " +
      "This is common on the free API tier. Please wait 30–60 seconds and try again, " +
      "or consider upgrading your Gemini API to a paid tier for higher limits."
    );
  }
  throw new LLMSchemaError(String(lastErr));
}
