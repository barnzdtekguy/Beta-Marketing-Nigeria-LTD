-- ============================================================================
-- Migration: buyer/investor inquiries + inquiry_type
--
-- Safe to run on any database that already has schema.sql through 003
-- applied — whether or not you already have the `inquiries` table. Uses
-- IF NOT EXISTS / DROP POLICY IF EXISTS throughout so it's also safe to
-- run more than once.
-- ============================================================================

-- 1. The inquiries table itself, in case it isn't live yet.
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

-- 2. In case the table already existed without this column (this is the
--    part that's new as of this migration).
alter table inquiries
  add column if not exists inquiry_type text not null default 'buyer';

alter table inquiries
  drop constraint if exists inquiries_inquiry_type_check;

alter table inquiries
  add constraint inquiries_inquiry_type_check check (inquiry_type in ('investor', 'buyer'));

create index if not exists idx_inquiries_type on inquiries (inquiry_type);
create index if not exists idx_inquiries_referred_by on inquiries (referred_by);
create index if not exists idx_inquiries_status on inquiries (status);
create index if not exists idx_inquiries_created_at on inquiries (created_at desc);

-- 3. RLS — admins see everything, realtors see only inquiries attributed
--    to them. DROP POLICY IF EXISTS first so this migration can be safely
--    re-run.
alter table inquiries enable row level security;

drop policy if exists "Admins can read all inquiries" on inquiries;
create policy "Admins can read all inquiries"
  on inquiries for select
  using (is_admin());

drop policy if exists "Admins can insert inquiries" on inquiries;
create policy "Admins can insert inquiries"
  on inquiries for insert
  with check (is_admin());

drop policy if exists "Admins can update inquiries" on inquiries;
create policy "Admins can update inquiries"
  on inquiries for update
  using (is_admin());

drop policy if exists "Realtors can read their own inquiries" on inquiries;
create policy "Realtors can read their own inquiries"
  on inquiries for select
  using (referred_by = current_realtor_id());
