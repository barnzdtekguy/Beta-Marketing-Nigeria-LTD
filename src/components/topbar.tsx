import { initials } from '@/lib/utils';

export function Topbar({
  title,
  description,
  admin,
  actions,
}: {
  title: string;
  description?: string;
  admin: { full_name: string | null; email: string } | null;
  actions?: React.ReactNode;
}) {
  const displayName = admin?.full_name || admin?.email || 'Admin';

  return (
    <header className="flex items-center justify-between px-6 md:px-8 h-16 border-b border-border bg-white/70 backdrop-blur sticky top-0 z-10">
      <div>
        <h1 className="font-display text-lg text-text leading-none">{title}</h1>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions}
        <div className="flex items-center gap-2.5 pl-4 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center text-xs font-medium">
            {initials(displayName)}
          </div>
          <span className="hidden sm:block text-sm text-text-muted">{displayName}</span>
        </div>
      </div>
    </header>
  );
}
