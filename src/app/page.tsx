import { createServiceRoleClient } from '@/lib/supabase/server';
import { Logo } from '@/components/logo';
import { TechRealEstateBackdrop } from '@/components/tech-real-estate-backdrop';
import { Referral3DIcon } from '@/components/referral-3d-icon';
import { IPhoneDashboardMockup } from '@/components/iphone-mockup';
import { ScrollReveal } from '@/components/scroll-reveal';
import { MobileNav } from '@/components/mobile-nav';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPinned,
  ShieldCheck,
  Share2,
  Wallet,
} from 'lucide-react';

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

const HOW_IT_WORKS = [
  {
    icon: MapPinned,
    title: 'Share your referral link',
    text: 'Create your Beta Marketing account and receive a referral link you can share with clients and other realtors.',
  },
  {
    icon: Share2,
    title: 'Bring in qualified leads',
    text: 'Every registration and every referred realtor is tracked to the correct source, so attribution stays accurate and transparent.',
  },
  {
    icon: Wallet,
    title: 'Track commissions automatically',
    text: 'The platform logs referral levels, payout status, and network growth so your earnings remain clear and easy to monitor.',
  },
];

const BENEFITS = [
  {
    icon: Building2,
    title: 'Built for realtor pipelines',
    body: 'Create a repeatable acquisition engine for clients and partner agents without losing visibility in the process.',
  },
  {
    icon: ShieldCheck,
    title: 'Clear attribution',
    body: 'Know exactly who brought in each referral and how the commission chain is being credited across the network.',
  },
  {
    icon: CheckCircle2,
    title: 'Operational clarity',
    body: 'Keep your team aligned with live performance data, status tracking, and simple dashboards built for speed.',
  },
];

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#benefits', label: 'Benefits' },
  { href: '#contact', label: 'Contact' },
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref ?? '';
  const referrerName = await resolveReferrer(ref);
  const registerHref = ref ? `/register?ref=${encodeURIComponent(ref)}` : '/register';

  return (
    <div className="min-h-screen bg-paper text-text">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="#top" className="flex items-center gap-3">
            <Logo variant="icon" size={28} />
            <div>
              <p className="font-display text-lg tracking-tight text-text">Beta Marketing</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-text-faint">Referral Network</p>
            </div>
          </a>

          <nav className="hidden items-center gap-8 text-sm text-text-muted md:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition hover:text-text">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="text-sm font-medium text-text-muted transition hover:text-text">
              Sign in
            </a>
            <a
              href={registerHref}
              className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-dark"
            >
              Get started
              <ArrowRight size={15} />
            </a>
          </div>

          <MobileNav links={NAV_LINKS} registerHref={registerHref} />
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-border bg-ink px-6 py-10 text-white shadow-panel sm:px-8 lg:px-12 lg:py-14">
          <TechRealEstateBackdrop variant="dark" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-fade-up">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/75">
                Realty growth engine
              </div>

              <h1 className="max-w-xl font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
                Turn every introduction into a measurable revenue channel.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
                Beta Marketing helps realtors capture referrals, track who brought them in, and monitor commissions without the spreadsheets or guesswork.
                {referrerName && (
                  <> You were invited by <span className="font-medium text-white">{referrerName}</span>.</>
                )}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href={registerHref}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-medium text-white transition hover:bg-brand-dark"
                >
                  Register now
                  <ArrowRight size={16} />
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Existing account
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
                <div>
                  <span className="block text-2xl font-semibold text-white">3x</span>
                  Faster referral visibility
                </div>
                <div>
                  <span className="block text-2xl font-semibold text-white">24/7</span>
                  Transparent commission tracking
                </div>
                <div>
                  <span className="block text-2xl font-semibold text-white">1</span>
                  Unified partner network
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center justify-center">
              <Referral3DIcon className="w-full max-w-[320px]" />
            </div>
          </div>
        </section>

        <ScrollReveal className="mt-20">
          <section className="relative overflow-hidden rounded-[32px] border border-border bg-gradient-to-b from-white to-brand/5 px-6 py-14 text-center shadow-panel sm:px-8 lg:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">Step one</p>
            <h2 className="mx-auto mt-3 max-w-xl font-display text-3xl text-text sm:text-4xl">
              Share your referral link
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-text-muted">
              Create your Beta Marketing account and receive a referral link you can share with
              clients and other realtors.
            </p>

            <div className="mt-12">
              <IPhoneDashboardMockup />
            </div>

            <div className="mt-10">
              <a
                href={registerHref}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark"
              >
                Get started
                <ArrowRight size={16} />
              </a>
            </div>
          </section>
        </ScrollReveal>

        <section id="how-it-works" className="mt-20">
          <ScrollReveal className="mb-8 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">How it works</p>
            <h2 className="mt-3 font-display text-3xl text-text sm:text-4xl">A smarter way to manage your referral network.</h2>
          </ScrollReveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, title, text }, index) => (
              <ScrollReveal key={title} delay={index * 120} className="h-full">
                <div
                  className={`animate-float h-full rounded-2xl border border-border bg-white p-6 shadow-panel ${index % 2 === 0 ? 'delay-0' : 'animate-float-delayed'}`}
                  style={{ animationDelay: `${index * 0.35}s` }}
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold text-text">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-muted">{text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <section id="benefits" className="mt-20">
          <ScrollReveal className="mb-8 max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">Why teams choose Beta</p>
            <h2 className="mt-3 font-display text-3xl text-text sm:text-4xl">Designed like a real estate operations platform, not a basic CRM.</h2>
          </ScrollReveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, body }, index) => (
              <ScrollReveal key={title} delay={index * 120} className="h-full">
                <div className="h-full rounded-2xl border border-border bg-card p-6 shadow-panel">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-lg font-semibold text-text">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-text-muted">{body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ScrollReveal className="mt-20">
          <section className="animate-shimmer relative overflow-hidden rounded-[28px] border border-border bg-gradient-to-br from-white to-brand/5 bg-[length:200%_100%] p-6 shadow-panel sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-brand">Built for business momentum</p>
                <h2 className="mt-3 font-display text-3xl text-text sm:text-4xl">From link sharing to payout visibility, one clear and connected system.</h2>
              </div>

              <div className="space-y-4 rounded-2xl border border-border bg-white p-5">
                <div className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5">
                  <CheckCircle2 className="text-brand shrink-0" size={18} />
                  <span className="text-sm text-text">Referral links and attribution are tracked automatically</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5">
                  <CheckCircle2 className="text-brand shrink-0" size={18} />
                  <span className="text-sm text-text">Commissions are organized by level and status</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5">
                  <CheckCircle2 className="text-brand shrink-0" size={18} />
                  <span className="text-sm text-text">Admins can review performance through a clear operations view</span>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <footer id="contact" className="border-t border-border bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <Logo variant="icon" size={28} href="/" />
              <span className="font-display text-xl tracking-tight">Beta Marketing</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
              A tech-enabled referral ecosystem for real estate professionals, built to turn network growth into measurable business performance.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Quick links</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><a href="#how-it-works" className="transition hover:text-white">How it works</a></li>
              <li><a href="#benefits" className="transition hover:text-white">Benefits</a></li>
              <li><a href="/login" className="transition hover:text-white">Sign in</a></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/55">Company</p>
            <ul className="mt-4 space-y-3 text-sm text-white/75">
              <li><a href={registerHref} className="transition hover:text-white">Register</a></li>
              <li><a href="/admin/login" className="transition hover:text-white">Admin portal</a></li>
              <li><a href="mailto:hello@betamarketing.com" className="transition hover:text-white">hello@betamarketing.com</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 text-xs text-white/55 sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} Beta Marketing Nigeria Limited</p>
            <p>Built for smarter referrals</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
