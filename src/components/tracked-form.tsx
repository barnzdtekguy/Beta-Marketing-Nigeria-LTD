'use client';

import { useAuthSubmit } from '@/components/auth-submit-context';

/**
 * Drop-in replacement for <form action={...}> on auth pages. Marks
 * `submitting` from the form's own onSubmit — which only ever fires once
 * the browser's native constraint validation (required, type="email",
 * minLength, …) has already passed — rather than a button onClick, which
 * fires before that check and would otherwise flag "submitting" even when
 * validation blocks the request and nothing is actually sent.
 */
export function TrackedForm({
  action,
  className,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  className?: string;
  children: React.ReactNode;
}) {
  const { setSubmitting } = useAuthSubmit();

  return (
    <form action={action} className={className} onSubmit={() => setSubmitting(true)}>
      {children}
    </form>
  );
}
