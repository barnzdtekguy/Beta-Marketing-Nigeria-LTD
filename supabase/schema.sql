-- ============================================================================
-- Referral Registration System — Supabase schema
-- Run in the Supabase SQL editor, top to bottom, on a fresh project.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- ADMINS
-- One row per person allowed into the dashboard. Row is created by inviting
-- a Supabase Auth user, then linking their auth.users.id here.
-- ----------------------------------------------------------------------------
create table if not exists admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- USERS
-- Everyone who registers through the referral system. A user may optionally
-- have been referred by another user (referred_by). Each user gets exactly
-- one referral_code they can hand out.
-- ----------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  referral_code text not null unique,
  referred_by uuid references users (id) on delete set null,
  status text not null default 'active' check (status in ('active', 'inactive', 'pending')),
  auth_id uuid unique references auth.users (id) on delete set null, -- set once a realtor logs in via password
  created_at timestamptz not null default now()
);

create index if not exists idx_users_referred_by on users (referred_by);
create index if not exists idx_users_referral_code on users (referral_code);
create index if not exists idx_users_created_at on users (created_at desc);
create index if not exists idx_users_search on users using gin (
  to_tsvector('simple', coalesce(full_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, ''))
);

-- ----------------------------------------------------------------------------
-- REFERRAL LINKS
-- Trackable links issued to a user (a user may generate more than one, e.g.
-- for different campaigns). Not every issued link converts into a referral.
-- ----------------------------------------------------------------------------
create table if not exists referral_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users (id) on delete cascade,
  code text not null unique,
  label text,
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_referral_links_owner on referral_links (owner_id);

-- ----------------------------------------------------------------------------
-- REFERRALS
-- One row per (referrer, referred-person) pair. A single registration can
-- produce more than one row: the direct referrer gets a level-1 row, and
-- if that referrer was themselves referred by someone, that upline person
-- gets a level-2 row (smaller commission), and so on up the chain. This is
-- what lets an upline earn from people they never directly referred.
-- ----------------------------------------------------------------------------
create table if not exists referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references users (id) on delete cascade,
  referred_user_id uuid references users (id) on delete cascade,
  referral_link_id uuid references referral_links (id) on delete set null,
  level integer not null default 1 check (level >= 1), -- 1 = direct referral, 2 = referrer's upline, etc.
  status text not null default 'completed' check (status in ('pending', 'completed', 'rejected')),
  commission_amount numeric(12, 2) not null default 0,
  commission_status text not null default 'unpaid' check (commission_status in ('unpaid', 'paid', 'void')),
  created_at timestamptz not null default now(),
  unique (referrer_id, referred_user_id) -- one row per referrer per referred person, across all levels
);

create index if not exists idx_referrals_referrer on referrals (referrer_id);
create index if not exists idx_referrals_status on referrals (status);
create index if not exists idx_referrals_level on referrals (level);
create index if not exists idx_referrals_created_at on referrals (created_at desc);

-- ----------------------------------------------------------------------------
-- COMMISSION PAYMENTS
-- Payout batches/records against a user. commission_payments.amount is what
-- was actually paid out; referrals.commission_amount is what was earned.
-- Keeping them separate lets partial/batched payouts reconcile cleanly.
-- ----------------------------------------------------------------------------
create table if not exists commission_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  amount numeric(12, 2) not null,
  method text,
  reference text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_commission_payments_user on commission_payments (user_id);
create index if not exists idx_commission_payments_status on commission_payments (status);

-- ----------------------------------------------------------------------------
-- BUYER / INVESTOR INQUIRIES
-- Public forms are available on the landing page for buyers and investors who
-- may or may not have been referred by a realtor. Admins always see every
-- inquiry. Realtors only see inquiries tied to their own referral source.
-- A transaction must be completed before commission visibility is unlocked.
-- ----------------------------------------------------------------------------
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,
  request_details text not null,
  inquiry_type text not null default 'buyer' check (inquiry_type in ('investor', 'buyer')),
  referred_by uuid references users (id) on delete set null,
  source_ref_code text,
  status text not null default 'new' check (status in ('new', 'contacted', 'pending_transaction', 'closed', 'rejected')),
  transaction_completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_inquiries_type on inquiries (inquiry_type);

create index if not exists idx_inquiries_referred_by on inquiries (referred_by);
create index if not exists idx_inquiries_status on inquiries (status);
create index if not exists idx_inquiries_created_at on inquiries (created_at desc);

-- ----------------------------------------------------------------------------
-- Convenience view: per-user referral + commission summary, used all over
-- the dashboard (users table "# referrals" column, user detail page, etc)
-- and by realtors' own dashboard. Referral *counts* only count level-1
-- (direct) referrals — that's what "how many people has this person
-- personally referred" means. Commission *totals* sum every level, since
-- upline overrides are real earnings too.
--
-- security_invoker matters here: it makes RLS on the underlying tables
-- evaluate as the actual querying user (admin or realtor), not the view's
-- owner — without it, RLS on users/referrals could be bypassed through
-- this view once realtors have real login sessions.
-- ----------------------------------------------------------------------------
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

-- ============================================================================
-- ROW LEVEL SECURITY
-- Public registration (users/referrals inserts) happens via the service-role
-- key from a trusted server route, not directly from the browser. Two kinds
-- of authenticated sessions read this data: admins (see everything) and
-- realtors (see only their own rows, via their own login).
-- ============================================================================

alter table admins enable row level security;
alter table users enable row level security;
alter table referral_links enable row level security;
alter table referrals enable row level security;
alter table commission_payments enable row level security;
alter table inquiries enable row level security;

-- Helper: is the current auth session a known admin?
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (select 1 from admins where id = auth.uid());
$$;

-- Helper: resolve the logged-in realtor's own users.id from their auth
-- session (null if they're not a realtor, or haven't set up a password yet).
create or replace function current_realtor_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select id from users where auth_id = auth.uid();
$$;

create policy "Admins can read their own admin row"
  on admins for select
  using (id = auth.uid());

create policy "Admins can read all users"
  on users for select
  using (is_admin());

create policy "Admins can update users"
  on users for update
  using (is_admin());

create policy "Realtors can read their own user row"
  on users for select
  using (auth_id = auth.uid());

create policy "Admins can read all referral links"
  on referral_links for select
  using (is_admin());

create policy "Realtors can read their own referral links"
  on referral_links for select
  using (owner_id = current_realtor_id());

create policy "Admins can read all referrals"
  on referrals for select
  using (is_admin());

create policy "Admins can update referrals"
  on referrals for update
  using (is_admin());

create policy "Realtors can read their own referrals"
  on referrals for select
  using (referrer_id = current_realtor_id());

create policy "Admins can read commission payments"
  on commission_payments for select
  using (is_admin());

create policy "Admins can insert commission payments"
  on commission_payments for insert
  with check (is_admin());

create policy "Admins can update commission payments"
  on commission_payments for update
  using (is_admin());

create policy "Realtors can read their own commission payments"
  on commission_payments for select
  using (user_id = current_realtor_id());

create policy "Admins can read all inquiries"
  on inquiries for select
  using (is_admin());

create policy "Admins can insert inquiries"
  on inquiries for insert
  with check (is_admin());

create policy "Admins can update inquiries"
  on inquiries for update
  using (is_admin());

create policy "Realtors can read their own inquiries"
  on inquiries for select
  using (referred_by = current_realtor_id());

-- ============================================================================
-- Seed one admin manually after creating their auth user, e.g.:
--
--   insert into admins (id, email, full_name, role)
--   values ('<auth-user-uuid>', 'you@example.com', 'Your Name', 'superadmin');
-- ============================================================================
