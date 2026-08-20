import { Megaphone } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import type { AnnouncementRow } from '@/lib/types';

export function AnnouncementList({ announcements }: { announcements: AnnouncementRow[] }) {
  if (announcements.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-panel overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center gap-2">
        <Megaphone size={15} className="text-brand-dark" strokeWidth={1.8} />
        <h2 className="font-display text-sm text-text">Announcements</h2>
      </div>
      <ul className="divide-y divide-border">
        {announcements.map((a) => (
          <li key={a.id} className="px-5 py-4">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-medium text-text text-sm">{a.title}</p>
              <p className="shrink-0 text-xs text-text-faint">{formatDateTime(a.created_at)}</p>
            </div>
            <p className="mt-1 text-sm text-text-muted whitespace-pre-line">{a.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
