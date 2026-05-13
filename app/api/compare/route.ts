import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getLiveComparison } from "@/lib/comparison";
import { extractContract } from "@/lib/gemini";
import { findSeed } from "@/lib/seed";
import type { ExtractedContract } from "@/lib/types";

export const maxDuration = 60;
export const runtime = "nodejs";

const ReqSchema = z.object({
  contractText: z.string().min(200).max(20000),
  reportId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  let body: z.infer<typeof ReqSchema>;
  try {
    body = ReqSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json(
      { error: "invalid_input", message: String(e) },
      { status: 400 }
    );
  }
  try {
    // Trust ONLY server-derived extraction. Never accept rules/citations from the client.
    let extracted: ExtractedContract;
    if (body.reportId?.startsWith("seed-")) {
      const seed = findSeed(body.reportId);
      if (!seed) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      extracted = seed.precomputed.extracted;
    } else {
      extracted = await extractContract(body.contractText);
    }
    const comparison = await getLiveComparison(body.contractText, extracted);
    return NextResponse.json(comparison);
  } catch (e) {
    return NextResponse.json(
      { error: "comparison_failed", message: String(e).slice(0, 300) },
      { status: 502 }
    );
  }
}
