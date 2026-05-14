import type { Metadata } from "next";
import Image from "next/image";
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
        <header className="border-b border-slate-200 bg-white shadow-sm">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/hireguard-logo.png"
                alt="HireGuard"
                width={160}
                height={44}
                className="h-10 w-auto"
                priority
              />
            </Link>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/portfolio" className="text-slate-600 hover:text-brand transition-colors">
                Portfolio
              </Link>
              <Link href="/analyze" className="text-slate-600 hover:text-brand transition-colors">
                Analyze
              </Link>
              <Link href="/about" className="text-slate-600 hover:text-brand transition-colors">
                About
              </Link>
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
