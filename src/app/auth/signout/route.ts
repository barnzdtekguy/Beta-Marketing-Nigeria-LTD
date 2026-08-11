import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_REDIRECTS = ['/admin/login', '/login'];

export async function POST(request: Request) {
  const supabase = createClient();
  await supabase.auth.signOut();

  const { searchParams } = new URL(request.url);
  const requested = searchParams.get('redirect');
  const target = requested && ALLOWED_REDIRECTS.includes(requested) ? requested : '/admin/login';

  return NextResponse.redirect(new URL(target, request.url));
}
