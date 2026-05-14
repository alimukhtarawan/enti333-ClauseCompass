"use client";

import { useState } from "react";

/**
 * HIREGUARD BRAND KIT
 * ====================
 * Interactive reference component for the HireGuard visual identity.
 *
 * Extracted from the current codebase and logo design. Use this as a
 * living style guide when prompting AI tools or designing new features.
 *
 * Brand values: trust, authority, legal precision, Alberta employment law.
 * Logo colors: navy + gold + green.
 *
 * Usage in other files:
 *   <BrandKit />   renders this page for reference
 */

/* ------------------------------------------------------------------ */
/* 1.  COLOR PALETTE (three-hex + neutrals)                          */
/* ------------------------------------------------------------------ */

export const PALETTE = {
  // PRIMARY — navy blue (dominant, trust, authority)
  navy: {
    DEFAULT: "#1a3060",
    dark: "#0f1f42",
    light: "#e8ecf3",
    muted: "#6b7a8f",
    pale: "#f4f7fc",
  },
  // ACCENT — gold (energy, highlights, CTAs)
  gold: {
    DEFAULT: "#c8921a",
    dark: "#a87510",
    light: "#f9eed4",
  },
  // SECONDARY — forest green (success, low-risk, positive)
  green: {
    DEFAULT: "#2d7d44",
    dark: "#1f5c30",
    light: "#e2f3e7",
  },
  // NEUTRALS
  slate: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
  },
  // RISK BANDS (unchanged, semantic)
  risk: {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#f97316",
    critical: "#dc2626",
  },
} as const;

/* ------------------------------------------------------------------ */
/* 2.  TYPOGRAPHY                                                     */
/* ------------------------------------------------------------------ */

export const TYPE = {
  family:
    'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
  },
} as const;

/* ------------------------------------------------------------------ */
/* 3.  SPACING (Tailwind defaults used consistently)                  */
/* ------------------------------------------------------------------ */

export const SPACE = {
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
} as const;

/* ------------------------------------------------------------------ */
/* 4.  SHADOWS                                                        */
/* ------------------------------------------------------------------ */

export const SHADOW = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
} as const;

/* ------------------------------------------------------------------ */
/* 5.  COMPONENT TOKENS                                               */
/* ------------------------------------------------------------------ */

export const TOKENS = {
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
  },
  button: {
    primary: { bg: PALETTE.navy.DEFAULT, text: "#fff", hover: PALETTE.navy.dark },
    secondary: { bg: "#fff", text: PALETTE.navy.DEFAULT, border: PALETTE.slate[300] },
    gold: { bg: PALETTE.gold.DEFAULT, text: "#fff", hover: PALETTE.gold.dark },
  },
  card: {
    bg: "#fff",
    border: PALETTE.slate[200],
    shadow: SHADOW.DEFAULT,
  },
} as const;

/* ================================================================= */
/* INTERACTIVE DISPLAY COMPONENT                                       */
/* ================================================================= */

type Section = "colors" | "typography" | "components" | "usage";

export function BrandKit() {
  const [active, setActive] = useState<Section>("colors");

  return (
    <div
      className="min-h-screen p-6 md:p-12"
      style={{ background: PALETTE.slate[50], fontFamily: TYPE.family }}
    >
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg"
            style={{ background: PALETTE.navy.DEFAULT }}
          >
            H
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ color: PALETTE.navy.DEFAULT }}
          >
            HireGuard
            <span style={{ color: PALETTE.gold.DEFAULT }}> Brand Kit</span>
          </h1>
        </div>
        <p className="text-sm" style={{ color: PALETTE.slate[500] }}>
          Alberta employment-contract triage app. Reference this kit when prompting
          AI tools or adding new UI components.
        </p>
      </header>

      {/* Nav tabs */}
      <nav className="max-w-5xl mx-auto flex gap-2 mb-8 flex-wrap">
        {(["colors", "typography", "components", "usage"] as Section[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setActive(s)}
              className="px-4 py-2 rounded-md text-sm font-medium transition"
              style={{
                background:
                  active === s ? PALETTE.navy.DEFAULT : "#fff",
                color: active === s ? "#fff" : PALETTE.navy.DEFAULT,
                border: `1px solid ${PALETTE.slate[200]}`,
              }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          )
        )}
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        {active === "colors" && <ColorsSection />}
        {active === "typography" && <TypographySection />}
        {active === "components" && <ComponentsSection />}
        {active === "usage" && <UsageSection />}
      </div>
    </div>
  );
}

