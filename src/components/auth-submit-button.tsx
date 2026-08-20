'use client';

import { useAuthSubmit } from '@/components/auth-submit-context';

/**
 * Pure display — the enclosing <TrackedForm> is what actually sets
 * `submitting` (from its onSubmit), so this button never needs its own
 * onClick or disabled handling. See tracked-form.tsx for why: setting
 * state from a submit button's onClick fires before native validation
 * runs and before the browser's default submit action, both of which
 * caused real bugs when this button used to own that logic directly.
 */
export function AuthSubmitButton({
  children,
  pendingLabel = 'Please wait…',
  className,
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { submitting } = useAuthSubmit();

  return (
    <button type="submit" className={className}>
      {submitting ? pendingLabel : children}
    </button>
  );
}
