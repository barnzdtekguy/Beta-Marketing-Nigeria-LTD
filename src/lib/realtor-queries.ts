import { createClient } from '@/lib/supabase/server';
import type { UserReferralStats } from '@/lib/types';

/**
 * The logged-in realtor's own users row. Relies on the "Realtors can read
 * their own user row" RLS policy (auth_id = auth.uid()) — there is no
 * explicit filter needed here beyond the auth session itself.
 */
export async function getCurrentRealtor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('id, full_name, email, phone, referral_code, status, created_at')
    .eq('auth_id', user.id)
    .maybeSingle();

  return data;
}

export async function getRealtorStats(realtorId: string): Promise<UserReferralStats> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_referral_stats')
    .select('*')
    .eq('user_id', realtorId)
    .maybeSingle();

  return (
    data ?? {
      user_id: realtorId,
      completed_referrals: 0,
      pending_referrals: 0,
      commission_earned: 0,
      commission_unpaid: 0,
    }
  );
}

/** People this realtor personally referred (level 1 only). */
export async function getRealtorDirectReferrals(realtorId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('referrals')
    .select(
      'id, status, commission_amount, commission_status, created_at, referred_user:referred_user_id(id, full_name, email, created_at)'
    )
    .eq('referrer_id', realtorId)
    .eq('level', 1)
    .order('created_at', { ascending: false });

  return data ?? [];
}

/** Override earnings from this realtor's downline (level 2+). */
export async function getRealtorOverrideEarnings(realtorId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('referrals')
    .select(
      'id, level, status, commission_amount, commission_status, created_at, referred_user:referred_user_id(id, full_name, referred_via:referred_by(id, full_name))'
    )
    .eq('referrer_id', realtorId)
    .gt('level', 1)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getRealtorInquiries(realtorId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from('inquiries')
    .select('*')
    .eq('referred_by', realtorId)
    .order('created_at', { ascending: false });

  return data ?? [];
}
