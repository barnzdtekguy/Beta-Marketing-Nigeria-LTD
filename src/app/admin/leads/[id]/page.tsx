import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentAdmin, getLeadById } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { StatusBadge } from '@/components/status-badge';
import { FlashMessage } from '@/components/flash-message';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { markLeadSuccessful, markLeadUnsuccessful } from '../actions';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  land: 'Land',
  house: 'House',
  apartment: 'Apartment / Flat',
  commercial: 'Commercial property',
  other: 'Other',
};

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { error?: string; success?: string };
}) {
  const admin = await getCurrentAdmin();

  let lead;
  try {
    lead = await getLeadById(params.id);
  } catch {
    notFound();
  }
  if (!lead) notFound();

  return (
    <>
      <Topbar title={lead.client_name} description="Client lead" admin={admin} />

      <main className="p-6 md:p-8 space-y-6 max-w-2xl">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition"
        >
          <ArrowLeft size={14} /> Back to leads
        </Link>

        <div className="bg-card border border-border rounded-xl p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg text-text">{lead.client_name}</h2>
            <StatusBadge status={lead.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <Detail label="Phone" value={lead.client_phone} />
            <Detail label="Email" value={lead.client_email ?? '—'} />
            <Detail label="Looking for" value={PROPERTY_TYPE_LABELS[lead.property_type] ?? lead.property_type} />
            <Detail label="Submitted" value={formatDateTime(lead.created_at)} />
            <Detail label="Submitted by" value={lead.realtor?.full_name ?? '—'} />
            <Detail label="Realtor contact" value={lead.realtor?.phone ?? lead.realtor?.email ?? '—'} />
          </div>

          {lead.property_details && (
            <div>
              <p className="text-xs text-text-muted mb-1">Details</p>
              <p className="text-sm text-text whitespace-pre-line">{lead.property_details}</p>
            </div>
          )}

          {lead.status !== 'pending' && (
            <div className="rounded-lg bg-black/[0.03] px-4 py-3 text-sm">
              <p className="text-text-muted">
                Decided {lead.decided_at ? formatDateTime(lead.decided_at) : ''}
                {lead.status === 'successful' && lead.commission_amount != null && (
                  <> — commission set at <span className="font-medium text-text">{formatCurrency(lead.commission_amount)}</span></>
                )}
              </p>
              {lead.admin_notes && <p className="mt-1 text-text">{lead.admin_notes}</p>}
            </div>
          )}
        </div>

        <FlashMessage error={searchParams?.error ?? null} success={searchParams?.success ?? null} />

        {lead.status === 'pending' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <form action={markLeadSuccessful} className="bg-card border border-border rounded-xl p-5 shadow-card space-y-3">
              <input type="hidden" name="lead_id" value={lead.id} />
              <h3 className="font-display text-sm text-text">Mark sale successful</h3>
              <div>
                <label htmlFor="commission_amount" className="block text-xs font-medium text-text-muted mb-1.5">
                  Commission amount
                </label>
                <input
                  id="commission_amount"
                  name="commission_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="admin_notes_success" className="block text-xs font-medium text-text-muted mb-1.5">
                  Notes <span className="text-text-faint">(optional)</span>
                </label>
                <textarea
                  id="admin_notes_success"
                  name="admin_notes"
                  rows={2}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-success text-white text-sm font-medium py-2.5 hover:opacity-90 transition"
              >
                Mark successful
              </button>
            </form>

            <form action={markLeadUnsuccessful} className="bg-card border border-border rounded-xl p-5 shadow-card space-y-3">
              <input type="hidden" name="lead_id" value={lead.id} />
              <h3 className="font-display text-sm text-text">Mark sale unsuccessful</h3>
              <div>
                <label htmlFor="admin_notes_fail" className="block text-xs font-medium text-text-muted mb-1.5">
                  Reason <span className="text-text-faint">(optional)</span>
                </label>
                <textarea
                  id="admin_notes_fail"
                  name="admin_notes"
                  rows={2}
                  className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg border border-border text-text text-sm font-medium py-2.5 hover:bg-black/[0.03] transition"
              >
                Mark unsuccessful
              </button>
            </form>
          </div>
        )}
      </main>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm text-text mt-0.5">{value}</p>
    </div>
  );
}
