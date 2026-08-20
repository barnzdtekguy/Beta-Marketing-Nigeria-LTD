import { signIn } from './actions';
import { Logo } from '@/components/logo';
import { TechRealEstateBackdrop } from '@/components/tech-real-estate-backdrop';
import { AutoDismissError } from '@/components/auto-dismiss-error';
import { PasswordField } from '@/components/password-field';

const ERROR_COPY: Record<string, string> = {
  'not-authorized': "That account isn't on the admin list yet. Ask a superadmin to add you.",
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const errorMessage = searchParams.error
    ? ERROR_COPY[searchParams.error] ?? searchParams.error
    : null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <TechRealEstateBackdrop variant="dark" />
        <div className="relative z-10 flex items-center gap-2.5">
          <Logo variant="icon" size={26} href="/" />
          <span className="font-display font-medium tracking-tight">Beta Marketing</span>
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="font-display text-3xl leading-tight">
            Every registration traces back to someone who brought them in.
          </p>
          <p className="mt-4 text-white/50 text-sm leading-relaxed">
            Track realtors, referrals, and commissions in one place — built
            to stay legible as the network grows.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <Logo variant="icon" size={26} href="/" />
            <span className="font-display font-medium tracking-tight text-text">
              Beta Marketing
            </span>
          </div>

          <h1 className="font-display text-2xl text-text">Admin sign in</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Internal access only. Contact a superadmin if you need an invite.
          </p>

          <form action={signIn} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={searchParams.next ?? '/admin'} />

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="you@betamarketing.com"
              />
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="••••••••"
              required
            />

            <AutoDismissError message={errorMessage} />

            <button
              type="submit"
              className="w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-faint">
            Realtor? <a href="/register" className="text-brand hover:text-brand-dark">Register here</a> instead.
          </p>
        </div>
      </div>
    </div>
  );
}
