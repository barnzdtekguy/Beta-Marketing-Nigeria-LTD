-- ============================================================================
-- Migration: real email verification at signup, and login lockout.
--
-- Run this in the SQL editor on a database that already has schema.sql
-- through 005_sales_payouts_announcements.sql applied.
--
-- Prerequisites handled in the Supabase dashboard, not here:
--   - Authentication -> Providers -> Email -> "Confirm email" is ON
--   - Authentication -> URL Configuration has the real Site URL and the
--     deployed origin listed under Redirect URLs
--   - Custom SMTP configured (Project Settings -> Auth -> SMTP Settings)
--   - The "Confirm signup" email template links to
--     {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Remember which trackable link (if any) a signup came through, so the
--    click-count increment still happens correctly once they confirm —
--    crediting now happens at /auth/confirm, a separate request from the
--    one that resolved this at registration time.
-- ----------------------------------------------------------------------------
alter table users
  add column if not exists signup_referral_link_id uuid references referral_links (id) on delete set null;

-- ----------------------------------------------------------------------------
-- 2. LOGIN ATTEMPTS
-- Shared by /login and /admin/login, keyed by email. Deliberately no RLS
-- policies at all: both reads and writes happen via the service-role
-- client before any session exists, so this stays fully unreachable from
-- the anon/authenticated roles regardless of who's asking.
-- ----------------------------------------------------------------------------
create table if not exists login_attempts (
  email text primary key,
  failed_count integer not null default 0,
  locked_until timestamptz,
  last_attempt_at timestamptz not null default now()
);

alter table login_attempts enable row level security;
