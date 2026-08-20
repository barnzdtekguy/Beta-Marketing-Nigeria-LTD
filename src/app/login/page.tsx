import { signIn } from './actions';
import { TechRealEstateBackdrop } from '@/components/tech-real-estate-backdrop';
import { AutoDismissError } from '@/components/auto-dismiss-error';
import { PasswordField } from '@/components/password-field';
import { Logo } from '@/components/logo';
import { AuthSubmitProvider } from '@/components/auth-submit-context';
import { SubmitOverlay } from '@/components/submit-overlay';
import { AuthSubmitButton } from '@/components/auth-submit-button';
import { TrackedForm } from '@/components/tracked-form';

const ERROR_COPY: Record<string, string> = {
  'not-authorized': "That account isn't linked to a realtor profile. Register first, or contact Beta Marketing.",
};

export default function RealtorLoginPage({
  searchParams,
}: {
  searchParams: { error?: string; next?: string };
}) {
  const errorMessage = searchParams.error
    ? ERROR_COPY[searchParams.error] ?? searchParams.error
    : null;

  return (
    <AuthSubmitProvider>
    <SubmitOverlay label="Signing you in…" />
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <TechRealEstateBackdrop variant="dark" />
        <div className="relative z-10 flex items-center gap-2.5">
          <Logo variant="icon" size={26} href="/" />
          <span className="font-display font-medium tracking-tight">Beta Marketing</span>
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="font-display text-3xl leading-tight">
            Welcome back. Your network&apos;s been busy.
          </p>
          <p className="mt-4 text-white/50 text-sm leading-relaxed">
            Sign in to see who you&apos;ve referred, what you&apos;ve earned, and
            your own link to keep sharing.
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

          <h1 className="font-display text-2xl text-text">Sign in</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            For realtors registered with Beta Marketing.
          </p>

          <TrackedForm action={signIn} className="mt-8 space-y-4">
            <input type="hidden" name="next" value={searchParams.next ?? '/dashboard'} />

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
                placeholder="jane@example.com"
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

            <AuthSubmitButton
              pendingLabel="Signing in…"
              className="w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition disabled:opacity-70"
            >
              Sign in
            </AuthSubmitButton>
          </TrackedForm>

          <p className="mt-6 text-center text-xs text-text-faint">
            New realtor? <a href="/register" className="text-brand hover:text-brand-dark">Register here</a>
          </p>
        </div>
      </div>
    </div>
    </AuthSubmitProvider>
  );
}
