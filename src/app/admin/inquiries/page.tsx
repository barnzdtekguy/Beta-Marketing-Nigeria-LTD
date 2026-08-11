import { getCurrentAdmin, getInquiries } from '@/lib/queries';
import { StatusBadge } from '@/components/status-badge';
import { formatDate } from '@/lib/utils';
import { updateInquiryStatus } from './actions';

export default async function AdminInquiriesPage() {
  const [admin, { inquiries }] = await Promise.all([getCurrentAdmin(), getInquiries({ page: 1, pageSize: 100 })]);

  return (
    <main className="p-6 md:p-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-text">Buyer and investor inquiries</h1>
          <p className="mt-1 text-sm text-text-muted">
            Admin view of every inquiry. Referred leads also appear on the matching realtor dashboard.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-text-muted">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Referred by</th>
                <th className="px-5 py-3 font-medium">Request</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id} className="border-b border-border align-top last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-medium text-text">{inquiry.full_name}</div>
                    <div className="mt-1 text-xs text-text-muted">{inquiry.source_ref_code ? `Ref: ${inquiry.source_ref_code}` : 'Direct inquiry'}</div>
                  </td>
                  <td className="px-5 py-4">
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
                  <td className="px-5 py-4 text-text-muted">
                    <div>{inquiry.email}</div>
                    <div>{inquiry.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    {inquiry.referrer_name ?? 'No realtor referral'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="max-w-sm whitespace-pre-wrap text-text-muted">{inquiry.request_details}</div>
                  </td>
                  <td className="px-5 py-4">
                    <form action={updateInquiryStatus} className="space-y-2">
                      <input type="hidden" name="id" value={inquiry.id} />
                      <select
                        name="status"
                        defaultValue={inquiry.status}
                        className="w-full rounded-lg border border-border bg-white px-2.5 py-2 text-xs text-text focus:border-brand focus:outline-none"
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="pending_transaction">Pending transaction</option>
                        <option value="closed">Closed</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <label className="flex items-center gap-2 text-[11px] text-text-muted">
                        <input
                          type="checkbox"
                          name="transaction_completed"
                          value="true"
                          defaultChecked={Boolean(inquiry.transaction_completed_at)}
                        />
                        Transaction completed
                      </label>

                      <button
                        type="submit"
                        className="w-full rounded-lg bg-brand px-2.5 py-2 text-xs font-medium text-white transition hover:bg-brand-dark"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    <div>{formatDate(inquiry.created_at)}</div>
                    {inquiry.transaction_completed_at && (
                      <div className="mt-2 text-[11px] text-success">Closed: {formatDate(inquiry.transaction_completed_at)}</div>
                    )}
                  </td>
                </tr>
              ))}

              {inquiries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm text-text-muted">
                    No inquiries yet.
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
