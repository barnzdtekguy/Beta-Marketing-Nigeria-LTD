# Beta Marketing — Realtor Referral Program

A realtor referral platform for Beta Marketing Nigeria Limited, built with
Next.js 14 (App Router) and Supabase. Realtors register with a password,
get their own referral link, and can log back in anytime to see their own
referrals and commission — including earnings from their own downline's
referrals. Admins get a full dashboard to manage it all.

Verified: `npm run build` and `tsc --noEmit` both pass clean.

## Routes

| Route | Who it's for | Auth |
|---|---|---|
| `/` | Realtors — landing page + registration form | Public |
| `/register` | Old link format — redirects to `/` | Public |
| `/register/success` | Shows a new realtor their referral code/link | Public |
| `/login` | Realtor sign-in | Public (the login page itself) |
| `/dashboard` | A realtor's own referrals, downline earnings, and referral link | Requires a `users` row linked to their login |
| `/admin/login` | Staff sign-in | Public (the login page itself) |
| `/admin`, `/admin/users`, `/admin/referrals`, `/admin/commissions` | Admin dashboard | Requires an `admins` row |

The home page is the front door on purpose — realtors are the primary
audience. Admin access is a small "Admin sign in" link at the bottom of
that page and lives entirely under `/admin`. There's no public admin
*signup* — that's intentional: letting anyone create an admin account
would defeat the point of restricting the dashboard. New admins are added
manually (see Setup below), same as before.

Realtor accounts and admin accounts are deliberately kept apart even
though both use Supabase Auth under the hood: `/admin/*` checks the
`admins` table, `/dashboard` checks a `users` row with a matching
`auth_id`. A realtor session can never reach `/admin`, and an admin
session can never reach `/dashboard`, regardless of which one they're
signed into.

## What's included

- **Public registration** (`/`) — realtors sign up with name, email,
  phone, and a password. If they arrive via `?ref=<code>` (either a
  realtor's own referral code or a trackable issued link's code), the
  signup gets attributed automatically: commission is credited **up the
  whole referral chain** (direct referrer + their upline — see
  "Multi-level commissions" below), and if it came through an issued
  link, that link's click count increments. On success they land on
  `/register/success`, showing them their own referral code and
  shareable link — already signed in, so "Go to your dashboard" works
  immediately.
- **Realtor dashboard** (`/login`, `/dashboard`) — realtors can log back
  in anytime with the password they set to see their own referral link,
  who they've directly referred, and (if applicable) commission earned
  from their downline's own referrals. RLS ensures a realtor can only
  ever see rows tied to their own account — see "Realtor accounts &
  security" below for how that's enforced.
- **Auth-gated admin area** (`/admin/*`) — Supabase Auth (email/password)
  + an `admins` allowlist table. Middleware protects everything under
  `/admin` (except the login page) and the export API routes, and
  bounces signed-in-but-not-admin users back out with an explanation.
- **Overview** — total realtors, total referral links, completed
  referrals, total commission earned, and a 30-day registrations chart.
- **Users** — searchable/filterable table (name, email, phone, referral
  code, referred by, referral count, registration date, status), each
  row links to a detail page.
- **User detail** — direct referrals under "People they've referred";
  commission earned from their downline's own referrals shown separately
  under "Earnings from their network."
- **Referrals** — every issued link and the referrals it produced, with
  a Direct/Override level filter and commission columns.
- **Commissions** — earned / paid / outstanding totals and a payment
  ledger (`commission_payments`).
- **Export** — CSV and Excel, on the Users and Referrals pages. Pulls the
  *full* filtered result set via a server route, not just the visible
  page.
- **Clean schema** — `users`, `referral_links`, `referrals`,
  `commission_payments`, `admins`, all in `supabase/schema.sql` with
  indexes, constraints, and row-level security.
- **Brand** — logo and colors pulled from Beta Marketing's own mark
  (`public/logo-icon.png`, `public/logo-full.png`, both transparent PNGs
  cropped from the uploaded logo). Primary red is `#EB3137` — see
  `tailwind.config.ts`. Status colors (active/paid = green, pending =
  amber, rejected = muted red) are kept deliberately separate from the
  brand red so they don't compete visually with buttons and links.

## Stack

Next.js 14 (App Router, Server Components, Server Actions) · TypeScript ·
Tailwind CSS · Supabase (Postgres + Auth + RLS) · Recharts · `xlsx` for
exports.

## Setup

### 1. Create the Supabase project and schema

**New project:**
1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run `supabase/schema.sql` top to bottom.
3. Optional: run `supabase/seed.sql` afterward for demo data so the
   dashboard isn't empty on first load.

