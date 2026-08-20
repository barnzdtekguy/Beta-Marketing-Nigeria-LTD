import { createClient } from '@/lib/supabase/server';
import type {
  ReferralWithNames,
  UserReferralStats,
  UserWithStats,
} from '@/lib/types';

// ----------------------------------------------------------------------------
// Client leads (admin) — prospective buyers realtors bring in directly.
// Distinct from `inquiries` (public buyer/investor contact-form leads):
// these are realtor-submitted, admin sets the commission amount per sale.
// ----------------------------------------------------------------------------

export interface LeadsQueryParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function getLeads({ search = '', status = 'all', page = 1, pageSize = 20 }: LeadsQueryParams) {
  const supabase = createClient();

  let query = supabase
    .from('client_leads')
    .select(
      'id, client_name, client_phone, client_email, property_type, status, commission_amount, created_at, realtor:realtor_id(id, full_name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search.trim()) {
    const term = search.trim();
    query = query.or(`client_name.ilike.%${term}%,client_phone.ilike.%${term}%,client_email.ilike.%${term}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { leads: data ?? [], total: count ?? 0, page, pageSize };
}

export async function getLeadById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('client_leads')
    .select('*, realtor:realtor_id(id, full_name, email, phone)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ----------------------------------------------------------------------------
// Announcements (admin)
// ----------------------------------------------------------------------------

export async function getAllAnnouncements({ page = 1, pageSize = 20 }: { page?: number; pageSize?: number }) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabase
    .from('announcements')
    .select('id, title, body, created_at, admin:admin_id(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;
  return { announcements: data ?? [], total: count ?? 0, page, pageSize };
}

// ----------------------------------------------------------------------------
// Current admin (for the topbar identity, and any role-gated UI later)
// ----------------------------------------------------------------------------

export async function getCurrentAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('admins')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  return data;
}

// ----------------------------------------------------------------------------
// Overview
// ----------------------------------------------------------------------------

export async function getOverviewStats() {
  const supabase = createClient();

  const [{ count: totalUsers }, { count: totalLinks }, { count: completedReferrals }, referralsForCommission] =
    await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('referral_links').select('*', { count: 'exact', head: true }),
      supabase
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('level', 1), // count actual people referred, not every commission-earning row
      supabase.from('referrals').select('commission_amount').eq('status', 'completed'), // all levels — total payout
    ]);

  const totalCommission = (referralsForCommission.data ?? []).reduce(
    (sum, r) => sum + Number(r.commission_amount ?? 0),
    0
  );

  return {
    totalUsers: totalUsers ?? 0,
    totalLinks: totalLinks ?? 0,
    completedReferrals: completedReferrals ?? 0,
    totalCommission,
  };
}

// Registrations per day for the last N days, filled with zeros for gaps so
// the chart doesn't lie about flat days.
export async function getRegistrationsOverTime(days = 30) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', since.toISOString());

  if (error) throw error;

  const buckets = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const row of data ?? []) {
    const key = row.created_at.slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
}

// ----------------------------------------------------------------------------
// Users
// ----------------------------------------------------------------------------

export interface UsersQueryParams {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sort?: 'newest' | 'oldest' | 'most_referrals';
}

export async function getUsers({
  search = '',
  status = 'all',
  page = 1,
  pageSize = 20,
  sort = 'newest',
}: UsersQueryParams) {
  const supabase = createClient();

  let query = supabase.from('users').select(
    'id, full_name, email, phone, referral_code, referred_by, status, auth_id, created_at, referrer:referred_by(full_name)',
    { count: 'exact' }
  );

  if (search.trim()) {
    const term = search.trim();
    query = query.or(
      `full_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%,referral_code.ilike.%${term}%`
    );
  }

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  query = query.order('created_at', { ascending: sort === 'oldest' });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const userIds = (data ?? []).map((u) => u.id);
  const statsById = await getStatsForUsers(userIds);

  const users: UserWithStats[] = (data ?? []).map((u: any) => ({
    id: u.id,
    full_name: u.full_name,
    email: u.email,
    phone: u.phone,
    referral_code: u.referral_code,
    referred_by: u.referred_by,
    status: u.status,
    auth_id: u.auth_id,
    created_at: u.created_at,
    referred_by_name: u.referrer?.full_name ?? null,
    stats:
      statsById.get(u.id) ?? {
        user_id: u.id,
        completed_referrals: 0,
        pending_referrals: 0,
        commission_earned: 0,
        commission_unpaid: 0,
      },
  }));

  if (sort === 'most_referrals') {
    users.sort((a, b) => b.stats.completed_referrals - a.stats.completed_referrals);
  }

  return { users, total: count ?? 0, page, pageSize };
}

async function getStatsForUsers(userIds: string[]) {
  const map = new Map<string, UserReferralStats>();
  if (userIds.length === 0) return map;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_referral_stats')
    .select('*')
    .in('user_id', userIds);

  if (error) throw error;
  for (const row of data ?? []) {
    map.set(row.user_id, row as UserReferralStats);
  }
  return map;
}

export async function getUserById(id: string) {
  const supabase = createClient();

  const { data: user, error } = await supabase
    .from('users')
    .select(
      'id, full_name, email, phone, referral_code, referred_by, status, created_at, referrer:referred_by(id, full_name, email)'
    )
    .eq('id', id)
    .single();

  if (error) throw error;

  const [{ data: referrals, error: refErr }, { data: overrideEarnings, error: overrideErr }, statsMap] =
    await Promise.all([
      // Level 1 only — people this user personally referred.
      supabase
        .from('referrals')
        .select(
          'id, status, commission_amount, commission_status, created_at, referred_user:referred_user_id(id, full_name, email, created_at)'
        )
        .eq('referrer_id', id)
        .eq('level', 1)
        .order('created_at', { ascending: false }),
      // Level 2+ — earnings from people in this user's downline network,
      // referred by someone this user brought in (not directly by them).
      supabase
        .from('referrals')
        .select(
          'id, level, status, commission_amount, commission_status, created_at, referred_user:referred_user_id(id, full_name, email, referred_via:referred_by(id, full_name))'
        )
        .eq('referrer_id', id)
        .gt('level', 1)
        .order('created_at', { ascending: false }),
      getStatsForUsers([id]),
    ]);

  if (refErr) throw refErr;
  if (overrideErr) throw overrideErr;

  return {
    user,
    referrals: referrals ?? [],
    overrideEarnings: overrideEarnings ?? [],
    stats:
      statsMap.get(id) ?? {
        user_id: id,
        completed_referrals: 0,
        pending_referrals: 0,
        commission_earned: 0,
        commission_unpaid: 0,
      },
  };
}

// ----------------------------------------------------------------------------
// Referrals
// ----------------------------------------------------------------------------

export interface ReferralsQueryParams {
  search?: string;
  status?: string;
  level?: string;
  page?: number;
  pageSize?: number;
}

export async function getReferrals({
  search = '',
  status = 'all',
  level = 'all',
  page = 1,
  pageSize = 20,
}: ReferralsQueryParams) {
  const supabase = createClient();

  let query = supabase
    .from('referrals')
    .select(
      'id, level, status, commission_amount, commission_status, created_at, referrer:referrer_id(id, full_name, email), referred_user:referred_user_id(id, full_name, email)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (level === 'direct') {
    query = query.eq('level', 1);
  } else if (level === 'override') {
    query = query.gt('level', 1);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  let referrals: ReferralWithNames[] = (data ?? []).map((r: any) => ({
    id: r.id,
    referrer_id: r.referrer?.id,
    referred_user_id: r.referred_user?.id ?? null,
    referral_link_id: null,
    level: r.level,
    status: r.status,
    commission_amount: r.commission_amount,
    commission_status: r.commission_status,
    created_at: r.created_at,
    referrer_name: r.referrer?.full_name ?? '—',
    referred_user_name: r.referred_user?.full_name ?? null,
  }));

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    referrals = referrals.filter(
      (r) =>
        r.referrer_name.toLowerCase().includes(term) ||
        (r.referred_user_name ?? '').toLowerCase().includes(term)
    );
  }

  const { count: totalLinks } = await supabase
    .from('referral_links')
    .select('*', { count: 'exact', head: true });

  return { referrals, total: count ?? 0, totalLinks: totalLinks ?? 0, page, pageSize };
}

// ----------------------------------------------------------------------------
// Commissions
// ----------------------------------------------------------------------------

export async function getInquiries({
  page = 1,
  pageSize = 20,
  status = 'all',
}: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const supabase = createClient();

  let query = supabase
    .from('inquiries')
    .select(
      'id, full_name, email, phone, request_details, inquiry_type, referred_by, source_ref_code, status, transaction_completed_at, created_at, referrer:referred_by(full_name)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    inquiries:
      (data ?? []).map((row: any) => ({
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        request_details: row.request_details,
        inquiry_type: row.inquiry_type,
        referred_by: row.referred_by,
        source_ref_code: row.source_ref_code,
        status: row.status,
        transaction_completed_at: row.transaction_completed_at,
        created_at: row.created_at,
        referrer_name: row.referrer?.full_name ?? null,
      })) ?? [],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getCommissionSummary() {
  const supabase = createClient();

  const { data: referrals, error } = await supabase
    .from('referrals')
    .select('commission_amount, commission_status')
    .eq('status', 'completed');

  if (error) throw error;

  const totals = { earned: 0, paid: 0, unpaid: 0 };
  for (const r of referrals ?? []) {
    const amount = Number(r.commission_amount ?? 0);
    totals.earned += amount;
    if (r.commission_status === 'paid') totals.paid += amount;
    if (r.commission_status === 'unpaid') totals.unpaid += amount;
  }

  return totals;
}

export async function getCommissionPayments({
  page = 1,
  pageSize = 20,
  status = 'all',
}: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const supabase = createClient();

  let query = supabase
    .from('commission_payments')
    .select(
      'id, amount, method, reference, status, paid_at, created_at, bank_name, account_number, account_name, lead_id, user:user_id(id, full_name, email), lead:lead_id(client_name, property_type)',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { payments: data ?? [], total: count ?? 0, page, pageSize };
}
