import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import type { ExtractedContract } from "@/lib/types";
import { EXTRACT_SYSTEM_PROMPT, GEMINI_EXTRACTION_SCHEMA } from "@/lib/prompts/extract-v1";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
if (!apiKey) throw new Error("Missing GEMINI_API_KEY. See .env.example.");
const client = new GoogleGenerativeAI(apiKey);

export class LLMSchemaError extends Error {}

const excerptSchema = z
  .object({ text: z.string(), confidence: z.number() })
  .nullable();

const extractedContractSchema: z.ZodType<ExtractedContract> = z.object({
  scopeFlag: z.enum(["in_scope", "out_of_scope"]),
  scopeReason: z.string().optional(),
  termination: z.object({
    noticePeriod: z.string().nullable(),
    severancePay: z.string().nullable(),
    savingLanguage: z.boolean().nullable(),
    justCauseDefinition: z.string().nullable(),
    excerpt: excerptSchema,
  }),
  restrictive: z.object({
    nonCompete: z.object({
      present: z.boolean(),
      durationMonths: z.number().nullable(),
      geography: z.string().nullable(),
    }),
    nonSolicit: z.object({
      present: z.boolean(),
      durationMonths: z.number().nullable(),
    }),
    excerpt: excerptSchema,
  }),
  compliance: z.object({
    governingLaw: z.string().nullable(),
    atWillLanguage: z.boolean().nullable(),
    statutoryReferences: z.array(z.string()),
    excerpt: excerptSchema,
  }),
  compensation: z.object({
    baseSalary: z.string().nullable(),
    overtimeTreatment: z.enum(["1.5x", "straight-time", "unstated"]).nullable(),
    vacationPay: z.string().nullable(),
    bonusTerms: z.string().nullable(),
    excerpt: excerptSchema,
  }),
  workplaceRights: z.object({
    privacyClause: z.string().nullable(),
    surveillanceClause: z.string().nullable(),
    ipAssignment: z.string().nullable(),
    excerpt: excerptSchema,
  }),
  flexibility: z.object({
    unilateralChangeClause: z.boolean().nullable(),
    layoffWithoutPay: z.boolean().nullable(),
    probationPeriodMonths: z.number().nullable(),
    excerpt: excerptSchema,
  }),
});

export async function extractContract(text: string): Promise<ExtractedContract> {
  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: EXTRACT_SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
      responseSchema: GEMINI_EXTRACTION_SCHEMA as any,
    },
  });

  const attempt = async () => {
    const r = await model.generateContent(text);
    const raw = r.response
      .text()
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return extractedContractSchema.parse(JSON.parse(raw));
  };

  try {
    return await attempt();
  } catch {
    try {
      return await attempt();
    } catch (e) {
      throw new LLMSchemaError(String(e));
    }
  }
}