**Already have this project running?** `schema.sql` has everything for a
fresh install, but if you set this up before realtor accounts existed,
run `supabase/migrations/003_realtor_accounts.sql` once in the SQL
editor instead of the full schema — it adds what's new without touching
your existing data. (If you're not sure whether you've run
`002_multi_level_referrals.sql` either, run both, in order — they're
safe to run more than once.)

### 2. Create your first admin

1. In Supabase, go to **Authentication → Users → Add user** and create
   yourself an account (email + password).
2. Copy that user's UUID, then run in the SQL editor:

   ```sql
   insert into admins (id, email, full_name, role)
   values ('<paste-uuid-here>', 'you@example.com', 'Your Name', 'superadmin');
   ```

   Only rows in `admins` can sign into `/admin` — creating a Supabase
   Auth user alone isn't enough, by design.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from Project Settings → API. The service role
key is server-only — never sent to the browser — **and registration
depends entirely on it being correct**. If signup silently fails, this
is the first thing to check (see "Troubleshooting signup" below).

### 4. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` — that's the realtor registration page.
Admin sign-in is at `http://localhost:3000/admin/login`.

## Troubleshooting signup

If registering on `/` doesn't work, check your terminal (where
`npm run dev` is running) right after a failed attempt — the server
action now logs the real Supabase error there:

```
[registerUser] email lookup failed: ...
[registerUser] insert failed: ...
```

The most common cause by far: `SUPABASE_SERVICE_ROLE_KEY` in
`.env.local` is missing, still the placeholder text, or has the *anon*
key pasted into it by mistake. Registration uses the service role client
specifically so it can write to `users`/`referrals` without needing a
logged-in session — if that key is wrong, every signup will fail the
same way. Double check it's the `service_role` **secret** key from
Supabase Settings → API, not the `anon` `public` one.

## How registration writes into this schema

The registration form on `/` calls a Server Action
(`src/app/register/actions.ts`) that uses the service role client
(`createServiceRoleClient()` in `src/lib/supabase/server.ts`) to:

1. Check the email isn't already registered.
2. Generate a unique `referral_code` for the new realtor.
3. Resolve `?ref=<code>` against `referral_links.code` first, then
   `users.referral_code`, to find who referred them (if anyone).
4. Create their Supabase Auth account (`auth.admin.createUser`, service
   role only — email auto-confirmed since this is a direct signup, not
   an email-verification flow).
5. Insert the `users` row, linked to that auth account via `auth_id`. If
   this insert fails, the auth account just created gets rolled back so
   retrying with the same email works.
