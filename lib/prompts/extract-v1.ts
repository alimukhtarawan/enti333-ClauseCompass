export const EXTRACT_SYSTEM_PROMPT = `You are an extraction assistant for an Alberta employment-contract triage tool.

Your sole job is to read the contract text below and return a structured JSON object describing what the contract literally says.

HARD RULES:
1. Extract only what is literally in the text. Do not infer beyond the text.
2. Do not provide legal opinions, recommendations, or advice.
3. Do not assess enforceability — that is done downstream by deterministic rules.
4. Do not invent, cite, or reference any statutes, regulations, or case law.
5. If the document does not appear to be (a) governed by Alberta law, or (b) an individual employment contract, set scopeFlag = "out_of_scope" with a brief reason and leave all other fields null.
6. For every clause-level field, include a verbatim excerpt (<= 50 words) under the excerpt sub-object.

CONTRACT TEXT:
<<<
{{contract_text}}
>>>`;

import { SchemaType } from "@google/generative-ai";

const excerptSchema = {
  type: SchemaType.OBJECT,
  nullable: true,
  properties: {
    text: { type: SchemaType.STRING },
    confidence: { type: SchemaType.NUMBER },
  },
  required: ["text", "confidence"],
};

const nullableString = { type: SchemaType.STRING, nullable: true };
const nullableBoolean = { type: SchemaType.BOOLEAN, nullable: true };
const nullableNumber = { type: SchemaType.NUMBER, nullable: true };

export const GEMINI_EXTRACTION_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    scopeFlag: { type: SchemaType.STRING, enum: ["in_scope", "out_of_scope"] },
    scopeReason: { type: SchemaType.STRING, nullable: true },
    termination: {
      type: SchemaType.OBJECT,
      properties: {
        noticePeriod: nullableString,
        severancePay: nullableString,
        savingLanguage: nullableBoolean,
        justCauseDefinition: nullableString,
        excerpt: excerptSchema,
      },
      required: ["noticePeriod", "severancePay", "savingLanguage", "justCauseDefinition", "excerpt"],
    },
    restrictive: {
      type: SchemaType.OBJECT,
      properties: {
        nonCompete: {
          type: SchemaType.OBJECT,
          properties: {
            present: { type: SchemaType.BOOLEAN },
            durationMonths: nullableNumber,
            geography: nullableString,
          },
          required: ["present", "durationMonths", "geography"],
        },
        nonSolicit: {
          type: SchemaType.OBJECT,
          properties: {
            present: { type: SchemaType.BOOLEAN },
            durationMonths: nullableNumber,
          },
          required: ["present", "durationMonths"],
        },
        excerpt: excerptSchema,
      },
      required: ["nonCompete", "nonSolicit", "excerpt"],
    },
    compliance: {
      type: SchemaType.OBJECT,
      properties: {
        governingLaw: nullableString,
        atWillLanguage: nullableBoolean,
        statutoryReferences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        excerpt: excerptSchema,
      },
      required: ["governingLaw", "atWillLanguage", "statutoryReferences", "excerpt"],
    },
    compensation: {
      type: SchemaType.OBJECT,
      properties: {
        baseSalary: nullableString,
        overtimeTreatment: {
          type: SchemaType.STRING,
          nullable: true,
          enum: ["1.5x", "straight-time", "unstated"],
        },
        vacationPay: nullableString,
        bonusTerms: nullableString,
        excerpt: excerptSchema,
      },
      required: ["baseSalary", "overtimeTreatment", "vacationPay", "bonusTerms", "excerpt"],
    },
    workplaceRights: {
      type: SchemaType.OBJECT,
      properties: {
        privacyClause: nullableString,
        surveillanceClause: nullableString,
        ipAssignment: nullableString,
        excerpt: excerptSchema,
      },
      required: ["privacyClause", "surveillanceClause", "ipAssignment", "excerpt"],
    },
    flexibility: {
      type: SchemaType.OBJECT,
      properties: {
        unilateralChangeClause: nullableBoolean,
        layoffWithoutPay: nullableBoolean,
        probationPeriodMonths: nullableNumber,
        excerpt: excerptSchema,
      },
      required: ["unilateralChangeClause", "layoffWithoutPay", "probationPeriodMonths", "excerpt"],
    },
  },
  required: [
    "scopeFlag",
    "termination",
    "restrictive",
    "compliance",
    "compensation",
    "workplaceRights",
    "flexibility",
  ],
};
