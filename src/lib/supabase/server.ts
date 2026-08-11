import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types';

type CookieToSet = { name: string; value: string; options: CookieOptions };

// Use in Server Components, Route Handlers, and Server Actions.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component with no writable cookie store —
            // safe to ignore because middleware refreshes the session anyway.
          }
        },
      },
    }
  );
}

// Admin-privileged client that bypasses RLS. Server-only — never import
// this from a Client Component. Used for trusted operations like exports
// that need to join across tables in one shot, and the public registration
// endpoint that inserts users/referrals from outside the admin session.
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}
