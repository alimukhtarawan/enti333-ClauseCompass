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

const extractedContractSchema: z.ZodType<ExtractedContract> = z.object({
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

export async function extractContract(text: string): Promise<ExtractedContract> {
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: EXTRACT_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
    },
  });

  const userMessage = `CONTRACT TEXT:\n<<<\n${text}\n>>>\n\nReturn the JSON object now.`;

  const attempt = async () => {
    const r = await model.generateContent(userMessage);
    const raw = stripFences(r.response.text() ?? "");
    if (!raw) throw new Error("Empty model response");
    const parsed = tryParseJson(raw);
    return extractedContractSchema.parse(parsed);
  };

  let lastErr: unknown;
  for (let i = 0; i < 2; i++) {
    try {
      return await attempt();
    } catch (e) {
      lastErr = e;
      // brief delay before retry
      await new Promise((res) => setTimeout(res, 400));
    }
  }
  throw new LLMSchemaError(String(lastErr));
}
