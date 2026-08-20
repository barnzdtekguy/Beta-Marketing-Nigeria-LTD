import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentRealtor, getRealtorLeads } from '@/lib/realtor-queries';
import { StatusBadge } from '@/components/status-badge';
import { FlashMessage } from '@/components/flash-message';
import { formatCurrency, formatDate } from '@/lib/utils';
import { submitLead } from './actions';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  land: 'Land',
  house: 'House',
  apartment: 'Apartment / Flat',
  commercial: 'Commercial property',
  other: 'Other',
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: { error?: string; success?: string };
}) {
  const realtor = await getCurrentRealtor();
  if (!realtor) redirect('/login');

  const leads = await getRealtorLeads(realtor!.id);

  return (
    <main className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-card">
        <h1 className="font-display text-xl text-text">Submit a client</h1>
        <p className="mt-1 text-sm text-text-muted">
          Tell us about a client interested in buying from Beta Properties. We&apos;ll take it from
          there — you&apos;ll see the outcome here once it&apos;s decided.
        </p>

        <form action={submitLead} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="client_name" className="block text-xs font-medium text-text-muted mb-1.5">
                Client name
              </label>
              <input
                id="client_name"
                name="client_name"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="client_phone" className="block text-xs font-medium text-text-muted mb-1.5">
                Client phone
              </label>
              <input
                id="client_phone"
                name="client_phone"
                type="tel"
                required
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="0803 000 0000"
              />
            </div>
          </div>

          <div>
            <label htmlFor="client_email" className="block text-xs font-medium text-text-muted mb-1.5">
              Client email <span className="text-text-faint">(optional)</span>
            </label>
            <input
              id="client_email"
              name="client_email"
              type="email"
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              placeholder="jane@example.com"
            />
          </div>

          <div>
            <label htmlFor="property_type" className="block text-xs font-medium text-text-muted mb-1.5">
              What are they looking to buy?
            </label>
            <select
              id="property_type"
              name="property_type"
              required
              defaultValue=""
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
            >
              <option value="" disabled>
                Select property type…
              </option>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="property_details" className="block text-xs font-medium text-text-muted mb-1.5">
              More details <span className="text-text-faint">(optional)</span>
            </label>
            <textarea
              id="property_details"
              name="property_details"
              rows={3}
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
              placeholder="Location, budget, timeline…"
            />
          </div>

          <FlashMessage error={searchParams?.error ?? null} success={searchParams?.success ?? null} />

          <button
            type="submit"
            className="w-full rounded-lg bg-brand text-white text-sm font-medium py-2.5 hover:bg-brand-dark transition"
          >
            Submit client
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display text-sm text-text">Your submitted clients</h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Looking for</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Commission</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-medium text-text">{lead.client_name}</p>
                    <p className="text-xs text-text-muted">{lead.client_phone}</p>
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    {PROPERTY_TYPE_LABELS[lead.property_type] ?? lead.property_type}
                  </td>
                  <td className="px-5 py-3 text-text-muted">{formatDate(lead.created_at)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {lead.commission_amount != null ? formatCurrency(lead.commission_amount) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {lead.status === 'successful' && (
                      <Link
                        href={`/dashboard/payout/${lead.id}`}
                        className="inline-flex items-center rounded-lg bg-ink text-white text-xs font-medium px-3 py-1.5 hover:bg-ink-soft transition"
                      >
                        Apply for commission
                      </Link>
                    )}
                    {lead.status === 'unsuccessful' && (
                      <span className="text-xs text-text-faint">Client did not buy</span>
                    )}
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-muted text-sm">
                    You haven&apos;t submitted any clients yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
