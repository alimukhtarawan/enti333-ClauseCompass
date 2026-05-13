import { DISCLAIMER } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">About HireGuard</h1>
      <p className="mt-4 text-slate-700 leading-relaxed">
        HireGuard is a class project built for ENTI 633 L01 — Generative AI and Prompting,
        Spring 2026, Haskayne School of Business, University of Calgary, taught by Dr. Mohammad
        Keyhani. It is a structured, citation-backed triage layer for Alberta employers reviewing
        their employment contracts. It is not a replacement for legal counsel.
      </p>

      <h2 className="mt-8 text-lg font-semibold">Team</h2>
      <ul className="mt-2 list-disc list-inside text-slate-700 text-sm">
        <li>HireGuard Team (placeholder)</li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Links</h2>
      <ul className="mt-2 list-disc list-inside text-sm">
        <li>
          <a href="#" data-fill="github-repo" className="text-brand underline">
            GitHub repository (placeholder)
          </a>
        </li>
        <li>
          <a href="#" data-fill="blog-post" className="text-brand underline">
            Blog post (placeholder)
          </a>
        </li>
        <li>
          <a href="#" data-fill="demo-video" className="text-brand underline">
            3-minute demo video (placeholder)
          </a>
        </li>
      </ul>

      <h2 className="mt-8 text-lg font-semibold">Disclaimer</h2>
      <p className="mt-2 text-xs text-slate-700 leading-relaxed">{DISCLAIMER}</p>
    </div>
  );
}