6. Credit commission up the referral chain (see "Multi-level
   commissions" below) and increment the issued link's `clicks` if one
   was used.
7. Sign them in immediately (sets a real session cookie), so "Go to your
   dashboard" on the success page works without asking them to log in
   again right after they just set a password.

Keeping steps 1–6 behind the service role (rather than opening RLS
insert policies to the public) means the admin-facing tables stay
exactly as trustworthy as this one endpoint, and nothing else. Share
`https://yourapp.com/?ref=THEIR-CODE` for an attributed link — every
registered realtor gets their own code shown on the success page.

Registering creates both a `users` row *and* a real Supabase Auth
account — but that account is only ever recognized by `/dashboard`
(realtor area), never by `/admin`. Only rows you manually add to
`admins` can authenticate into the admin dashboard, regardless of
whether that email also has a realtor account.

## Realtor accounts & security

Once realtors have real login sessions, the important question is: can
realtor A ever see realtor B's data? The answer needs to be no, and it's
enforced at the database level (RLS), not just by what the UI happens to
query for — so it holds even if someone calls the Supabase API directly.

- `users.auth_id` links a realtor's `users` row to their Supabase Auth
  account. A `current_realtor_id()` SQL helper resolves "who is asking"
  from that link, mirroring the existing `is_admin()` helper.
- Every table a realtor can read (`users`, `referrals`,
  `referral_links`, `commission_payments`) has a policy scoped to
  `current_realtor_id()` — a realtor only ever sees rows tied to their
  own account. Admins keep their existing "see everything" policies
  alongside these; the two don't interfere.
- The `user_referral_stats` view is created `with (security_invoker =
  true)`. Without this, Postgres can evaluate RLS using the *view
  owner's* permissions instead of the actual logged-in user's — which
  would mean querying that view could expose every realtor's stats, not
  just the caller's own, regardless of the policies above. This is
  covered by `002` for fresh installs but is *also* re-applied in `003`
  as a hardening fix, since it matters a lot more now that realtors have
  real sessions than it did when only admins could authenticate at all.
- Middleware (`src/lib/supabase/middleware.ts`) checks `/admin/*`
  against the `admins` table and `/dashboard` against `users.auth_id`
  independently — a realtor session fails the admin check and vice
  versa, so neither can wander into the other's area even before RLS
  gets involved.

## Multi-level commissions

When someone registers through a referral link, the direct referrer
earns a commission — and if *that* referrer was themselves referred by
someone, that person (their "upline") earns a smaller commission too,
and so on up the chain. This is handled by `creditUplineCommissions()`
in `src/app/register/actions.ts`, which walks `users.referred_by`
upward and writes one `referrals` row per level:

```ts
// Level 1 = direct referrer, level 2 = their upline, etc.
// Add a third number to pay out a level-3 override too.
const COMMISSION_RATES = [2500, 500];
```

Each level gets its own row in `referrals` (`level` column), so nothing
about direct referrals changes — `referred_by` on `users` still only
ever points at the actual direct referrer, and the Users table's
"Referrals" column and "People referred" stat only count level-1 rows.
Commission *totals* (Overview, Commissions page, `user_referral_stats`)
sum every level, since override earnings are real earnings.

On a user's detail page, direct referrals show under "People they've
referred"; earnings from their downline's own referrals show separately
under "Earnings from their network," so it's clear which naira came from
whom. On the admin Referrals page, use the level filter (Direct /
Override) to see just one or the other.

If you already ran `schema.sql` before this feature existed, run
`supabase/migrations/002_multi_level_referrals.sql` once against your
database — it adds the `level` column and updates the constraint/view
without touching any data you already have.

## Extending it

- **Copy**: the hero copy on `/` and the three benefit bullets
  (`BENEFITS` array in `src/app/page.tsx`) are placeholder text — swap
  in Beta Marketing's actual voice/offer.
- **Real photo background**: the login/home hero currently uses an
  original SVG (skyline + grid + glow) so nothing depends on a hotlinked
  stock photo. To use an actual licensed real-estate photo instead, drop
  it in `public/` (e.g. `public/hero.jpg`) and add a
  `background-image: url(/hero.jpg)` layer to the relevant page — happy
  to wire this in properly if you have a photo you want used.
- **Types**: `src/lib/types.ts` is hand-written to match the schema.
  Once linked to the Supabase CLI, replace it with generated types
  (`npx supabase gen types typescript --project-id <ref> --schema
  public`) for full end-to-end type safety on queries.
- **Roles**: `admins.role` already distinguishes `admin` / `superadmin`
  — gate destructive actions (e.g. marking commissions paid) behind
  `role === 'superadmin'` wherever you add them.
- **Commission payouts**: the Commissions page currently just lists
  payment records. Marking a referral's commission as paid (and writing
  the matching `commission_payments` row) is a natural next Server
  Action to add.
- **Charts**: `src/components/charts/registrations-chart.tsx` is
  self-contained — duplicate it for a referrals-over-time or
  commission-over-time view using the same bucketing pattern in
  `getRegistrationsOverTime`.

## Deployment

Works as-is on Vercel: connect the repo, set the three env vars from
`.env.local.example` in the project settings, deploy. Any Node.js host
that supports Next.js 14 works too.

## Project structure

```
src/
  app/
    page.tsx                   # home — landing intro + registration form
    register/                  # /register redirects to "/"; success page lives here
    login/                      # realtor sign-in
    dashboard/                   # realtor's own referrals/earnings, self-service
    admin/
      login/                    # admin sign-in
      layout.tsx                # sidebar shell for everything below
      page.tsx                  # overview
      users/                    # table + [id] detail
      referrals/
      commissions/
    api/export/                 # full-result-set CSV/Excel data routes
    auth/signout/                # shared by both login areas, redirect target varies
  components/
    logo.tsx                    # brand logo (icon / full lockup)
    tech-real-estate-backdrop.tsx  # original SVG hero background
    sidebar.tsx, topbar.tsx, ...   # dashboard chrome, tables, charts
  lib/
    supabase/                   # browser/server/middleware clients
    queries.ts                  # admin data-fetching, one place
    realtor-queries.ts           # realtor's own-data-only fetching
    export.ts                   # CSV/Excel generation
    referral.ts                 # unique referral code generation
    types.ts                    # schema-matching TS types
  middleware.ts                 # route protection — admin vs realtor vs public
public/
  logo-icon.png                 # cropped brand mark, transparent bg
  logo-full.png                 # full lockup (mark + wordmark), transparent bg
supabase/
  schema.sql                    # tables, indexes, RLS
  seed.sql                      # optional demo data
  migrations/
    002_multi_level_referrals.sql  # run once if you set up before this feature
    003_realtor_accounts.sql       # run once if you set up before this feature
```
#   B e t a - M a r k e t i n g - N i g e r i a - L T D  
 