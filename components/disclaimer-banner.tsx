import { DISCLAIMER } from "@/lib/constants";

export function DisclaimerBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
      <div className="max-w-6xl mx-auto px-6 py-2">
        <span className="font-semibold">Not legal advice. </span>
        <span>{DISCLAIMER}</span>
      </div>
    </div>
  );
}
