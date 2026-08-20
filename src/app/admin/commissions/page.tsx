import Link from 'next/link';
import { getCurrentAdmin, getCommissionPayments, getCommissionSummary } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { FiltersBar } from '@/components/filters-bar';
import { Pagination } from '@/components/pagination';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Wallet, CheckCircle2, Clock3 } from 'lucide-react';
import { approvePayout, rejectPayout } from './actions';

const PAGE_SIZE = 20;

export default async function CommissionsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const status = searchParams.status ?? 'all';

  const [admin, summary, { payments, total }] = await Promise.all([
    getCurrentAdmin(),
    getCommissionSummary(),
    getCommissionPayments({ status, page, pageSize: PAGE_SIZE }),
  ]);

  return (
    <>
      <Topbar title="Commissions" description="Earnings and payout records" admin={admin} />

      <main className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total earned" value={formatCurrency(summary.earned)} icon={Wallet} accent="amber" />
          <StatCard label="Paid out" value={formatCurrency(summary.paid)} icon={CheckCircle2} />
          <StatCard label="Outstanding" value={formatCurrency(summary.unpaid)} icon={Clock3} accent="amber" />
        </div>

        <FiltersBar
          searchPlaceholder=""
          showSearch={false}
          statusOptions={[
            { value: 'all', label: 'All payments' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
            { value: 'failed', label: 'Failed' },
          ]}
        />

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">For</th>
                  <th className="px-5 py-3 font-medium text-right">Amount</th>
                  <th className="px-5 py-3 font-medium">Bank details</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Paid on</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-black/[0.015] transition">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${p.user?.id}`} className="font-medium text-text hover:text-brand-dark">
                        {p.user?.full_name ?? '—'}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {p.lead ? `Sale — ${p.lead.client_name}` : (p.method ?? 'Referral bonus')}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{formatCurrency(p.amount)}</td>
                    <td className="px-5 py-3 text-text-muted text-xs">
                      {p.bank_name ? (
                        <>
                          <p className="text-text">{p.account_name}</p>
                          <p>
                            {p.bank_name} · {p.account_number}
                          </p>
                        </>
                      ) : (
                        p.reference ?? '—'
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {p.paid_at ? formatDate(p.paid_at) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      {p.status === 'pending' && (
                        <div className="flex items-center justify-end gap-2">
                          <form action={approvePayout}>
                            <input type="hidden" name="payment_id" value={p.id} />
                            <button
                              type="submit"
                              className="rounded-lg bg-success text-white text-xs font-medium px-2.5 py-1.5 hover:opacity-90 transition"
                            >
                              Mark paid
                            </button>
                          </form>
                          <form action={rejectPayout}>
                            <input type="hidden" name="payment_id" value={p.id} />
                            <button
                              type="submit"
                              className="rounded-lg border border-border text-text text-xs font-medium px-2.5 py-1.5 hover:bg-black/[0.03] transition"
                            >
                              Reject
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-text-muted text-sm">
                      No payment records yet. They&apos;ll show up here once realtors start applying for
                      payouts.
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
