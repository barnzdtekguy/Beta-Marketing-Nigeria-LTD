-- ============================================================================
-- Migration: realtor accounts (password login + self-service dashboard)
--
-- Run this in the SQL editor on a database that already has schema.sql and
-- 002_multi_level_referrals.sql applied. Additive and safe to run once.
--
-- What it does: realtors can now set a password at registration and log
-- back in to see their own referrals and commission — without ever being
-- able to see anyone else's data.
-- ============================================================================

-- 1. Link a users row to a real Supabase Auth account. Nullable — realtors
--    who registered before this feature won't have one, and won't be able
--    to log in until they re-register or you backfill this manually.
alter table users
  add column if not exists auth_id uuid unique references auth.users (id) on delete set null;

-- 2. SECURITY FIX: recreate the stats view with security_invoker so Row
--    Level Security is evaluated as the actual logged-in user, not the
--    view's owner. Without this, once realtors have real login sessions,
--    querying this view directly could bypass RLS on the underlying
--    tables and expose everyone's stats, not just their own. Safe to run
--    even if you're re-applying this migration.
create or replace view user_referral_stats
with (security_invoker = true)
as
select
  u.id as user_id,
  count(r.id) filter (where r.status = 'completed' and r.level = 1) as completed_referrals,
  count(r.id) filter (where r.status = 'pending' and r.level = 1) as pending_referrals,
  coalesce(sum(r.commission_amount) filter (where r.status = 'completed'), 0) as commission_earned,
  coalesce(sum(r.commission_amount) filter (where r.commission_status = 'unpaid' and r.status = 'completed'), 0) as commission_unpaid
from users u
left join referrals r on r.referrer_id = u.id
group by u.id;

-- 3. Helper: resolve the logged-in realtor's own users.id from their auth
--    session. Mirrors is_admin() from the original schema.
create or replace function current_realtor_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from users where auth_id = auth.uid();
$$;

-- 4. Let a realtor read their own data — and only their own. Each policy
--    is additive alongside the existing admin ("is_admin()") policies, so
--    admins keep seeing everything and realtors see only rows that match
--    their own auth session.
create policy "Realtors can read their own user row"
  on users for select
  using (auth_id = auth.uid());

create policy "Realtors can read their own referrals"
  on referrals for select
  using (referrer_id = current_realtor_id());

create policy "Realtors can read their own referral links"
  on referral_links for select
  using (owner_id = current_realtor_id());

create policy "Realtors can read their own commission payments"
  on commission_payments for select
  using (user_id = current_realtor_id());
