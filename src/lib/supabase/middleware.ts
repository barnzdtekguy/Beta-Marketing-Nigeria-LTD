import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options: CookieOptions };

type Area = 'admin' | 'realtor' | 'public';

// The whole site is public by default (home page, realtor registration).
// /admin/* (except its own login) needs an admins row. /dashboard/* needs
// a users row linked to the session (auth_id). The two are checked against
// different tables so an admin session can't wander into a realtor's
// dashboard and vice versa.
function areaFor(path: string): Area {
  if (path.startsWith('/admin/login')) return 'public';
  if (path.startsWith('/admin')) return 'admin';
  if (path.startsWith('/api/export')) return 'admin';
  if (path.startsWith('/dashboard')) return 'realtor';
  return 'public';
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const area = areaFor(path);

  let isAdmin = false;
  let isRealtor = false;

  if (user) {
    const [{ data: admin }, { data: realtor }] = await Promise.all([
      area === 'admin' || path === '/admin/login'
        ? supabase.from('admins').select('id').eq('id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
      area === 'realtor' || path === '/login'
        ? supabase.from('users').select('id').eq('auth_id', user.id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
    isAdmin = !!admin;
    isRealtor = !!realtor;
  }

  if (!user && area !== 'public') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = area === 'admin' ? '/admin/login' : '/login';
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && area === 'admin' && !isAdmin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/admin/login';
    loginUrl.searchParams.set('error', 'not-authorized');
    return NextResponse.redirect(loginUrl);
  }

  if (user && area === 'realtor' && !isRealtor) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', 'not-authorized');
    return NextResponse.redirect(loginUrl);
  }

  // Only skip past a login page if this session actually belongs to that
  // area — otherwise this would loop (e.g. an admin-only session hitting
  // /login would bounce to /dashboard, which would bounce them right back).
  if (user && path === '/admin/login' && isAdmin) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/admin';
    return NextResponse.redirect(dashboardUrl);
  }

  if (user && path === '/login' && isRealtor) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}
