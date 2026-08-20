'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkLockout, clearFailedAttempts, recordFailedAttempt } from '@/lib/login-lockout';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/admin');

  if (!email || !password) {
    redirect(`/admin/login?error=${encodeURIComponent('Enter your email and password.')}`);
  }

  const lockout = await checkLockout(email);
  if (lockout.locked) {
    redirect(`/admin/login?error=${encodeURIComponent(lockout.message!)}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Admins are added manually and don't go through email verification,
    // so unlike the realtor login there's no "unconfirmed" case to carve
    // out — every failure here counts toward the lockout.
    await recordFailedAttempt(email, true);
    redirect(`/admin/login?error=${encodeURIComponent('Incorrect email or password.')}`);
  }

  await clearFailedAttempts(email);
  redirect(next || '/admin');
}
