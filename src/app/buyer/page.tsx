import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Logo } from '@/components/logo';
import { TechRealEstateBackdrop } from '@/components/tech-real-estate-backdrop';
import { InquiryForm } from '@/components/inquiry-form';

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

export default async function BuyerPage({
  searchParams,
}: {
  searchParams: { ref?: string; inquiry?: string; inquiry_error?: string };
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
            Find a home that actually fits your life.
          </p>
          <p className="mt-4 text-white/50 text-sm leading-relaxed">
            Tell us what you&apos;re looking for — a realtor from our network
            will follow up with properties that match.
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

          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-4 transition">
            <ArrowLeft size={13} /> Back home
          </Link>

          <InquiryForm
            type="buyer"
            refCode={ref}
            referrerName={referrerName}
            success={searchParams.inquiry === 'success'}
            error={searchParams.inquiry_error ?? null}
          />

          <p className="mt-6 text-center text-xs text-text-faint">
            Looking to invest instead? <a href={`/investor${ref ? `?ref=${ref}` : ''}`} className="text-brand hover:text-brand-dark">Go to the investor form</a>
          </p>
        </div>
      </div>
    </div>
  );
}
