import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function RegisterPendingPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email ?? '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Logo variant="icon" size={24} href="/" />
          <span className="font-display font-medium tracking-tight text-text text-sm">Beta Marketing</span>
        </div>

        <div className="mx-auto w-12 h-12 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center">
          <Mail size={22} strokeWidth={2} />
        </div>

        <h1 className="mt-4 font-display text-xl text-text">Check your email</h1>
        <p className="mt-2 text-sm text-text-muted">
          We sent a confirmation link
          {email && (
            <>
              {' '}
              to <span className="font-medium text-text">{email}</span>
            </>
          )}
          . Click it to activate your account — then you can sign in.
        </p>

        <p className="mt-6 text-xs text-text-faint">
          Didn&apos;t get it?{' '}
          <Link href="/register" className="text-brand hover:text-brand-dark">
            Try again
          </Link>
        </p>
      </div>
    </div>
  );
}
