import type { createServiceRoleClient } from '@/lib/supabase/server';

// Commission paid at each level of the referral chain when someone new
// confirms their email. Index 0 = the direct referrer (level 1), index 1 =
// that referrer's own upline (level 2), and so on. To pay out a 3rd level
// too, just add another number — creditUplineCommissions() already walks
// as far up the chain as this array goes.
const COMMISSION_RATES = [2500, 500];

/**
 * Credits the direct referrer (level 1) and, if they were themselves
 * referred by someone, that upline too (level 2), and so on up the chain
 * — one row in `referrals` per level, each with its own commission amount.
 * Stops when either the chain runs out or COMMISSION_RATES does.
 *
 * Called from /auth/confirm once a new signup verifies their email — not
 * at registration time — so nobody can farm referral commission with an
 * email address they don't actually own.
 */
export async function creditUplineCommissions(
  supabase: ReturnType<typeof createServiceRoleClient>,
  directReferrerId: string,
  newUserId: string,
  directLinkId: string | null
) {
  let currentReferrerId: string | null = directReferrerId;
  let level = 1;

  while (currentReferrerId && level <= COMMISSION_RATES.length) {
    await supabase.from('referrals').insert({
      referrer_id: currentReferrerId,
      referred_user_id: newUserId,
      referral_link_id: level === 1 ? directLinkId : null,
      level,
      status: 'completed',
      commission_amount: COMMISSION_RATES[level - 1],
      commission_status: 'unpaid',
    });

    if (level === 1 && directLinkId) {
      const { data: linkRow } = await supabase
        .from('referral_links')
        .select('clicks')
        .eq('id', directLinkId)
        .single();
      await supabase
        .from('referral_links')
        .update({ clicks: (linkRow?.clicks ?? 0) + 1 })
        .eq('id', directLinkId);
    }

    const { data: referrerRow }: { data: { referred_by: string | null } | null } = await supabase
      .from('users')
      .select('referred_by')
      .eq('id', currentReferrerId)
      .single();

    currentReferrerId = referrerRow?.referred_by ?? null;
    level++;
  }
}
