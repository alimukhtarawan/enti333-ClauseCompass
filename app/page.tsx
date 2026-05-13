import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold text-brand-dark">HireGuard</h1>
      <p className="mt-3 text-xl text-slate-700">
        Alberta employment-contract triage in 60 seconds.
      </p>
      <p className="mt-8 max-w-2xl text-slate-700 leading-relaxed">
        Small and mid-size Alberta employers issue offer letters and employment agreements
        every month — often with clauses that fail under the Alberta Employment Standards Code
        or are unenforceable at common law. HireGuard reads each contract, scores it across six
        Alberta-law risk categories, and surfaces every red flag with a citation traced back to
        a real CanLII source.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/portfolio" className="btn-primary">
          Try a sample contract
        </Link>
        <Link href="/analyze" className="btn-secondary">
          Paste your own contract
        </Link>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Feature
          title="Citations from code, not LLMs"
          body="Every red flag points to a string constant in the rules engine, then to a real CanLII URL. The LLM is forbidden from generating statutes or case law."
        />
        <Feature
          title="Six Alberta-law categories"
          body="Termination, restrictive covenants, compliance, compensation, workplace rights, and flexibility — weighted by their financial consequence."
        />
        <Feature
          title="Compare to raw AI"
          body="Side-by-side outputs from ChatGPT and raw Gemini, with hallucinated citations flagged in real time."
        />
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-700">{body}</p>
    </div>
  );
}
