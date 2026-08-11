import { createServiceRoleClient } from '@/lib/supabase/server';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I, easier to read aloud

function randomSuffix(length = 4) {
  let out = '';
  for (let i = 0; i < length; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
}

function baseFromName(fullName: string) {
  const letters = fullName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  return (letters.slice(0, 5) || 'USER').padEnd(4, 'X');
}

/**
 * Generates a unique, shareable referral code for a new user, e.g. "MARYK-7QF2".
 * Retries on collision, then falls back to a fully random code.
 */
export async function generateUniqueReferralCode(fullName: string) {
  const supabase = createServiceRoleClient();
  const base = baseFromName(fullName);

  for (let attempt = 0; attempt < 6; attempt++) {
    const candidate = attempt < 5 ? `${base}-${randomSuffix()}` : randomSuffix(8);
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('referral_code', candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  // Extremely unlikely fallback if six attempts all collided.
  return `${randomSuffix(10)}`;
}
