'use client';

import { useEffect, useState } from 'react';

export function ReferralCodeToggle({ initialRef }: { initialRef?: string }) {
  const [hasReferralCode, setHasReferralCode] = useState(Boolean(initialRef));
  const [referralCode, setReferralCode] = useState(initialRef ?? '');

  useEffect(() => {
    if (!hasReferralCode) {
      setReferralCode('');
    }
  }, [hasReferralCode]);

  return (
    <div className="space-y-3">
      <button
        type="button"
        aria-pressed={hasReferralCode}
        onClick={() => setHasReferralCode((value) => !value)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-white px-3 py-2.5 text-left text-sm text-text transition hover:border-brand/60"
      >
        <span className="font-medium">I have a referral code</span>
        <span
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            hasReferralCode ? 'bg-brand' : 'bg-black/15'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition ${
              hasReferralCode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </span>
      </button>

      {hasReferralCode && (
        <div>
          <label htmlFor="referral_code" className="block text-xs font-medium text-text-muted mb-1.5">
            Referral code
          </label>
          <input
            id="referral_code"
            name="referral_code"
            type="text"
            value={referralCode}
            onChange={(event) => setReferralCode(event.target.value.trim())}
            placeholder="Enter your referral code"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
          />
        </div>
      )}

      <input type="hidden" name="ref" value={referralCode} />
    </div>
  );
}
