import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

export const metadata: Metadata = {
  title: "HireGuard — Alberta Employment Contract Triage",
  description:
    "Alberta employment-contract triage in 60 seconds. Citation-backed risk scoring for SME employers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <DisclaimerBanner />
        <header className="border-b border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-brand-dark">
              HireGuard
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/portfolio" className="hover:text-brand">Portfolio</Link>
              <Link href="/analyze" className="hover:text-brand">Analyze</Link>
              <Link href="/about" className="hover:text-brand">About</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white mt-12">
          <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-500">
            HireGuard — ENTI 633 student project, Haskayne School of Business, University of Calgary.
          </div>
        </footer>
      </body>
    </html>
  );
}
