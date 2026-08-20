import { cn } from '@/lib/utils';

const STYLES: Record<string, string> = {
  active: 'bg-success-soft text-success',
  completed: 'bg-success-soft text-success',
  paid: 'bg-success-soft text-success',
  pending: 'bg-amber-soft text-amber',
  inactive: 'bg-black/5 text-text-muted',
  unpaid: 'bg-amber-soft text-amber',
  rejected: 'bg-danger-soft text-danger',
  failed: 'bg-danger-soft text-danger',
  void: 'bg-black/5 text-text-muted',
  new: 'bg-brand/10 text-brand-dark',
  contacted: 'bg-sky-100 text-sky-700',
  pending_transaction: 'bg-amber-soft text-amber',
  closed: 'bg-success-soft text-success',
  successful: 'bg-success-soft text-success',
  unsuccessful: 'bg-danger-soft text-danger',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
        STYLES[status] ?? 'bg-black/5 text-text-muted'
      )}
    >
      {status}
    </span>
  );
}
