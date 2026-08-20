'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function FlashMessage({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasMessage = !!error || !!success;
    if (!hasMessage) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('error');
      params.delete('success');
      params.delete('registered');

      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }, 5000);

    return () => clearTimeout(timer);
  }, [error, success, pathname, router, searchParams]);

  if (!error && !success) return null;

  return (
    <div
      className={error ? 'text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-3 py-2' : 'text-sm text-success bg-success-soft border border-success/20 rounded-lg px-3 py-2'}
    >
      {error ?? success}
    </div>
  );
}
