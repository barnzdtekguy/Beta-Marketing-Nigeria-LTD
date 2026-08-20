import { Check } from 'lucide-react';
import { ReferralLinkCard } from '@/components/referral-link-card';
import { Logo } from '@/components/logo';

export default function RegisterSuccessPage({
  searchParams,
}: {
  searchParams: { code?: string; name?: string; pending?: string };
}) {
  const code = searchParams.code ?? '';
  const name = searchParams.name ?? 'there';
  const pending = searchParams.pending === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Logo variant="icon" size={24} href="/" />
          <span className="font-display font-medium tracking-tight text-text text-sm">Beta Marketing</span>
        </div>

        <div className="mx-auto w-12 h-12 rounded-full bg-success-soft text-success flex items-center justify-center">
          <Check size={22} strokeWidth={2} />
        </div>

        <h1 className="mt-4 font-display text-xl text-text">Welcome, {name.split(' ')[0]}</h1>
        <p className="mt-1 text-sm text-text-muted">
          You&apos;re registered. Here&apos;s your own referral link to share.
        </p>

        <ReferralLinkCard code={code} />

        {pending ? (
          <>
            <div className="mt-6 rounded-lg border border-border bg-black/[0.03] px-4 py-3 text-sm text-text">
              Check your email to verify your account before signing in.
            </div>
            <p className="mt-3 text-xs text-text-faint">
              Once verified, sign in anytime at <span className="text-text-muted">/login</span> with the
              email and password you just set.
            </p>
          </>
        ) : (
          <>
            <a
              href="/dashboard"
              className="mt-6 inline-flex items-center justify-center w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition"
            >
              Go to your dashboard
            </a>
            <p className="mt-3 text-xs text-text-faint">
              You can sign back in anytime at <span className="text-text-muted">/login</span> with the
              email and password you just set.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
