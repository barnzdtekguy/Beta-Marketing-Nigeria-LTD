import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users2, Wallet, Clock } from 'lucide-react';
import {
  getCurrentRealtor,
  getRealtorStats,
  getRealtorDirectReferrals,
  getRealtorOverrideEarnings,
  getRealtorInquiries,
} from '@/lib/realtor-queries';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { ReferralLinkCard } from '@/components/referral-link-card';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function RealtorDashboardPage() {
  const realtor = await getCurrentRealtor();
  if (!realtor) redirect('/login');

  const [stats, directReferrals, overrideEarnings, inquiries] = await Promise.all([
    getRealtorStats(realtor.id),
    getRealtorDirectReferrals(realtor.id),
    getRealtorOverrideEarnings(realtor.id),
    getRealtorInquiries(realtor.id),
  ]);

  return (
    <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-xl text-text">
          Welcome back, {realtor.full_name.split(' ')[0]}
        </h1>
        <p className="text-sm text-text-muted mt-0.5">Here&apos;s how your referrals are doing.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard label="People you've referred" value={String(stats.completed_referrals)} icon={Users2} />
        <StatCard
          label="Commission earned"
          value={formatCurrency(stats.commission_earned)}
          icon={Wallet}
          accent="amber"
        />
        <StatCard
          label="Unpaid"
          value={formatCurrency(stats.commission_unpaid)}
          icon={Clock}
          accent="amber"
        />
      </div>

      <ReferralLinkCard code={realtor.referral_code} />

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display text-sm text-text">People you&apos;ve referred</h2>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Commission</th>
                <th className="px-5 py-3 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody>
              {directReferrals.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-text">
                    {r.referred_user?.full_name ?? 'Pending signup'}
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    {r.referred_user ? formatDate(r.referred_user.created_at) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">{formatCurrency(r.commission_amount)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.commission_status} />
                  </td>
                </tr>
              ))}

              {directReferrals.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-text-muted text-sm">
                    Share your link above — anyone who registers through it shows up here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {overrideEarnings.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-display text-sm text-text">Earnings from your network</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Commission from people referred by someone you brought in — not your own direct
              referrals.
            </p>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Person who joined</th>
                  <th className="px-5 py-3 font-medium">Brought in by</th>
                  <th className="px-5 py-3 font-medium text-right">Commission</th>
                  <th className="px-5 py-3 font-medium">Payout</th>
                </tr>
              </thead>
              <tbody>
                {overrideEarnings.map((r: any) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 font-medium text-text">
                      {r.referred_user?.full_name ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {r.referred_user?.referred_via?.full_name ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatCurrency(r.commission_amount)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={r.commission_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="font-display text-sm text-text">Buyer and investor inquiry pipeline</h2>
          <p className="text-xs text-text-muted mt-0.5">
            The commission percentage is only unlocked once the referred buyer or investor completes a transaction.
          </p>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Need</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry: any) => (
                <tr key={inquiry.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-text">{inquiry.full_name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        inquiry.inquiry_type === 'investor'
                          ? 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand-dark capitalize'
                          : 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 capitalize'
                      }
                    >
                      {inquiry.inquiry_type ?? 'buyer'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-text-muted">
                    <div>{inquiry.email}</div>
                    <div>{inquiry.phone}</div>
                  </td>
                  <td className="px-5 py-3 text-text-muted max-w-xs whitespace-pre-wrap">{inquiry.request_details}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={inquiry.transaction_completed_at ? 'closed' : inquiry.status} />
                    {!inquiry.transaction_completed_at && (
                      <div className="mt-2 text-[11px] text-text-muted">Awaiting transaction completion</div>
                    )}
                  </td>
                </tr>
              ))}

              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-text-muted text-sm">
                    No buyer or investor inquiries have been attributed to you yet.
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
