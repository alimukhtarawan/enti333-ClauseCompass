import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { extractContract, LLMSchemaError, LLMOverloadedError } from "@/lib/gemini";
import { scoreContract } from "@/lib/scoring";
import { templateSummary } from "@/lib/summary";
import type { OverallReport } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const ReqSchema = z.object({
  contractText: z
    .string()
    .min(200, "contract_text_too_short")
    .max(100000, "contract_text_too_long"),
  title: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof ReqSchema>;
  try {
    body = ReqSchema.parse(await req.json());
  } catch (e: any) {
    const code = e?.errors?.[0]?.message ?? "invalid_input";
    return NextResponse.json({ error: code, message: String(e) }, { status: 400 });
  }
  try {
    const extracted = await extractContract(body.contractText);
    if (extracted.scopeFlag === "out_of_scope") {
      return NextResponse.json(
        { error: "out_of_scope", message: extracted.scopeReason ?? "" },
        { status: 400 }
      );
    }
    const { categories, overallScore, overallBand } = scoreContract(extracted);
    const { summary, questionsForLawyer } = templateSummary(extracted, categories);
    const report: OverallReport = {
      id: crypto.randomUUID(),
      title: body.title ?? `Untitled contract ${new Date().toISOString()}`,
      createdAt: new Date().toISOString(),
      source: "user-paste",
      rawText: body.contractText.slice(0, 8000),
      extracted,
      categories,
      overallScore,
      overallBand,
      summary,
      questionsForLawyer,
    };
    return NextResponse.json(report);
  } catch (e) {
    if (e instanceof LLMOverloadedError)
      return NextResponse.json(
        { error: "llm_overloaded", message: e.message },
        { status: 503 }
      );
    if (e instanceof LLMSchemaError)
      return NextResponse.json({ error: "llm_failure", message: e.message }, { status: 502 });
    return NextResponse.json({ error: "llm_failure", message: String(e) }, { status: 502 });
  }
}
