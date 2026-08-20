// Hand-written types mirroring supabase/schema.sql.
// Once the project is linked, swap this for generated types with:
//   npx supabase gen types typescript --project-id <ref> --schema public > src/lib/types.ts
// and update imports to pull `Database` from that file instead.

export type UserStatus = 'active' | 'inactive' | 'pending';
export type ReferralStatus = 'pending' | 'completed' | 'rejected';
export type CommissionStatus = 'unpaid' | 'paid' | 'void';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type AdminRole = 'admin' | 'superadmin';
export type LeadStatus = 'pending' | 'successful' | 'unsuccessful';
export type PropertyType = 'land' | 'house' | 'apartment' | 'commercial' | 'other';

export interface AdminRow {
  id: string;
  email: string;
  full_name: string | null;
  role: AdminRole;
  created_at: string;
}

export interface UserRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  referral_code: string;
  referred_by: string | null;
  status: UserStatus;
  auth_id: string | null;
  created_at: string;
}

export interface ReferralLinkRow {
  id: string;
  owner_id: string;
  code: string;
  label: string | null;
  clicks: number;
  created_at: string;
}

export interface ReferralRow {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referral_link_id: string | null;
  level: number;
  status: ReferralStatus;
  commission_amount: number;
  commission_status: CommissionStatus;
  created_at: string;
}

export interface CommissionPaymentRow {
  id: string;
  user_id: string;
  amount: number;
  method: string | null;
  reference: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  lead_id: string | null;
  bank_name: string | null;
  account_number: string | null;
  account_name: string | null;
}

export interface ClientLeadRow {
  id: string;
  realtor_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  property_type: PropertyType;
  property_details: string | null;
  status: LeadStatus;
  commission_amount: number | null;
  admin_notes: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface AnnouncementRow {
  id: string;
  admin_id: string | null;
  title: string;
  body: string;
  created_at: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'pending_transaction' | 'closed' | 'rejected';

export interface InquiryRow {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  request_details: string;
  referred_by: string | null;
  source_ref_code: string | null;
  status: InquiryStatus;
  transaction_completed_at: string | null;
  created_at: string;
}

export interface UserReferralStats {
  user_id: string;
  completed_referrals: number;
  pending_referrals: number;
  commission_earned: number;
  commission_unpaid: number;
}

// Composite shapes used by the UI layer.
export interface UserWithStats extends UserRow {
  referred_by_name: string | null;
  stats: UserReferralStats;
}

export interface ReferralWithNames extends ReferralRow {
  referrer_name: string;
  referred_user_name: string | null;
}

// Minimal Database generic so `@supabase/ssr` typed clients compile without
// the full generated schema. Replace with `supabase gen types` output for
// end-to-end type safety on queries and mutations.
// Intentional escape hatch until generated Supabase types replace this file.
export type Database = any;
