import type { RuleHit } from "@/lib/types";
import { ScoreBandPill } from "@/components/score-band-pill";

export function RedFlagCard({ hit }: { hit: RuleHit }) {
  return (
    <article className="card p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ScoreBandPill band={hit.severity} />
            <h3 className="font-semibold text-slate-900">{hit.name}</h3>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {hit.points} pts · {hit.jurisdiction}
          </div>
        </div>
      </header>
      {hit.excerpt && (
        <blockquote className="mt-3 text-sm text-slate-700 border-l-4 border-slate-300 pl-3 italic">
          &ldquo;{hit.excerpt.text}&rdquo;
        </blockquote>
      )}
      <p className="mt-3 text-sm text-slate-700">{hit.explanation}</p>
      <div className="mt-3 text-xs text-slate-600">
        <span className="font-medium">Authority: </span>
        {hit.citation}
      </div>
      {hit.jurisdiction === "persuasive-non-AB" && (
        <div className="mt-1 text-xs text-slate-500 italic">
          {hit.jurisdictionNote ?? "Persuasive authority — not binding in Alberta."}
        </div>
      )}
      {hit.canliiUrl && (
        <a
          href={hit.canliiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-brand hover:underline"
        >
          View on CanLII →
        </a>
      )}
    </article>
  );
}
