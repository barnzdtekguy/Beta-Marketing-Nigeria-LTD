import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users2, Wallet, Clock, UserPlus } from 'lucide-react';
import {
  getCurrentRealtor,
  getRealtorStats,
  getRealtorDirectReferrals,
  getRealtorOverrideEarnings,
  getRealtorLeads,
  getDownlineSalesActivity,
  getAnnouncements,
} from '@/lib/realtor-queries';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { ReferralLinkCard } from '@/components/referral-link-card';
import { AnnouncementList } from '@/components/announcement-banner';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  land: 'land',
  house: 'a house',
  apartment: 'an apartment',
  commercial: 'a commercial property',
  other: 'a property',
};

export default async function RealtorDashboardPage() {
  const realtor = await getCurrentRealtor();
  if (!realtor) redirect('/login');

  const [stats, directReferrals, overrideEarnings, leads, downlineActivity, announcements] =
    await Promise.all([
      getRealtorStats(realtor.id),
      getRealtorDirectReferrals(realtor.id),
      getRealtorOverrideEarnings(realtor.id),
      getRealtorLeads(realtor.id),
      getDownlineSalesActivity(realtor.id),
      getAnnouncements(5),
    ]);

  return (
    <main className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-text">
            Welcome back, {realtor.full_name.split(' ')[0]}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">Here&apos;s how your referrals are doing.</p>
        </div>
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 rounded-lg bg-brand text-white text-sm font-medium px-4 py-2.5 hover:bg-brand-dark transition"
        >
          <UserPlus size={15} strokeWidth={1.8} />
          Submit a client
        </Link>
      </div>

      {announcements.length > 0 && <AnnouncementList announcements={announcements} />}

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
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-display text-sm text-text">Your client sales</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Clients you&apos;ve submitted directly, and the outcome once admin decides.
            </p>
          </div>
          <Link href="/dashboard/leads" className="text-xs text-brand hover:text-brand-dark shrink-0">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Commission</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 font-medium text-text">{lead.client_name}</td>
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
                  </td>
                </tr>
              ))}

              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-text-muted text-sm">
                    Submit a client above to start tracking a sale.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {downlineActivity.length > 0 && (
        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-display text-sm text-text">Your network&apos;s sales activity</h2>
          </div>
          <ul className="divide-y divide-border">
            {downlineActivity.map((a: any) => (
              <li key={a.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-text">
                    <span className="font-medium">{a.realtor?.full_name ?? 'Your referral'}</span> has
                    made a sale
                    {a.lead?.property_type ? ` — ${PROPERTY_TYPE_LABELS[a.lead.property_type] ?? ''}` : ''}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">{formatDateTime(a.created_at)}</p>
                </div>
                <StatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        </div>
      )}

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
    </main>
  );
}
