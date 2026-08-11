'use client';

import { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export function MobileNav({
  links,
  registerHref,
}: {
  links: { href: string; label: string }[];
  registerHref: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 transition"
      >
        <Menu size={20} strokeWidth={1.8} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 animate-fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col p-6">
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-black/5 transition"
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="px-2 py-2.5 rounded-lg text-sm text-text-muted hover:bg-black/[0.03] hover:text-text transition"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto space-y-3">
              <a
                href="/login"
                className="block text-center rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text hover:border-brand hover:text-brand transition"
              >
                Sign in
              </a>
              <a
                href={registerHref}
                className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark transition"
              >
                Get started
                <ArrowRight size={15} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
