'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function ReferralLinkCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    setShareUrl(`${window.location.origin}/?ref=${code}`);
  }, [code]);

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="mt-6 bg-card border border-border rounded-xl shadow-card p-4 text-left">
      <p className="text-xs text-text-muted mb-1.5">Your referral code</p>
      <code className="block font-mono text-sm bg-black/[0.03] px-3 py-2 rounded-lg">{code}</code>

      <p className="text-xs text-text-muted mt-4 mb-1.5">Your referral link</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={shareUrl}
          className="flex-1 min-w-0 rounded-lg border border-border bg-white px-3 py-2 text-xs text-text-muted truncate"
        />
        <button
          onClick={copyLink}
          className="shrink-0 flex items-center gap-1.5 rounded-lg bg-ink text-white text-xs font-medium px-3 py-2 hover:bg-ink-soft transition"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
