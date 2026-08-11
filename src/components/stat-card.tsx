import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = 'brand',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: 'brand' | 'amber';
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            accent === 'brand' ? 'bg-brand-soft text-brand-dark' : 'bg-amber-soft text-amber'
          )}
        >
          <Icon size={15} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl text-text">{value}</p>
    </div>
  );
}
