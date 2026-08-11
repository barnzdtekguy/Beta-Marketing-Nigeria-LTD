'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function AutoDismissError({
  message,
  paramKey = 'error',
}: {
  message: string | null;
  paramKey?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(Boolean(message));

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const fadeTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 4500);

    const removeTimer = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(paramKey);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 5000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(removeTimer);
    };
  }, [message, paramKey, pathname, router, searchParams]);

  if (!message || !isVisible) return null;

  return (
    <p
      aria-live="polite"
      className={`text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-3 py-2 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {message}
    </p>
  );
}
