-- ============================================================================
-- Migration: multi-level referral commissions
--
-- Run this in the SQL editor on a database that already has schema.sql
-- applied (i.e. you've already created tables and possibly run seed.sql).
-- It's additive and safe to run once — it does not drop or lose any
-- existing users, referrals, or admin setup.
--
-- What it does: lets an "upline" (the person who referred your referrer)
-- also earn a smaller commission when someone joins through their
-- downline's link — not just the direct referrer.
-- ============================================================================

-- 1. Add the level column. 1 = direct referral, 2 = referrer's upline, etc.
--    Every existing row is a direct referral, so defaulting to 1 is correct
--    for data you already have.
alter table referrals
  add column if not exists level integer not null default 1 check (level >= 1);

-- 2. Drop the old "one row per referred person" rule...
alter table referrals
  drop constraint if exists referrals_referred_user_id_key;

-- 3. ...replace it with "one row per (referrer, referred person)" — this is
--    what allows both the direct referrer AND their upline to each have
--    their own row for the same referred person.
alter table referrals
  add constraint referrals_referrer_referred_unique unique (referrer_id, referred_user_id);

-- 4. Helpful index for filtering the referrals page by level.
create index if not exists idx_referrals_level on referrals (level);

-- 5. Refresh the stats view: referral *counts* stay direct-only (level 1),
--    but commission *totals* now correctly include upline earnings too.
create or replace view user_referral_stats as
select
  u.id as user_id,
  count(r.id) filter (where r.status = 'completed' and r.level = 1) as completed_referrals,
  count(r.id) filter (where r.status = 'pending' and r.level = 1) as pending_referrals,
  coalesce(sum(r.commission_amount) filter (where r.status = 'completed'), 0) as commission_earned,
  coalesce(sum(r.commission_amount) filter (where r.commission_status = 'unpaid' and r.status = 'completed'), 0) as commission_unpaid
from users u
left join referrals r on r.referrer_id = u.id
group by u.id;
