import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

// Hard ceiling so one export can't accidentally pull an unbounded table.
// Raise if the user base genuinely exceeds this, or switch to a streamed
// / paginated export at that point.
const MAX_ROWS = 20000;

export async function GET(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.trim() ?? '';
  const status = searchParams.get('status') ?? 'all';

  let query = supabase
    .from('users')
    .select('id, full_name, email, phone, referral_code, status, created_at, referrer:referred_by(full_name)')
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,referral_code.ilike.%${search}%`
    );
  }
  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (data ?? []).map((u: any) => u.id);
  const statsById = new Map<string, number>();
  if (ids.length > 0) {
    const { data: stats } = await supabase
      .from('user_referral_stats')
      .select('user_id, completed_referrals')
      .in('user_id', ids);
    for (const s of stats ?? []) statsById.set(s.user_id, s.completed_referrals);
  }

  const rows = (data ?? []).map((u: any) => ({
    Name: u.full_name,
    Email: u.email,
    Phone: u.phone ?? '',
    'Referral Code': u.referral_code,
    'Referred By': u.referrer?.full_name ?? '',
    'Referrals Made': statsById.get(u.id) ?? 0,
    Status: u.status,
    'Registered On': formatDate(u.created_at),
  }));

  return NextResponse.json({ rows });
}
