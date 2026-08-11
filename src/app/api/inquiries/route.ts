import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

const ALLOWED_RETURN_PATHS = ['/investor', '/buyer', '/'];

export async function POST(request: Request) {
  const formData = await request.formData();
  const fullName = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const phone = String(formData.get('phone') ?? '').trim();
  const requestDetails = String(formData.get('request_details') ?? String(formData.get('message') ?? '')).trim();
  const ref = String(formData.get('ref') ?? '').trim();
  const inquiryTypeRaw = String(formData.get('inquiry_type') ?? '').trim();
  const inquiryType = inquiryTypeRaw === 'investor' ? 'investor' : 'buyer';

  // Redirect back to whichever page the form was actually on — not to
  // this route itself, which only handles POST and has no page to show.
  const requestedReturn = String(formData.get('redirect_to') ?? '');
  const returnPath = ALLOWED_RETURN_PATHS.includes(requestedReturn) ? requestedReturn : '/';
  const redirectUrl = new URL(returnPath, request.url);
  if (ref) redirectUrl.searchParams.set('ref', ref);

  if (!fullName || !email || !phone || !requestDetails) {
    redirectUrl.searchParams.set('inquiry_error', 'Please complete your name, phone, email, and message.');
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  const supabase = createServiceRoleClient();

  let referredBy: string | null = null;
  if (ref) {
    const { data: referralLink } = await supabase
      .from('referral_links')
      .select('owner_id')
      .eq('code', ref)
      .maybeSingle();

    if (referralLink?.owner_id) {
      referredBy = referralLink.owner_id;
    } else {
      const { data: referrer } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', ref)
        .maybeSingle();

      if (referrer?.id) referredBy = referrer.id;
    }
  }

  const { error } = await supabase.from('inquiries').insert({
    full_name: fullName,
    email,
    phone,
    request_details: requestDetails,
    inquiry_type: inquiryType,
    referred_by: referredBy,
    source_ref_code: ref || null,
    status: 'new',
    transaction_completed_at: null,
  });

  if (error) {
    console.error('[inquiries] insert failed:', error.message);
    redirectUrl.searchParams.set('inquiry_error', "Couldn't send your inquiry right now. Please try again.");
    return NextResponse.redirect(redirectUrl, { status: 303 });
  }

  redirectUrl.searchParams.delete('inquiry_error');
  redirectUrl.searchParams.set('inquiry', 'success');
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
