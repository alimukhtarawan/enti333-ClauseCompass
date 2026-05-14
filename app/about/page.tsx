import { DISCLAIMER } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold" style={{ color: "#1a3060" }}>About HireGuard</h1>
      <p className="mt-4 text-slate-700 leading-relaxed">
        HireGuard is a class project built for ENTI 633 L01 — Generative AI and Prompting,
        Spring 2026, Haskayne School of Business, University of Calgary, taught by Dr. Mohammad
        Keyhani. It is a structured, citation-backed triage layer for Alberta employers reviewing
        their employment contracts. It is not a replacement for legal counsel.
      </p>

      <h2 className="mt-8 text-lg font-semibold" style={{ color: "#1a3060" }}>
        Why AI alone is not enough
      </h2>
      <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Professional Perspective
        </p>
        <blockquote className="text-slate-800 leading-relaxed italic text-sm">
          "General-purpose AI tools like ChatGPT and Gemini hallucinate with alarming frequency
          when applied to real employment law questions. They confidently cite case names that
          don't exist, misattribute holdings from real decisions, and invent section numbers from
          statutes. I've reviewed AI-generated contract summaries that cited binding Alberta
          authority that turned out to be completely fabricated — not paraphrased, not
          mischaracterized, simply invented with no basis in reality.
          <br /><br />
          These tools can be useful for drafting support and high-level awareness, but they should
          never be trusted to identify specific legal risks in a live employment agreement without
          a human expert verifying every citation. The correct architecture is what HireGuard
          demonstrates: use deterministic, hand-authored rules for all legal conclusions, and
          treat raw LLM output as an illustration of the hallucination problem — not as legal
          analysis. A language model's confidence is not evidence of its accuracy."
        </blockquote>
        <p className="mt-4 text-sm font-semibold" style={{ color: "#1a3060" }}>
          — Employment Law Professional Opinion
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Based on practitioner observations in Alberta employment litigation and contract review
        </p>
      </div>

      <h2 className="mt-8 text-lg font-semibold" style={{ color: "#1a3060" }}>
        How the risk score works
      </h2>
      <div className="mt-3 text-sm text-slate-700 space-y-3 leading-relaxed">
        <p>
          Each contract is scored across six Alberta-law categories. Within each category, a set
          of deterministic rules fires based on what the AI extracted from the contract text.
          Rules carry points based on severity; category scores are capped at 100.
        </p>
        <p>
          <strong>Missing sections are scored at maximum risk (100).</strong> If a category
          (e.g., termination, compensation) is entirely absent from the contract, it is flagged
          as missing and treated as the highest possible risk — silence on a legal obligation is
          never a safe default under Alberta law.
        </p>
        <p>
          <strong>The overall score blends breadth and severity:</strong> it is the average of
          the weighted category score and the single highest-risk category score. This means a
          contract with one Critical section cannot be masked by good scores elsewhere.
        </p>
      </div>

      <h2 className="mt-8 text-lg font-semibold" style={{ color: "#1a3060" }}>Team</h2>
      <ul className="mt-2 list-disc list-inside text-slate-700 text-sm">
        <li>HireGuard Team (placeholder)</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold" style={{ color: "#1a3060" }}>Links</h2>
      <ul className="mt-2 list-disc list-inside text-sm space-y-1">
        <li>
          <a href="#" className="underline hover:opacity-80 transition-opacity" style={{ color: "#1a3060" }}>
            GitHub repository (placeholder)
          </a>
        </li>
        <li>
          <a href="#" className="underline hover:opacity-80 transition-opacity" style={{ color: "#1a3060" }}>
            Blog post (placeholder)
          </a>
        </li>
        <li>
          <a href="#" className="underline hover:opacity-80 transition-opacity" style={{ color: "#1a3060" }}>
            3-minute demo video (placeholder)
          </a>
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold" style={{ color: "#1a3060" }}>Disclaimer</h2>
      <p className="mt-2 text-xs text-slate-700 leading-relaxed">{DISCLAIMER}</p>
    </div>
  );
}
