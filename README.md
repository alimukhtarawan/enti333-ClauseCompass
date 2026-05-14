# HireGuard

> **Alberta employment-contract triage in 60 seconds.**
>
> AI-assisted, citation-backed risk scoring for SME employers.

HireGuard is a structured, deterministic triage layer for Alberta employers reviewing their employment agreements. It reads a contract, extracts structured fields using Google's Gemini, scores it against 20 hand-authored Alberta-law rules across six risk categories, and surfaces every red flag with a citation traced directly to a real [CanLII](https://www.canlii.org) source. A side-by-side comparison panel also shows how raw AI tools (ChatGPT, raw Gemini) analyze the same contract — with hallucinated citations flagged in real time.

Built for **ENTI 633 L01 — Generative AI and Prompting**, Spring 2026, Haskayne School of Business, University of Calgary. Taught by Dr. Mohammad Keyhani.

---

## Table of Contents

1. [What the app does](#what-the-app-does)
2. [Key features](#key-features)
3. [Live demo](#live-demo)
4. [Screenshots](#screenshots)
5. [Tech stack](#tech-stack)
6. [Project structure](#project-structure)
7. [Architecture](#architecture)
8. [Scoring methodology](#scoring-methodology)
9. [AI methodology](#ai-methodology)
10. [Getting started](#getting-started)
11. [Environment variables](#environment-variables)
12. [Deployment](#deployment)
13. [Brand kit](#brand-kit)
14. [Contributing](#contributing)
15. [License](#license)
16. [Disclaimer](#disclaimer)

---

## What the app does

Small and mid-size Alberta employers issue offer letters and employment agreements every month — often with clauses that fail under the Alberta **Employment Standards Code** or are unenforceable at common law. HireGuard automates the first-pass review by:

1. **Uploading** a PDF, DOCX, or TXT contract (or pasting the text directly)
2. **Extracting** key clauses via Gemini into a strict typed schema
3. **Scoring** the contract against 20 deterministic Alberta-law rules
4. **Surfacing** red flags with severity, points, and real CanLII citations
5. **Comparing** HireGuard's structured output side-by-side with raw ChatGPT and raw Gemini

Missing contract sections (e.g., no termination clause, no compensation details) are automatically flagged as **Critical risk** — scored at the maximum 100/100 — because silence on a legal obligation is never a safe default under Alberta law.

---

## Key features

### Core triage
- **File upload**: Accepts PDF, DOCX, and TXT files up to 10 MB. Extracts text locally in the browser using `pdfjs-dist` and `mammoth`.
- **Structured extraction**: Gemini reads the contract once and returns a strict JSON schema covering termination, restrictive covenants, compliance, compensation, workplace rights, and flexibility.
- **Deterministic scoring**: 20 rules in `lib/scoring/*.ts` fire based on extracted fields. Rules carry points by severity. The overall score is `50% weighted average + 50% highest category score`, ensuring one Critical section cannot be masked by good scores elsewhere.
- **Missing-section detection**: If an entire category is absent from the contract, it is scored at 100/100 with a Critical "Section absent from contract" hit.
- **Citation integrity**: Every rule's citation is a hard-coded string constant. CanLII URLs come from a verified `CANLII_URLS` map. The LLM is **forbidden** from generating statutes or case law.

### Report page
- **Risk score gauge**: SVG circular gauge showing overall score (0–100) and band (Low / Medium / High / Critical)
- **Category bar chart**: Per-category breakdown with color-coded bars and "MISSING" badges
- **Red flag cards**: Sortable cards showing each fired rule, its severity, points, explanation, and verified CanLII link
- **Questions for your lawyer**: Auto-generated bulleted questions tailored to the contract's red flags
- **Export to PDF**: Client-side PDF generation via `@react-pdf/renderer`

### AI comparison panel
- **Side-by-side opinions**: HireGuard (structured) vs. ChatGPT (raw) vs. Gemini (raw)
- **Hallucination detection**: Citations in raw AI outputs are parsed and checked against a verified whitelist. Unverified citations are flagged with ⚠ in real time.
- **No double extraction**: The comparison API reuses the already-computed extraction from the analyze step, avoiding redundant LLM calls and timeouts.

### Portfolio
- **Persistent storage**: All analyzed contracts are saved to `localStorage` with a portfolio table showing title, date, risk level, top category, and highest flag
- **Seed contracts**: Pre-loaded sample contracts for instant demo without outbound API calls (accessed directly via `/contracts/seed-*`)

---

## Live demo

**Production URL:** https://hireguard-41cac1d2321b1c5f27c3f0c2f49f7df7.replit.app

---

## Screenshots

*(Add screenshots here: home page, analyze page, contract report, comparison panel, portfolio)*

---

## Tech stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | Full-stack React, API routes, SSR |
| Language | TypeScript 5 | Type safety across frontend and backend |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| UI | React 18 + custom components | Interactive reports, gauges, charts |
| PDF export | `@react-pdf/renderer` | Client-side PDF generation |
| LLM extraction | Google Generative AI SDK (`@google/generative-ai`) | Gemini contract extraction with JSON schema |
| LLM comparison | OpenAI SDK (`openai`) | ChatGPT raw opinion for side-by-side panel |
| File parsing | `pdfjs-dist` + `mammoth` | Browser-side PDF and DOCX text extraction |
| Validation | Zod | Runtime schema validation for LLM output |
| Charts | Recharts | Portfolio visualizations (optional) |

---

## Project structure

```
app/
  page.tsx                  # Home page with feature cards + AI testimonial
  layout.tsx                # Root layout with logo nav + disclaimer banner
  analyze/page.tsx          # Upload / paste contract + analyze flow
  portfolio/page.tsx        # User's analyzed contracts table
  about/page.tsx            # Project info + AI hallucination perspective
  contracts/[id]/page.tsx    # Full contract report (gauge, chart, flags, comparison)
  api/analyze/route.ts      # POST: Gemini extraction + deterministic scoring
  api/compare/route.ts     # POST: parallel ChatGPT + raw Gemini comparison
  globals.css               # Tailwind directives + button/card utility classes

components/
  brand-kit.tsx             # Interactive brand guide (colors, typography, tokens)
  risk-score-gauge.tsx      # SVG circular risk gauge
  category-bar-chart.tsx    # Horizontal bar chart per category
  red-flag-card.tsx         # Individual rule-hit card with CanLII link
  ai-comparison-panel.tsx   # Side-by-side ChatGPT / Gemini / HireGuard
  score-band-pill.tsx       # Colored risk band badge
  disclaimer-banner.tsx     # Persistent legal disclaimer
  pdf-report.tsx            # PDF layout for @react-pdf/renderer

lib/
  types.ts                  # Shared TypeScript interfaces
  constants.ts              # Category weights, labels, CanLII URLs, disclaimer
  storage.ts                # localStorage CRUD for user reports
  seed.ts                   # Pre-computed sample contracts
  summary.ts                # Auto-generated summary + lawyer questions
  comparison.ts             # Parallel ChatGPT + raw Gemini comparison logic
  citation-detect.ts        # Regex-based citation extraction + verification
  gemini.ts                 # Gemini extraction with retry/fallback model chain
  openai.ts                 # ChatGPT raw opinion helper
  extract-file-text.ts      # Browser-side PDF/DOCX/TXT text extraction
  scoring/
    index.ts               # Orchestrator: scoreContract(), missing-section logic
    termination.ts          # 4 rules (notice, severance, just cause, saving language)
    restrictive.ts          # 4 rules (non-compete, non-solicit, geographic scope)
    compliance.ts           # 3 rules (governing law, at-will, statutory refs)
    compensation.ts         # 3 rules (overtime straight-time, unstated, missing)
    workplace-rights.ts     # 2 rules (surveillance, IP overbreadth)
    flexibility.ts          # 3 rules (unilateral change, layoff, probation)
```

---

## Architecture

### Three-layer pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  1. EXTRACTION (Gemini)                                      │
│     - Reads contract text once                               │
│     - Returns strict JSON via Zod schema                     │
│     - Retry chain: gemini-2.5-flash → gemini-1.5-flash       │
│     - Forbidden from emitting statutes or case law           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  2. SCORING (Deterministic rules engine)                     │
│     - 20 hand-authored rules across 6 categories             │
│     - Each rule: id, name, severity, points, citation, fires │
│     - Citations are string constants → CANLII_URLS map       │
│     - Missing sections auto-scored at 100 (Critical)        │
│     - Overall = 0.5 × weightedAvg + 0.5 × maxCategory        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  3. COMPARISON (ChatGPT + raw Gemini)                        │
│     - Editorial display only — never feeds into scoring    │
│     - Hallucinated citations flagged vs. verified whitelist  │
│     - Reuses extraction from step 1 (no redundant LLM)     │
└─────────────────────────────────────────────────────────────┘
```

### Why deterministic scoring?

General-purpose AI tools hallucinate with alarming frequency when applied to real employment law. They cite case names that don't exist, misattribute holdings, and invent section numbers. HireGuard's architecture is intentionally the opposite: **all legal conclusions come from hand-authored, version-controlled rules**. The LLM is used only for extraction (reading the contract text into structured fields), never for legal analysis.

---

## Scoring methodology

### Categories and weights

| Category | Weight | What it covers |
|----------|--------|---------------|
| Termination & Severance | 30% | Notice period, severance pay, just cause definition, saving language |
| Statutory Compliance | 20% | Governing law, at-will language, statutory references |
| Flexibility & Change | 15% | Unilateral change clause, layoff without pay, probation period |
| Restrictive Covenants | 15% | Non-compete, non-solicit, geographic scope |
| Compensation Structure | 10% | Base salary, overtime treatment, vacation pay |
| Workplace Rights & Privacy | 10% | Privacy clause, surveillance, IP assignment |

### Score bands

| Band | Range | Meaning |
|------|-------|---------|
| Low | 0–34 | Few or minor concerns |
| Medium | 35–64 | Notable risks present |
| High | 65–84 | Serious risks — legal review strongly advised |
| Critical | 85–100 | Severe risks — immediate legal attention required |

### Missing sections

If a category is entirely absent from the contract (e.g., no termination clause at all), that category is automatically scored at **100/100 Critical**. The rationale: under Alberta law, silence on a statutory obligation defaults to the minimum, which creates legal uncertainty and is a common source of disputes.

### Overall score formula

```
overall = round( 0.5 × weightedAverage + 0.5 × maxCategoryScore )
```

This ensures a contract with one Critical category cannot be masked by good scores elsewhere. A single 100 in Termination (weight 30%) would produce:
- Weighted average alone: 30
- With max blending: round(0.5 × 30 + 0.5 × 100) = 65 (High)

---

## AI methodology

### Extraction
- **Model chain**: `gemini-2.5-flash` → `gemini-1.5-flash` (fallback if overloaded or unavailable)
- **Temperature**: 0.1 (low creativity, high fidelity)
- **Output**: JSON via `responseMimeType: "application/json"`
- **Validation**: Zod schema parses and validates every field server-side
- **Guardrails**: System prompt explicitly forbids the model from generating statutes, case law, or legal conclusions

### Comparison
- **ChatGPT**: `gpt-4o-mini` with a temperature of 0.5, asked for a brief legal opinion
- **Raw Gemini**: `gemini-2.5-flash` with the same prompt, for direct comparison
- **Hallucination detection**: Regex-based citation extraction checks against `VERIFIED_CITATION_TOKENS` and `CITATION_REGEXES`. Anything not matching is flagged as `unverified-possible-hallucination`.

---

## Getting started

### Prerequisites
- Node.js 20 LTS
- npm or pnpm

### Installation

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY and OPENAI_API_KEY
npm run dev
```

The dev server starts on `http://localhost:5000` (port 5000, host 0.0.0.0).

### On Replit
1. Fork the project
2. Set `GEMINI_API_KEY` and `OPENAI_API_KEY` in Replit Secrets
3. Click **Run**

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google AI Studio API key for contract extraction |
| `OPENAI_API_KEY` | Yes | OpenAI API key for comparison panel |
| `NEXT_PUBLIC_APP_NAME` | No | App display name (defaults to "HireGuard") |

---

## Deployment

### Replit (current)
The app is deployed automatically via Replit's built-in hosting. The production URL is generated on publish.

### Vercel / self-hosted
```bash
npm run build
npm start
```

Set the same environment variables in your hosting provider.

---

## Brand kit

An interactive brand guide is included at `components/brand-kit.tsx`. It documents:
- Color palette (navy, gold, green, neutrals, risk bands)
- Typography scale
- Spacing, shadows, and border radius tokens
- Button, card, and alert component examples
- Code snippets for importing tokens into new components

Render `<BrandKit />` on any page to browse the full guide.

---

## Contributing

This is a student project for ENTI 633. Contributions are welcome for educational purposes. Please open an issue before submitting a pull request.

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

## Disclaimer

HireGuard is a student project. It is **not a law firm** and does **not provide legal advice**. The summaries, risk scores, red flags, and questions produced by this product are generated by automated tools and may be incomplete or incorrect. HireGuard's outputs are intended to help an Alberta employer identify and prioritize possible risks in employment agreements so they can decide when to seek qualified legal advice. Always consult a lawyer licensed by the Law Society of Alberta before acting on any output from this product. Use of HireGuard does not create a solicitor-client relationship.

---

*Built with AI assistance. All deterministic rules, citations, and legal conclusions were authored and verified by humans. LLMs are used only for text extraction and editorial comparison display.*
