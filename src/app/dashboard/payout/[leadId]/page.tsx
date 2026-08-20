import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentRealtor } from '@/lib/realtor-queries';
import { BankSelect } from '@/components/bank-select';
import { FlashMessage } from '@/components/flash-message';
import { formatCurrency } from '@/lib/utils';
import { applyForPayout } from '../actions';

export default async function ApplyForPayoutPage({
  params,
  searchParams,
}: {
  params: { leadId: string };
  searchParams?: { error?: string };
}) {
  const realtor = await getCurrentRealtor();
  if (!realtor) redirect('/login');

  const supabase = createClient();
  const { data: lead } = await supabase
    .from('client_leads')
    .select('id, client_name, status, commission_amount, realtor_id')
    .eq('id', params.leadId)
    .maybeSingle();

  if (!lead || lead.realtor_id !== realtor!.id) notFound();

  if (lead.status !== 'successful') {
    redirect(`/dashboard/leads?error=${encodeURIComponent("That sale isn't available for payout.")}`);
  }

  const { data: existing } = await supabase
    .from('commission_payments')
    .select('id, status')
    .eq('lead_id', lead.id)
    .maybeSingle();

  return (
    <main className="p-6 md:p-8 max-w-lg mx-auto space-y-4">
      <Link
        href="/dashboard/leads"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition"
      >
        <ArrowLeft size={14} /> Back to your clients
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h1 className="font-display text-xl text-text">Apply for commission</h1>
        <p className="mt-1 text-sm text-text-muted">
          For the sale to <span className="font-medium text-text">{lead.client_name}</span> —{' '}
          <span className="font-medium text-text">{formatCurrency(lead.commission_amount ?? 0)}</span>{' '}
          commission.
        </p>

        {existing ? (
          <div className="mt-6 rounded-lg border border-border bg-black/[0.03] px-4 py-3 text-sm text-text-muted">
            You&apos;ve already applied for this commission — status:{' '}
            <span className="font-medium text-text capitalize">{existing.status}</span>.
          </div>
        ) : (
          <form action={applyForPayout} className="mt-6 space-y-4">
            <input type="hidden" name="lead_id" value={lead.id} />

            <div>
              <label htmlFor="account_name" className="block text-xs font-medium text-text-muted mb-1.5">
                Account name
              </label>
              <input
                id="account_name"
                name="account_name"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="Name on the account"
              />
            </div>

            <div>
              <label htmlFor="account_number" className="block text-xs font-medium text-text-muted mb-1.5">
                Account number
              </label>
              <input
                id="account_number"
                name="account_number"
                type="text"
                inputMode="numeric"
                required
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="0123456789"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Bank</label>
              <BankSelect />
            </div>

            <FlashMessage error={searchParams?.error ?? null} />

            <button
              type="submit"
              className="w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition"
            >
              Apply for payout
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
