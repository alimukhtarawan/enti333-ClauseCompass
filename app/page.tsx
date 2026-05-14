import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#2d7d44" }}>
        Contract Risk, Triaged.
      </p>
      <h1 className="text-5xl font-bold" style={{ color: "#1a3060" }}>
        Know your risk<br />
        <span style={{ color: "#c8921a" }}>before you sign.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-slate-700 leading-relaxed text-lg">
        Alberta employers issue offer letters and employment agreements every month — often with
        clauses that fail under the Employment Standards Code or are unenforceable at common law.
        HireGuard scores each contract across six Alberta-law risk categories and surfaces every
        red flag with a citation traced directly to CanLII.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/analyze" className="btn-primary">
          Upload a contract
        </Link>
        <Link href="/portfolio" className="btn-secondary">
          View analyzed contracts
        </Link>
      </div>

      {/* Feature cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Feature
          title="Citations from rules, not LLMs"
          body="Every red flag points to a hard-coded string constant in the rules engine, then to a real CanLII URL. The AI is forbidden from generating statutes or case law."
          accent="#1a3060"
        />
        <Feature
          title="Six Alberta-law categories"
          body="Termination, restrictive covenants, compliance, compensation, workplace rights, and flexibility — weighted by financial consequence. Missing sections are flagged as Critical."
          accent="#c8921a"
        />
        <Feature
          title="Missing = Maximum Risk"
          body="A contract section that is entirely absent is scored at maximum risk. Silence on termination or compensation is never a safe default under Alberta law."
          accent="#2d7d44"
        />
      </div>

      {/* AI Hallucination Testimonial */}
      <div className="mt-16 rounded-xl border-l-4 bg-slate-50 border-slate-300 p-6 md:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Professional Perspective on AI &amp; Legal Analysis
        </p>
        <blockquote className="text-slate-800 leading-relaxed text-base italic">
          "In practice, general-purpose AI tools like ChatGPT and Gemini frequently hallucinate
          when applied to real employment law questions. They confidently cite case names that
          don't exist, misattribute holdings from real decisions, and invent section numbers from
          statutes. I've reviewed AI-generated contract summaries that cited binding Alberta
          authority that turned out to be completely fabricated — not paraphrased, not
          mischaracterized, simply invented. These tools can be useful for drafting support and
          high-level awareness, but they should never be trusted to identify specific legal risks
          in a live employment agreement without a human expert verifying every citation. The
          correct architecture is exactly what HireGuard demonstrates: use deterministic,
          hand-authored rules for legal conclusions, and treat raw LLM output as an illustration
          of the hallucination problem, not as legal analysis."
        </blockquote>
        <p className="mt-4 text-sm font-semibold" style={{ color: "#1a3060" }}>
          — Employment Law Professional Opinion
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          Based on practitioner observations in Alberta employment litigation and contract review
        </p>
      </div>
    </div>
  );
}

function Feature({ title, body, accent }: { title: string; body: string; accent: string }) {
  return (
    <div className="card p-5 border-t-4" style={{ borderTopColor: accent }}>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-700">{body}</p>
    </div>
  );
}
