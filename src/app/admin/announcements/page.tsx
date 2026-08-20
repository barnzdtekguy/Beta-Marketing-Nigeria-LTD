import { getCurrentAdmin, getAllAnnouncements } from '@/lib/queries';
import { Topbar } from '@/components/topbar';
import { Pagination } from '@/components/pagination';
import { FlashMessage } from '@/components/flash-message';
import { formatDateTime } from '@/lib/utils';
import { postAnnouncement } from './actions';

const PAGE_SIZE = 20;

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: { page?: string; error?: string; success?: string };
}) {
  const page = Number(searchParams.page ?? 1) || 1;

  const [admin, { announcements, total }] = await Promise.all([
    getCurrentAdmin(),
    getAllAnnouncements({ page, pageSize: PAGE_SIZE }),
  ]);

  return (
    <>
      <Topbar title="Announcements" description="Broadcast updates to every realtor" admin={admin} />

      <main className="p-6 md:p-8 space-y-6 max-w-3xl">
        <div className="bg-card border border-border rounded-xl p-5 shadow-card">
          <h2 className="font-display text-sm text-text mb-4">Post a new announcement</h2>
          <form action={postAnnouncement} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-xs font-medium text-text-muted mb-1.5">
                Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="e.g. Commission payout changes"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-xs font-medium text-text-muted mb-1.5">
                Message
              </label>
              <textarea
                id="body"
                name="body"
                rows={4}
                required
                className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint focus:border-brand focus:ring-1 focus:ring-brand outline-none transition"
                placeholder="What changed and what realtors need to know…"
              />
            </div>

            <FlashMessage error={searchParams.error ?? null} success={searchParams.success ?? null} />

            <button
              type="submit"
              className="rounded-lg bg-brand text-white text-sm font-medium px-4 py-2.5 hover:bg-brand-dark transition"
            >
              Send to all realtors
            </button>
          </form>
        </div>

        <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="font-display text-sm text-text">Sent announcements</h2>
          </div>
          <ul className="divide-y divide-border">
            {announcements.map((a: any) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-medium text-text text-sm">{a.title}</p>
                  <p className="shrink-0 text-xs text-text-faint">{formatDateTime(a.created_at)}</p>
                </div>
                <p className="mt-1 text-sm text-text-muted whitespace-pre-line">{a.body}</p>
                {a.admin?.full_name && (
                  <p className="mt-1.5 text-xs text-text-faint">— {a.admin.full_name}</p>
                )}
              </li>
            ))}

            {announcements.length === 0 && (
              <li className="px-5 py-10 text-center text-text-muted text-sm">
                No announcements sent yet.
              </li>
            )}
          </ul>

          <Pagination page={page} pageSize={PAGE_SIZE} total={total} />
        </div>
      </main>
    </>
  );
}
