import { Logo } from '@/components/logo';
import { getCurrentRealtor } from '@/lib/realtor-queries';
import { initials } from '@/lib/utils';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const realtor = await getCurrentRealtor();
  const displayName = realtor?.full_name ?? 'Realtor';

  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center justify-between px-6 md:px-8 h-16 border-b border-border bg-white/70 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Logo variant="icon" size={24} />
          <span className="font-display text-sm text-text font-medium tracking-tight hidden sm:inline">
            Beta Marketing
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 pr-3 border-r border-border">
            <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center text-xs font-medium">
              {initials(displayName)}
            </div>
            <span className="hidden sm:block text-sm text-text-muted">{displayName}</span>
          </div>
          <form action="/auth/signout?redirect=/login" method="post">
            <button
              type="submit"
              className="text-sm text-text-muted hover:text-text px-2 py-1.5 rounded-lg hover:bg-black/[0.03] transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {children}
    </div>
  );
}
