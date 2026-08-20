'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutGrid, Users, Share2, Wallet, MessageSquareText, ClipboardList, Megaphone, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutGrid },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/referrals', label: 'Referrals', icon: Share2 },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquareText },
  { href: '/admin/leads', label: 'Leads', icon: ClipboardList },
  { href: '/admin/commissions', label: 'Commissions', icon: Wallet },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
];

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-6 space-y-0.5">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition',
              active ? 'bg-white/10 text-white' : 'hover:bg-white/5 hover:text-white'
            )}
          >
            <Icon size={17} strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SignOutButton() {
  return (
    <div className="px-3 py-4 border-t border-white/10">
      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 hover:text-white transition"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the drawer automatically whenever the route changes, so tapping
  // a link doesn't leave it open behind the new page.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent the page behind the drawer from scrolling while it's open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Mobile top bar — this is what replaces the sidebar below md */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-ink text-white border-b border-white/10">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
          className="flex items-center justify-center w-9 h-9 -ml-1.5 rounded-lg hover:bg-white/10 transition"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        <div className="flex items-center gap-2">
          <Logo variant="icon" size={22} />
          <span className="font-display text-sm font-medium tracking-tight">Beta Marketing</span>
        </div>

        {/* Spacer to keep the logo visually centered against the menu button */}
        <div className="w-9" aria-hidden />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-ink text-white/70 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Logo variant="icon" size={24} />
                <span className="font-display text-white font-medium tracking-tight text-sm">
                  Beta Marketing
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            <SignOutButton />
          </aside>
        </div>
      )}

      {/* Desktop sidebar — unchanged from before */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-ink text-white/70 min-h-screen sticky top-0">
        <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/10">
          <Logo variant="icon" size={26} />
          <span className="font-display text-white font-medium tracking-tight text-sm leading-tight">
            Beta Marketing
          </span>
        </div>

        <NavLinks pathname={pathname} />
        <SignOutButton />
      </aside>
    </>
  );
}
