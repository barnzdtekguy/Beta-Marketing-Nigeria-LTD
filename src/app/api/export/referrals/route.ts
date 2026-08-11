import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

const MAX_ROWS = 20000;

export async function GET(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') ?? 'all';
  const level = searchParams.get('level') ?? 'all';

  let query = supabase
    .from('referrals')
    .select(
      'level, status, commission_amount, commission_status, created_at, referrer:referrer_id(full_name, email), referred_user:referred_user_id(full_name, email)'
    )
    .order('created_at', { ascending: false })
    .limit(MAX_ROWS);

  if (status !== 'all') {
    query = query.eq('status', status);
  }
  if (level === 'direct') {
    query = query.eq('level', 1);
  } else if (level === 'override') {
    query = query.gt('level', 1);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []).map((r: any) => ({
    Referrer: r.referrer?.full_name ?? '',
    'Referrer Email': r.referrer?.email ?? '',
    'Referred User': r.referred_user?.full_name ?? '(pending)',
    'Referred Email': r.referred_user?.email ?? '',
    Level: r.level === 1 ? 'Direct' : `Override (L${r.level})`,
    Status: r.status,
    'Commission Amount': r.commission_amount,
    'Commission Status': r.commission_status,
    'Date': formatDate(r.created_at),
  }));

  return NextResponse.json({ rows });
}
