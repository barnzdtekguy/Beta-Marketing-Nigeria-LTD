'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function signIn(formData: FormData) {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/dashboard');

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent('Enter your email and password.')}`);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const message = error.message.toLowerCase().includes('email not confirmed')
      ? "Please verify your email first — check your inbox for the confirmation link we sent when you registered."
      : 'Incorrect email or password.';
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  redirect(next || '/dashboard');
}
