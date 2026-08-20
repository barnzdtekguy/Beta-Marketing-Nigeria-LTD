'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

type AuthSubmitContextValue = {
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
};

const AuthSubmitContext = createContext<AuthSubmitContextValue | null>(null);

/** Wrap a whole auth page (logo + form) in this so both can share one submit state. */
export function AuthSubmitProvider({ children }: { children: ReactNode }) {
  const [submitting, setSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // A search-param change here only ever comes from a redirect() inside
    // the submitted server action (?error=..., ?success=..., etc). For a
    // redirect back to the *same* route (e.g. /login -> /login?error=...),
    // Next.js updates this page in place rather than remounting it, so
    // `submitting` would otherwise stay stuck true forever with nothing to
    // ever clear it — the bug that made the overlay hang indefinitely.
    setSubmitting(false);
  }, [paramsKey]);

  return (
    <AuthSubmitContext.Provider value={{ submitting, setSubmitting }}>
      {children}
    </AuthSubmitContext.Provider>
  );
}

export function useAuthSubmit() {
  const ctx = useContext(AuthSubmitContext);
  if (!ctx) {
    throw new Error('useAuthSubmit must be used within an AuthSubmitProvider');
  }
  return ctx;
}
