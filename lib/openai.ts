import OpenAI from "openai";
import { RAW_OPINION_PROMPT, RAW_OPINION_SYSTEM } from "@/lib/prompts/raw-opinion-v1";
import { extractCitations } from "@/lib/citation-detect";
import type { ProviderOpinion } from "@/lib/types";

if (!process.env.OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY.");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function rawChatGPTOpinion(contractText: string): Promise<ProviderOpinion> {
  try {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 250,
      messages: [
        { role: "system", content: RAW_OPINION_SYSTEM },
        {
          role: "user",
          content: `${RAW_OPINION_PROMPT}\n\nCONTRACT:\n<<<\n${contractText.slice(0, 8000)}\n>>>`,
        },
      ],
    });
    const text = resp.choices[0]?.message?.content?.trim() ?? "";
    return {
      provider: "chatgpt",
      displayName: "ChatGPT-4o-mini",
      status: "ok",
      text,
      citations: extractCitations(text),
      generatedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      provider: "chatgpt",
      displayName: "ChatGPT-4o-mini",
      status: "error",
      errorMessage: String(err).slice(0, 200),
      text: "",
      citations: [],
      generatedAt: new Date().toISOString(),
    };
  }
}
