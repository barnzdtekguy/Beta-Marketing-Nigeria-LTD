import { registerUser } from './actions';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Logo } from '@/components/logo';
import { TechRealEstateBackdrop } from '@/components/tech-real-estate-backdrop';
import { AutoDismissError } from '@/components/auto-dismiss-error';
import { PasswordField } from '@/components/password-field';
import { ReferralCodeToggle } from '@/components/referral-code-toggle';

async function resolveReferrer(ref: string) {
  if (!ref) return null;
  const supabase = createServiceRoleClient();

  const { data: link } = await supabase
    .from('referral_links')
    .select('owner:owner_id(full_name)')
    .eq('code', ref)
    .maybeSingle();
  if (link) return (link as any).owner?.full_name ?? null;

  const { data: user } = await supabase
    .from('users')
    .select('full_name')
    .eq('referral_code', ref)
    .maybeSingle();
  return user?.full_name ?? null;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { ref?: string; error?: string };
}) {
  const ref = searchParams.ref ?? '';
  const referrerName = await resolveReferrer(ref);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <TechRealEstateBackdrop variant="dark" />
        <div className="relative z-10 flex items-center gap-2.5">
          <Logo variant="icon" size={26} />
          <span className="font-display font-medium tracking-tight">Beta Marketing</span>
        </div>
        <div className="relative z-10 max-w-sm">
          <p className="font-display text-3xl leading-tight">
            Turn every introduction into income.
          </p>
          <p className="mt-4 text-white/50 text-sm leading-relaxed">
            Register in a minute, get your own referral link, and start
            earning commission on every client — and every realtor — you
            bring in.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <Logo variant="icon" size={26} />
            <span className="font-display font-medium tracking-tight text-text">
              Beta Marketing
            </span>
          </div>

          <h1 className="font-display text-2xl text-text">Register as a realtor</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            {referrerName ? (
              <>You were invited by <span className="font-medium text-text">{referrerName}</span>.</>
            ) : (
              "Takes about a minute — you'll get your referral link right after."
            )}
          </p>

          <form action={registerUser} className="mt-8 space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-xs font-medium text-text-muted mb-1.5">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium text-text-muted mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-medium text-text-muted mb-1.5">
                Phone (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              />
            </div>

            <PasswordField
              id="password"
              name="password"
              label="Password"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />

            <ReferralCodeToggle initialRef={ref} />

            <AutoDismissError message={searchParams.error ?? null} />

            <button
              type="submit"
              className="w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition"
            >
              Create my account
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-text-faint">
            Already registered? <a href="/login" className="text-brand hover:text-brand-dark">Sign in</a>
            {' · '}
            Staff? <a href="/admin/login" className="text-brand hover:text-brand-dark">Admin sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
