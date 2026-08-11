import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getCurrentAdmin, getUserById } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { StatusBadge } from '@/components/status-badge';
import { StatCard } from '@/components/stat-card';
import { formatCurrency, formatDate, initials } from '@/lib/utils';
import { Users2, CheckCircle2, Wallet, Clock } from 'lucide-react';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const admin = await getCurrentAdmin();

  let result;
  try {
    result = await getUserById(params.id);
  } catch {
    notFound();
  }
  const { user, referrals, overrideEarnings, stats } = result!;
  if (!user) notFound();

  return (
    <>
      <Topbar title={user.full_name} description={user.email} admin={admin} />

      <main className="p-6 md:p-8 space-y-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition"
        >
          <ArrowLeft size={14} /> Back to users
        </Link>

        <div className="bg-card border border-border rounded-xl p-5 shadow-card flex flex-wrap items-center gap-5">
          <div className="w-12 h-12 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center font-display text-sm">
            {initials(user.full_name)}
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="font-display text-lg text-text">{user.full_name}</p>
            <p className="text-sm text-text-muted">{user.email}</p>
          </div>
          <Detail label="Phone" value={user.phone ?? '—'} />
          <Detail
            label="Referral code"
            value={<code className="font-mono text-xs bg-black/[0.03] px-1.5 py-0.5 rounded">{user.referral_code}</code>}
          />
          <Detail label="Referred by" value={(user as any).referrer?.full_name ?? '—'} />
          <Detail label="Registered" value={formatDate(user.created_at)} />
          <StatusBadge status={user.status} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="People referred" value={String(stats.completed_referrals)} icon={Users2} />
          <StatCard label="Pending referrals" value={String(stats.pending_referrals)} icon={Clock} />
          <StatCard
            label="Commission earned"
            value={formatCurrency(stats.commission_earned)}
            icon={Wallet}
            accent="amber"
          />
          <StatCard
            label="Unpaid commission"
            value={formatCurrency(stats.commission_unpaid)}
            icon={CheckCircle2}
            accent="amber"
          />
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-display text-sm text-text">People they&apos;ve referred</h2>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Referred user</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 font-medium">Referral status</th>
                  <th className="px-5 py-3 font-medium text-right">Commission</th>
                  <th className="px-5 py-3 font-medium">Payout status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r: any) => (
                  <tr key={r.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      {r.referred_user ? (
                        <Link href={`/admin/users/${r.referred_user.id}`} className="font-medium text-text hover:text-brand-dark">
                          {r.referred_user.full_name}
                        </Link>
                      ) : (
                        <span className="text-text-muted">Pending signup</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {r.referred_user ? formatDate(r.referred_user.created_at) : '—'}
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
                  </tr>
                ))}

                {referrals.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-text-muted text-sm">
                      This user hasn&apos;t referred anyone yet.
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
              <h2 className="font-display text-sm text-text">Earnings from their network</h2>
              <p className="text-xs text-text-muted mt-0.5">
                Commission from people referred by someone {user.full_name} brought in — not direct
                referrals of their own.
              </p>
            </div>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-text-muted">
                    <th className="px-5 py-3 font-medium">Person who joined</th>
                    <th className="px-5 py-3 font-medium">Brought in by</th>
                    <th className="px-5 py-3 font-medium">Level</th>
                    <th className="px-5 py-3 font-medium text-right">Commission</th>
                    <th className="px-5 py-3 font-medium">Payout status</th>
                  </tr>
                </thead>
                <tbody>
                  {overrideEarnings.map((r: any) => (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        {r.referred_user ? (
                          <Link
                            href={`/admin/users/${r.referred_user.id}`}
                            className="font-medium text-text hover:text-brand-dark"
                          >
                            {r.referred_user.full_name}
                          </Link>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-text-muted">
                        {r.referred_user?.referred_via ? (
                          <Link
                            href={`/admin/users/${r.referred_user.referred_via.id}`}
                            className="hover:text-brand-dark"
                          >
                            {r.referred_user.referred_via.full_name}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-soft text-amber">
                          L{r.level}
                        </span>
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
    </>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-[110px]">
      <p className="text-xs text-text-muted">{label}</p>
      <p className="text-sm text-text mt-0.5">{value}</p>
    </div>
  );
}
