import Link from 'next/link';
import { getCurrentAdmin, getReferrals } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { FiltersBar } from '@/components/filters-bar';
import { Pagination } from '@/components/pagination';
import { ExportButton } from '@/components/export-button';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { Link2, CheckCircle2, Clock3 } from 'lucide-react';

const PAGE_SIZE = 20;

export default async function ReferralsPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; level?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const search = searchParams.search ?? '';
  const status = searchParams.status ?? 'all';
  const level = searchParams.level ?? 'all';

  const [admin, { referrals, total, totalLinks }] = await Promise.all([
    getCurrentAdmin(),
    getReferrals({ search, status, level, page, pageSize: PAGE_SIZE }),
  ]);

  const completed = referrals.filter((r) => r.status === 'completed').length;
  const pending = referrals.filter((r) => r.status === 'pending').length;
  const exportQuery = new URLSearchParams({ status, level }).toString();

  return (
    <>
      <Topbar
        title="Referrals"
        description="Issued links and the referrals they've produced"
        admin={admin}
        actions={<ExportButton filenameBase="referrals" fetchUrl={`/api/export/referrals?${exportQuery}`} />}
      />

      <main className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Links issued" value={formatNumber(totalLinks)} icon={Link2} />
          <StatCard label="Completed on this page" value={String(completed)} icon={CheckCircle2} />
          <StatCard label="Pending on this page" value={String(pending)} icon={Clock3} accent="amber" />
        </div>

        <FiltersBar
          searchPlaceholder="Search by referrer or referred name…"
          statusOptions={[
            { value: 'all', label: 'All statuses' },
            { value: 'completed', label: 'Completed' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          secondaryFilter={{
            paramKey: 'level',
            options: [
              { value: 'all', label: 'Direct + override' },
              { value: 'direct', label: 'Direct only' },
              { value: 'override', label: 'Override only' },
            ],
          }}
        />

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Referrer</th>
                  <th className="px-5 py-3 font-medium">Referred user</th>
                  <th className="px-5 py-3 font-medium">Level</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Commission</th>
                  <th className="px-5 py-3 font-medium">Payout</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-black/[0.015] transition">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${r.referrer_id}`} className="font-medium text-text hover:text-brand-dark">
                        {r.referrer_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {r.referred_user_name ?? 'Pending signup'}
                    </td>
                    <td className="px-5 py-3">
                      {r.level === 1 ? (
                        <span className="text-xs text-text-muted">Direct</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-soft text-amber">
                          Override · L{r.level}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCurrency(r.commission_amount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.commission_status} />
                    </td>
                    <td className="px-5 py-3 text-text-muted">{formatDate(r.created_at)}</td>
                  </tr>
                ))}

                {referrals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-muted text-sm">
                      No referrals match these filters.
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
