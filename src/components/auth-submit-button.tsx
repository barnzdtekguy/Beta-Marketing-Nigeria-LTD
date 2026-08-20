'use client';

import { useAuthSubmit } from '@/components/auth-submit-context';

export function AuthSubmitButton({
  children,
  pendingLabel = 'Please wait…',
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { submitting, setSubmitting } = useAuthSubmit();

  return (
    <button
      type="submit"
      disabled={submitting}
      onClick={() => setSubmitting(true)}
      className={className}
    >
      {submitting ? pendingLabel : children}
    </button>
  );
}
