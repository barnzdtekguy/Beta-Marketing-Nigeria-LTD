'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkLockout, clearFailedAttempts, recordFailedAttempt } from '@/lib/login-lockout';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Enter your email and password.')}`);
  }

  const lockout = await checkLockout(email);
  if (lockout.locked) {
    redirect(`/login?error=${encodeURIComponent(lockout.message!)}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const isUnconfirmed =
      (error as { code?: string }).code === 'email_not_confirmed' ||
      error.message.toLowerCase().includes('email not confirmed');

    // An unconfirmed email isn't a wrong-password guess, so it shouldn't
    // count toward the lockout.
    await recordFailedAttempt(email, !isUnconfirmed);

    const message = isUnconfirmed
      ? 'Please confirm your email first — check your inbox for the link we sent.'
      : 'Incorrect email or password.';
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  await clearFailedAttempts(email);
  redirect(next || '/dashboard');
}
