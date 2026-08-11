'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createServiceRoleClient } from '@/lib/supabase/server';

export async function updateInquiryStatus(formData: FormData) {
  const inquiryId = String(formData.get('id') ?? '').trim();
  const status = String(formData.get('status') ?? 'new').trim();
  const transactionCompleted = formData.get('transaction_completed') === 'true';

  if (!inquiryId) {
    redirect('/admin/inquiries');
  }

  const supabase = createServiceRoleClient();
  const payload: Record<string, string | null> = { status };

  if (status === 'closed' && transactionCompleted) {
    payload.transaction_completed_at = new Date().toISOString();
  } else if (status === 'pending_transaction') {
    payload.transaction_completed_at = null;
  } else if (status === 'new' || status === 'contacted' || status === 'rejected') {
    payload.transaction_completed_at = null;
  }

  await supabase.from('inquiries').update(payload).eq('id', inquiryId);

  revalidatePath('/admin/inquiries');
  redirect('/admin/inquiries');
}