/* ========================= COLORS ================================= */

function ColorsSection() {
  const rows = [
    { name: "Navy (primary)", colors: PALETTE.navy },
    { name: "Gold (accent)", colors: PALETTE.gold },
    { name: "Green (success)", colors: PALETTE.green },
  ];
  return (
    <div className="space-y-8">
      {rows.map((row) => (
        <div key={row.name}>
          <h2
            className="text-lg font-semibold mb-3"
            style={{ color: PALETTE.navy.DEFAULT }}
          >
            {row.name}
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(row.colors).map(([key, hex]) => (
              <div key={key} className="text-center">
                <div
                  className="w-20 h-20 rounded-lg shadow-sm border border-slate-200 mb-1"
                  style={{ background: hex }}
                />
                <p className="text-xs font-medium" style={{ color: PALETTE.slate[700] }}>
                  {key}
                </p>
                <p className="text-[10px] font-mono" style={{ color: PALETTE.slate[500] }}>
                  {hex}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: PALETTE.navy.DEFAULT }}>
          Risk bands
        </h2>
        <div className="flex gap-4">
          {Object.entries(PALETTE.risk).map(([key, hex]) => (
            <div key={key} className="text-center">
              <div
                className="w-20 h-20 rounded-lg shadow-sm mb-1"
                style={{ background: hex }}
              />
              <p className="text-xs font-medium capitalize">{key}</p>
              <p className="text-[10px] font-mono">{hex}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: PALETTE.navy.DEFAULT }}>
          Neutrals (slate)
        </h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PALETTE.slate).map(([key, hex]) => (
            <div key={key} className="text-center">
              <div
                className="w-12 h-12 rounded-md border border-slate-200 mb-1"
                style={{ background: hex }}
              />
              <p className="text-[10px] font-mono">{hex}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ========================= TYPOGRAPHY ============================= */

function TypographySection() {
  return (
    <div className="space-y-6">
      <p className="text-sm" style={{ color: PALETTE.slate[600] }}>
        Font: <span className="font-mono text-xs">{TYPE.family}</span>
      </p>
      {Object.entries(TYPE.sizes).map(([name, val]) => (
        <div key={name} className="flex items-baseline gap-4 border-b border-slate-100 pb-3">
          <span className="text-xs font-mono w-16" style={{ color: PALETTE.slate[400] }}>
            {name}
          </span>
          <span style={{ fontSize: val, fontWeight: TYPE.weights.semibold, color: PALETTE.navy.DEFAULT }}>
            The quick brown fox
          </span>
          <span className="text-xs ml-auto" style={{ color: PALETTE.slate[400] }}>
            {val}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ========================= COMPONENTS ============================= */

function ComponentsSection() {
  return (
    <div className="space-y-8">
      {/* Buttons */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: PALETTE.navy.DEFAULT }}>
          Buttons
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition"
            style={{ background: TOKENS.button.primary.bg }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = TOKENS.button.primary.hover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = TOKENS.button.primary.bg)
            }
          >
            Primary
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm font-medium transition"
            style={{
              background: TOKENS.button.secondary.bg,
              color: TOKENS.button.secondary.text,
              border: `1px solid ${TOKENS.button.secondary.border}`,
            }}
          >
            Secondary
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition"
            style={{ background: TOKENS.button.gold.bg }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = TOKENS.button.gold.hover)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = TOKENS.button.gold.bg)
            }
          >
            Gold
          </button>
          <button
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition opacity-50 cursor-not-allowed"
            style={{ background: TOKENS.button.primary.bg }}
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Cards */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: PALETTE.navy.DEFAULT }}>
          Cards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-5 rounded-lg border"
            style={{
              background: TOKENS.card.bg,
              borderColor: TOKENS.card.border,
              boxShadow: TOKENS.card.shadow,
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: PALETTE.navy.DEFAULT }}>
              Default card
            </h3>
            <p className="mt-2 text-xs" style={{ color: PALETTE.slate[600] }}>
              Standard card with border and light shadow.
            </p>
          </div>
          <div
            className="p-5 rounded-lg border"
            style={{
              background: PALETTE.gold.light,
              borderColor: PALETTE.gold.DEFAULT,
              borderLeftWidth: "4px",
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: PALETTE.gold.dark }}>
              Accent card
            </h3>
            <p className="mt-2 text-xs" style={{ color: PALETTE.gold.dark }}>
              Gold accent border for emphasis.
            </p>
          </div>
          <div
            className="p-5 rounded-lg border"
            style={{
              background: PALETTE.green.light,
              borderColor: PALETTE.green.DEFAULT,
              borderLeftWidth: "4px",
            }}
          >
            <h3 className="font-semibold text-sm" style={{ color: PALETTE.green.dark }}>
              Success card
            </h3>
            <p className="mt-2 text-xs" style={{ color: PALETTE.green.dark }}>
              Green accent for positive / low-risk states.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div>
        <h2 className="text-lg font-semibold mb-3" style={{ color: PALETTE.navy.DEFAULT }}>
          Status alerts
        </h2>
        <div className="space-y-3">
          <div
            className="p-3 rounded-md text-xs font-medium"
            style={{ background: PALETTE.green.light, color: PALETTE.green.dark }}
          >
            ✅ Verified citation — good to go
          </div>
          <div
            className="p-3 rounded-md text-xs font-medium"
            style={{ background: "#fef3c7", color: "#92400e" }}
          >
            ⚠️ Unverified citation — possible hallucination
          </div>
          <div
            className="p-3 rounded-md text-xs font-medium"
            style={{ background: "#fee2e2", color: "#991b1b" }}
          >
            🚨 Critical risk — section absent from contract
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================= USAGE ================================== */

function UsageSection() {
  const snippets = [
    {
      title: "Tailwind classes (from tailwind.config.ts)",
      code: `bg-brand          // navy #1a3060
bg-brand-dark     // navy hover #0f1f42
text-brand        // navy text
bg-brand-gold     // gold #c8921a
bg-brand-green    // green #2d7d44`,
    },
    {
      title: "Inline tokens for dynamic components",
      code: `import { PALETTE, TOKENS } from "@/components/brand-kit";

style={{ background: PALETTE.navy.DEFAULT }}
style={{ borderColor: TOKENS.card.border }}`,
    },
    {
      title: "When building a new page",
      code: `// Top heading
<h1 style={{ color: PALETTE.navy.DEFAULT }}>Title</h1>

// Subhead / body
<p style={{ color: PALETTE.slate[600] }}>Description</p>

// CTA button
<button className="btn-primary">Action</button>

// Card container
<div className="card p-5">Content</div>`,
    },
  ];

  return (
    <div className="space-y-8">
      {snippets.map((s) => (
        <div key={s.title}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: PALETTE.navy.DEFAULT }}>
            {s.title}
          </h2>
          <pre
            className="p-4 rounded-md text-xs overflow-auto font-mono leading-relaxed"
            style={{
              background: PALETTE.slate[900],
              color: PALETTE.slate[100],
            }}
          >
            {s.code}
          </pre>
        </div>
      ))}

      <div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: PALETTE.navy.DEFAULT }}>
          Logo
        </h2>
        <p className="text-sm" style={{ color: PALETTE.slate[600] }}>
          File: <code className="text-xs font-mono">public/hireguard-logo.png</code>
          <br />
          Reference: <code className="text-xs font-mono">&lt;Image src="/hireguard-logo.png" /&gt;</code>
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: PALETTE.navy.DEFAULT }}>
          How to give this kit to an AI coding tool
        </h2>
        <p className="text-sm" style={{ color: PALETTE.slate[600] }}>
          Copy the contents of this <code className="font-mono text-xs">brand-kit.tsx</code> file
          into your prompt, then ask:
        </p>
        <p
          className="mt-2 text-sm italic"
          style={{ color: PALETTE.slate[700] }}
        >
          "Using the navy/gold/green palette defined in this brand kit, add a settings page
          with a sidebar nav, a form card, and a save button in the gold accent style."
        </p>
      </div>
    </div>
  );
}

export default BrandKit;
