import { Users, Link2, Share2, Wallet } from 'lucide-react';
import { Topbar } from '@/components/topbar';
import { StatCard } from '@/components/stat-card';
import { RegistrationsChart } from '@/components/charts/registrations-chart';
import { getCurrentAdmin, getOverviewStats, getRegistrationsOverTime } from '@/lib/queries';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default async function OverviewPage() {
  const [admin, stats, series] = await Promise.all([
    getCurrentAdmin(),
    getOverviewStats(),
    getRegistrationsOverTime(30),
  ]);

  return (
    <>
      <Topbar
        title="Overview"
        description="How the referral program is trending right now"
        admin={admin}
      />

      <main className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Registered users" value={formatNumber(stats.totalUsers)} icon={Users} />
          <StatCard label="Referral links generated" value={formatNumber(stats.totalLinks)} icon={Link2} />
          <StatCard
            label="Completed referrals"
            value={formatNumber(stats.completedReferrals)}
            icon={Share2}
          />
          <StatCard
            label="Commission earned"
            value={formatCurrency(stats.totalCommission)}
            icon={Wallet}
            accent="amber"
          />
        </div>

        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-sm text-text">Registrations, last 30 days</h2>
          </div>
          <RegistrationsChart data={series} />
        </div>
      </main>
    </>
  );
}
