'use server';

import { redirect } from 'next/navigation';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { generateUniqueReferralCode } from '@/lib/referral';

export async function registerUser(formData: FormData) {
  const fullName = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const ref = String(formData.get('ref') ?? '').trim();

  const fail = (message: string) => {
    redirect(`/register?ref=${encodeURIComponent(ref)}&error=${encodeURIComponent(message)}`);
  };

  if (!fullName || !email || !password) {
    fail('Name, email, and password are required.');
  }
  if (password.length < 6) {
    fail('Password must be at least 6 characters.');
  }

  const supabase = createServiceRoleClient();

  const { data: existing, error: existingErr } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingErr) {
    // Almost always means SUPABASE_SERVICE_ROLE_KEY is missing/wrong in
    // .env.local — check the terminal for the actual Supabase error.
    console.error('[registerUser] email lookup failed:', existingErr.message);
    fail("Couldn't reach the database. Try again in a moment.");
  }

  if (existing) {
    fail('That email is already registered. Try signing in instead.');
  }

  // Resolve referral attribution, if any. Try a trackable issued link
  // first (referral_links.code), then fall back to a user's own
  // referral_code shared directly. Commission isn't credited yet — that
  // happens once they confirm their email, in /auth/confirm — but we
  // still need to remember who referred them (and which specific link,
  // for its click count) until then.
  let referrerId: string | null = null;
  let referralLinkId: string | null = null;

  if (ref) {
    const { data: link } = await supabase
      .from('referral_links')
      .select('id, owner_id')
      .eq('code', ref)
      .maybeSingle();

    if (link) {
      referrerId = link.owner_id;
      referralLinkId = link.id;
    } else {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', ref)
        .maybeSingle();
      if (referrer) referrerId = referrer.id;
    }
  }

  // Create the real login account through the public signUp flow — not
  // supabase.auth.admin.createUser(), which never sends a confirmation
  // email no matter what email_confirm is set to. This is what actually
  // triggers Supabase's confirmation email. No session exists here — that
  // only happens once they click the link and land on /auth/confirm.
  // Requires "Confirm email" to be turned on in Supabase Auth settings
  // (Auth → Providers → Email).
  const authClient = createClient();
  const { data: authData, error: authError } = await authClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone: phone || null },
    },
  });

  if (authError || !authData.user) {
    console.error('[registerUser] auth account creation failed:', authError?.message);
    fail(
      authError?.message?.toLowerCase().includes('registered')
        ? 'That email is already registered. Try signing in instead.'
        : "Couldn't create your account. Try again."
    );
  }

  const newReferralCode = await generateUniqueReferralCode(fullName);

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({
      full_name: fullName,
      email,
      phone: phone || null,
      referral_code: newReferralCode,
      referred_by: referrerId,
      status: 'pending',
      auth_id: authData!.user!.id,
      signup_referral_link_id: referralLinkId,
    })
    .select('id')
    .single();

  if (insertError || !newUser) {
    console.error('[registerUser] insert failed:', insertError?.message);
    // Roll back the auth account so retrying with the same email works.
    await supabase.auth.admin.deleteUser(authData!.user!.id);
    fail("Couldn't complete registration. Try again.");
  }

  redirect(`/register/pending?email=${encodeURIComponent(email)}`);
}
