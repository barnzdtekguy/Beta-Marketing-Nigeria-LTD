import { NextResponse } from 'next/server';
import { createClient, createServiceRoleClient } from '@/lib/supabase/server';
import { creditUplineCommissions } from '@/lib/commission';

const VALID_OTP_TYPES = ['signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email'] as const;
type OtpType = (typeof VALID_OTP_TYPES)[number];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const fail = () =>
    NextResponse.redirect(
      new URL(
        `/register?error=${encodeURIComponent('That confirmation link is invalid or has expired.')}`,
        request.url
      )
    );

  if (!tokenHash || !type || !VALID_OTP_TYPES.includes(type as OtpType)) {
    return fail();
  }

  // Cookie-bound client so a successful verification actually sets the
  // session cookies on this response — this is the real sign-in.
  const supabase = createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    type: type as OtpType,
    token_hash: tokenHash,
  });

  if (error || !data.user) {
    console.error('[auth/confirm] verifyOtp failed:', error?.message);
    return fail();
  }

  const serviceSupabase = createServiceRoleClient();
  const { data: userRow, error: userErr } = await serviceSupabase
    .from('users')
    .select('id, full_name, referral_code, status, referred_by, signup_referral_link_id')
    .eq('auth_id', data.user.id)
    .maybeSingle();

  if (userErr || !userRow) {
    console.error('[auth/confirm] user lookup failed:', userErr?.message);
    return fail();
  }

  // Only activate + credit once — handles someone clicking the link twice
  // (Supabase's own single-use token already blocks most re-clicks, but
  // this is a second layer in case of races).
  if (userRow.status !== 'active') {
    await serviceSupabase.from('users').update({ status: 'active' }).eq('id', userRow.id);

    if (userRow.referred_by) {
      await creditUplineCommissions(
        serviceSupabase,
        userRow.referred_by,
        userRow.id,
        userRow.signup_referral_link_id
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      `/register/success?code=${encodeURIComponent(userRow.referral_code)}&name=${encodeURIComponent(userRow.full_name)}`,
      request.url
    )
  );
}
