import Link from 'next/link';
import { getCurrentAdmin, getUsers } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { FiltersBar } from '@/components/filters-bar';
import { Pagination } from '@/components/pagination';
import { ExportButton } from '@/components/export-button';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/utils';

const PAGE_SIZE = 20;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string; page?: string; sort?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;
  const search = searchParams.search ?? '';
  const status = searchParams.status ?? 'all';

  const [admin, { users, total }] = await Promise.all([
    getCurrentAdmin(),
    getUsers({ search, status, page, pageSize: PAGE_SIZE, sort: (searchParams.sort as any) ?? 'newest' }),
  ]);

  const exportQuery = new URLSearchParams({ search, status }).toString();

  return (
    <>
      <Topbar
        title="Users"
        description={`${total} registered ${total === 1 ? 'user' : 'users'}`}
        admin={admin}
        actions={<ExportButton filenameBase="users" fetchUrl={`/api/export/users?${exportQuery}`} />}
      />

      <main className="p-6 md:p-8 space-y-4">
        <FiltersBar
          searchPlaceholder="Search name, email, phone, or code…"
          statusOptions={[
            { value: 'all', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-text-muted">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Phone</th>
                  <th className="px-5 py-3 font-medium">Referral code</th>
                  <th className="px-5 py-3 font-medium">Referred by</th>
                  <th className="px-5 py-3 font-medium text-right">Referrals</th>
                  <th className="px-5 py-3 font-medium">Registered</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-black/[0.015] transition">
                    <td className="px-5 py-3">
                      <Link href={`/admin/users/${u.id}`} className="font-medium text-text hover:text-brand-dark">
                        {u.full_name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{u.email}</td>
                    <td className="px-5 py-3 text-text-muted">{u.phone ?? '—'}</td>
                    <td className="px-5 py-3">
                      <code className="font-mono text-xs bg-black/[0.03] px-1.5 py-0.5 rounded">
                        {u.referral_code}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{u.referred_by_name ?? '—'}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{u.stats.completed_referrals}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDate(u.created_at)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-text-muted text-sm">
                      No users match these filters.
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
