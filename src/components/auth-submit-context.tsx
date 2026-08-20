'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type AuthSubmitContextValue = {
  submitting: boolean;
  setSubmitting: (value: boolean) => void;
};

const AuthSubmitContext = createContext<AuthSubmitContextValue | null>(null);

/** Wrap a whole auth page (logo + form) in this so both can share one submit state. */
export function AuthSubmitProvider({ children }: { children: ReactNode }) {
  const [submitting, setSubmitting] = useState(false);
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
