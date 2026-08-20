import { createServiceRoleClient } from '@/lib/supabase/server';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 90;

function formatRemaining(ms: number) {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  return parts.join(' ');
}

/**
 * Shared by both /login and /admin/login, keyed by email — same table,
 * same rules, since admin accounts are just as worth protecting from
 * brute-forcing. Only ever touched via the service-role client: this runs
 * before any session exists (that's the whole point), and login_attempts
 * has no RLS policies at all, so it's unreachable from anon/authenticated
 * roles regardless.
 */
export async function checkLockout(email: string): Promise<{ locked: boolean; message?: string }> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('login_attempts')
    .select('locked_until')
    .eq('email', email)
    .maybeSingle();

  if (data?.locked_until) {
    const remainingMs = new Date(data.locked_until).getTime() - Date.now();
    if (remainingMs > 0) {
      return {
        locked: true,
        message: `Too many failed attempts. Try again in ${formatRemaining(remainingMs)}.`,
      };
    }
  }

  return { locked: false };
}

/**
 * Records a bad-credential failure. Pass `countsTowardLockout: false` for
 * an "email not confirmed" rejection — that's not a wrong-password guess,
 * so it shouldn't push someone toward getting locked out.
 */
export async function recordFailedAttempt(email: string, countsTowardLockout: boolean) {
  if (!countsTowardLockout) return;

  const supabase = createServiceRoleClient();
  const { data: existing } = await supabase
    .from('login_attempts')
    .select('failed_count, locked_until')
    .eq('email', email)
    .maybeSingle();

  // A failed attempt after a previous lockout has already expired starts a
  // fresh cycle, rather than incrementing off the stale count and
  // instantly re-locking for another 90 minutes on a single retry.
  const lockoutExpired = !!existing?.locked_until && new Date(existing.locked_until).getTime() <= Date.now();
  const previousCount = lockoutExpired ? 0 : existing?.failed_count ?? 0;
  const failedCount = previousCount + 1;
  const lockedUntil =
    failedCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_MINUTES * 60000).toISOString() : null;

  await supabase.from('login_attempts').upsert({
    email,
    failed_count: failedCount,
    locked_until: lockedUntil,
    last_attempt_at: new Date().toISOString(),
  });
}

/** A successful login clears the slate for that email. */
export async function clearFailedAttempts(email: string) {
  const supabase = createServiceRoleClient();
  await supabase.from('login_attempts').delete().eq('email', email);
}
