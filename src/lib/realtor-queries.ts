import { createClient } from '@/lib/supabase/server';
import type { AnnouncementRow, ClientLeadRow, CommissionPaymentRow, UserReferralStats } from '@/lib/types';

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

// ----------------------------------------------------------------------------
// Client leads a realtor has personally submitted, and their payout
// applications for successful sales.
// ----------------------------------------------------------------------------

export async function getRealtorLeads(realtorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_leads')
    .select('*')
    .eq('realtor_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ClientLeadRow[];
}

export async function getRealtorPayoutApplications(realtorId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('commission_payments')
    .select('*')
    .eq('user_id', realtorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as CommissionPaymentRow[];
}

export async function getAnnouncements(limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('announcements')
    .select('id, title, body, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AnnouncementRow[];
}

// Sales activity surfaced to a referrer: once someone they directly referred
// applies for payout on a successful sale, it shows up here so the referrer
// can see "{name} has made a sale" on their own dashboard.
export async function getDownlineSalesActivity(realtorId: string, limit = 10) {
  const supabase = createClient();

  const { data: downline, error: downlineErr } = await supabase
    .from('users')
    .select('id')
    .eq('referred_by', realtorId);
  if (downlineErr) throw downlineErr;

  const downlineIds = (downline ?? []).map((u) => u.id);
  if (downlineIds.length === 0) return [];

  const { data, error } = await supabase
    .from('commission_payments')
    .select(
      'id, amount, status, created_at, realtor:user_id(full_name), lead:lead_id(client_name, property_type)'
    )
    .in('user_id', downlineIds)
    .not('lead_id', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
