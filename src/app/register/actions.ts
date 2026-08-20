'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { generateUniqueReferralCode } from '@/lib/referral';

// Commission paid at each level of the referral chain when someone new
// registers. Index 0 = the direct referrer (level 1), index 1 = that
// referrer's own upline (level 2), and so on. To pay out a 3rd level too,
// just add another number — creditUplineCommissions() below already walks
// as far up the chain as this array goes.
const COMMISSION_RATES = [2500, 500];

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
  // referral_code shared directly.
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
  // triggers Supabase to email them a verification link. Requires
  // "Confirm email" to be turned on in Supabase Auth settings (Auth →
  // Providers → Email), and the deployed origin to be in Auth → URL
  // Configuration → Redirect URLs, or the confirmation link will fail.
  const host = headers().get('host');
  const origin = `${host?.includes('localhost') ? 'http' : 'https'}://${host}`;

  const authClient = createClient();
  const { data: authData, error: authError } = await authClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/login?confirmed=1`,
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
      status: 'active',
      auth_id: authData!.user!.id,
    })
    .select('id')
    .single();

  if (insertError || !newUser) {
    console.error('[registerUser] insert failed:', insertError?.message);
    // Roll back the auth account so retrying with the same email works.
    await supabase.auth.admin.deleteUser(authData!.user!.id);
    fail("Couldn't complete registration. Try again.");
  }

  if (referrerId) {
    await creditUplineCommissions(supabase, referrerId, newUser!.id, referralLinkId);
  }

  // authClient.auth.signUp() only returns a session immediately if "Confirm
  // email" is off — in which case they're already signed in here, same as
  // before. When confirmation is required, there's no session yet: they
  // need to click the emailed link before /login will let them in.
  const pending = !authData.session;

  redirect(
    `/register/success?code=${encodeURIComponent(newReferralCode)}&name=${encodeURIComponent(fullName)}${pending ? '&pending=1' : ''}`
  );
}

/**
 * Credits the direct referrer (level 1) and, if they were themselves
 * referred by someone, that upline too (level 2), and so on up the chain
 * — one row in `referrals` per level, each with its own commission amount.
 * Stops when either the chain runs out or COMMISSION_RATES does.
 */
async function creditUplineCommissions(
  supabase: ReturnType<typeof createServiceRoleClient>,
  directReferrerId: string,
  newUserId: string,
  directLinkId: string | null
) {
  let currentReferrerId: string | null = directReferrerId;
  let level = 1;

  while (currentReferrerId && level <= COMMISSION_RATES.length) {
    await supabase.from('referrals').insert({
      referrer_id: currentReferrerId,
      referred_user_id: newUserId,
      referral_link_id: level === 1 ? directLinkId : null,
      level,
      status: 'completed',
      commission_amount: COMMISSION_RATES[level - 1],
      commission_status: 'unpaid',
    });

    if (level === 1 && directLinkId) {
      const { data: linkRow } = await supabase
        .from('referral_links')
        .select('clicks')
        .eq('id', directLinkId)
        .single();
      await supabase
        .from('referral_links')
        .update({ clicks: (linkRow?.clicks ?? 0) + 1 })
        .eq('id', directLinkId);
    }

    const { data: referrerRow }: { data: { referred_by: string | null } | null } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', currentReferrerId)
      .single();

    currentReferrerId = referrerRow?.referred_by ?? null;
    level++;
  }
}
