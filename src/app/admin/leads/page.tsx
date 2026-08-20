import Link from 'next/link';
import { getCurrentAdmin, getLeads } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { FiltersBar } from '@/components/filters-bar';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const PAGE_SIZE = 20;

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
  searchParams: { search?: string; status?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const search = searchParams.search ?? '';
  const status = searchParams.status ?? 'all';

  const [admin, { leads, total }] = await Promise.all([
    getCurrentAdmin(),
    getLeads({ search, status, page, pageSize: PAGE_SIZE }),
  ]);

  return (
    <>
      <Topbar title="Leads" description={`${total} client ${total === 1 ? 'lead' : 'leads'} submitted`} admin={admin} />

      <main className="p-6 md:p-8 space-y-4">
        <FiltersBar
          searchPlaceholder="Search client name, phone, or email…"
          statusOptions={[
            { value: 'all', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'successful', label: 'Successful' },
            { value: 'unsuccessful', label: 'Unsuccessful' },
          ]}
        />

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Looking for</th>
                  <th className="px-5 py-3 font-medium">Submitted by</th>
                  <th className="px-5 py-3 font-medium">Submitted</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Commission</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-black/[0.015] transition">
                    <td className="px-5 py-3">
                      <Link href={`/admin/leads/${lead.id}`} className="font-medium text-text hover:text-brand-dark">
                        {lead.client_name}
                      </Link>
                      <p className="text-xs text-text-muted">{lead.client_phone}</p>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {PROPERTY_TYPE_LABELS[lead.property_type] ?? lead.property_type}
                    </td>
                    <td className="px-5 py-3 text-text-muted">{lead.realtor?.full_name ?? '—'}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDate(lead.created_at)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {lead.commission_amount != null ? formatCurrency(lead.commission_amount) : '—'}
                    </td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-text-muted text-sm">
                      No leads match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
        </div>
      </main>
    </>
  );
}
