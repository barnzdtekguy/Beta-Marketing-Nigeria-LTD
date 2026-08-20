-- ============================================================================
-- Migration: client sales pipeline, per-sale payout applications, and
-- admin-to-realtor announcements.
--
-- Run this in the SQL editor on a database that already has schema.sql
-- through 004_inquiries.sql applied. Additive and safe to run once.
--
-- What it adds:
--   1. `client_leads` — a realtor submits a prospective buyer they're
--      personally bringing in (name, phone, email, kind of property).
--      Distinct from `inquiries` (public buyer/investor contact-form
--      leads, not necessarily tied to a specific realtor's own client):
--      these are realtor-initiated, and admin reviews each one and marks
--      the sale successful (entering the commission amount for that
--      specific deal) or unsuccessful.
--   2. Bank/payout columns on the existing `commission_payments` table,
--      plus a `lead_id` link — applying for payout happens per successful
--      sale, not as one lump aggregate request. Referral-bonus commissions
--      can still be paid out through the same table with lead_id left null.
--   3. `announcements` — admin broadcasts shown to every realtor.
--
-- Realtor identity here follows 003_realtor_accounts.sql: a realtor's
-- session is auth.uid(), but their `users.id` is looked up via
-- current_realtor_id() (users.auth_id = auth.uid()) — client_leads and
-- commission_payments both key off users.id, so RLS policies below use
-- current_realtor_id(), not auth.uid() directly.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CLIENT LEADS
-- ----------------------------------------------------------------------------
create table if not exists client_leads (
  id uuid primary key default gen_random_uuid(),
  realtor_id uuid not null references users (id) on delete cascade,
  client_name text not null,
  client_phone text not null,
  client_email text,
  property_type text not null check (property_type in ('land', 'house', 'apartment', 'commercial', 'other')),
  property_details text,
  status text not null default 'pending' check (status in ('pending', 'successful', 'unsuccessful')),
  commission_amount numeric(12, 2),
  admin_notes text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_leads_realtor on client_leads (realtor_id);
create index if not exists idx_client_leads_status on client_leads (status);
create index if not exists idx_client_leads_created_at on client_leads (created_at desc);

alter table client_leads enable row level security;

create policy "Admins can read all leads"
  on client_leads for select
  using (is_admin());

create policy "Admins can update leads"
  on client_leads for update
  using (is_admin());

create policy "Realtors can read own leads"
  on client_leads for select
  using (realtor_id = current_realtor_id());

create policy "Realtors can submit own leads"
  on client_leads for insert
  with check (realtor_id = current_realtor_id());

-- ----------------------------------------------------------------------------
-- 2. PAYOUT APPLICATIONS
-- One application per sale: the partial unique index blocks a realtor from
-- applying twice for the same lead.
-- ----------------------------------------------------------------------------
alter table commission_payments
  add column if not exists lead_id uuid references client_leads (id) on delete set null,
  add column if not exists bank_name text,
  add column if not exists account_number text,
  add column if not exists account_name text;

create unique index if not exists idx_commission_payments_lead_unique
  on commission_payments (lead_id)
  where lead_id is not null;

create policy "Realtors can apply for their own payouts"
  on commission_payments for insert
  with check (user_id = current_realtor_id());

-- ----------------------------------------------------------------------------
-- 3. ANNOUNCEMENTS
-- ----------------------------------------------------------------------------
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references admins (id) on delete set null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_announcements_created_at on announcements (created_at desc);

alter table announcements enable row level security;

create policy "Any signed-in user can read announcements"
  on announcements for select
  using (auth.uid() is not null);

create policy "Admins can post announcements"
  on announcements for insert
  with check (is_admin());
