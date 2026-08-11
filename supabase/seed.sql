-- ============================================================================
-- Optional demo data. Run after schema.sql if you want the dashboard to show
-- something before real registrations start coming in. Safe to skip in
-- production — delete these rows (or just don't run this file) once you're
-- ready to go live.
-- ============================================================================

with new_users as (
  insert into users (full_name, email, phone, referral_code, status, created_at)
  values
    ('Amara Chukwu', 'amara.chukwu@example.com', '+2348012340001', 'AMARA10', 'active', now() - interval '28 days'),
    ('Tobi Adeyemi', 'tobi.adeyemi@example.com', '+2348012340002', 'TOBI10', 'active', now() - interval '25 days'),
    ('Ifeoma Nwosu', 'ifeoma.nwosu@example.com', '+2348012340003', 'IFEOMA10', 'active', now() - interval '20 days'),
    ('Chidi Okafor', 'chidi.okafor@example.com', '+2348012340004', 'CHIDI10', 'active', now() - interval '17 days'),
    ('Bisi Lawal', 'bisi.lawal@example.com', '+2348012340005', 'BISI10', 'pending', now() - interval '9 days'),
    ('Femi Bakare', 'femi.bakare@example.com', '+2348012340006', 'FEMI10', 'active', now() - interval '4 days'),
    ('Zainab Musa', 'zainab.musa@example.com', '+2348012340007', 'ZAINAB10', 'active', now() - interval '1 days')
  returning id, referral_code
)
update users
set referred_by = (select id from new_users where referral_code = 'AMARA10')
where email in ('tobi.adeyemi@example.com', 'ifeoma.nwosu@example.com');

update users
set referred_by = (select id from users where referral_code = 'TOBI10')
where email in ('chidi.okafor@example.com', 'femi.bakare@example.com');

update users
set referred_by = (select id from users where referral_code = 'IFEOMA10')
where email = 'zainab.musa@example.com';

insert into referral_links (owner_id, code, label, clicks, created_at)
select id, referral_code || '-LINK1', 'Primary link', (random() * 40)::int, created_at
from users;

-- Level 1: the direct referrer earns the standard commission.
insert into referrals (referrer_id, referred_user_id, level, status, commission_amount, commission_status, created_at)
select
  referred_by,
  id,
  1,
  'completed',
  2500.00,
  case when random() > 0.5 then 'paid' else 'unpaid' end,
  created_at
from users
where referred_by is not null;

-- Level 2: if the direct referrer was themselves referred by someone, that
-- upline also earns — a smaller commission — from the same signup.
-- (In this seed data: Amara referred Tobi and Ifeoma, who each referred
-- others, so Amara picks up level-2 earnings here.)
insert into referrals (referrer_id, referred_user_id, level, status, commission_amount, commission_status, created_at)
select
  upline.referred_by,
  u.id,
  2,
  'completed',
  500.00,
  'unpaid',
  u.created_at
from users u
join users upline on upline.id = u.referred_by
where upline.referred_by is not null;

insert into referrals (referrer_id, referred_user_id, level, status, commission_amount, commission_status, created_at)
select id, null, 1, 'pending', 0, 'unpaid', now() - interval '2 days'
from users
where referral_code = 'BISI10';

insert into commission_payments (user_id, amount, method, reference, status, paid_at, created_at)
select referrer_id, commission_amount, 'Bank transfer', 'PAY-' || substr(id::text, 1, 8), 'paid', created_at + interval '3 days', created_at + interval '3 days'
from referrals
where commission_status = 'paid';
