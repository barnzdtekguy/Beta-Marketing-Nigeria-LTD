'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function markLeadSuccessful(formData: FormData) {
  const leadId = String(formData.get('lead_id') ?? '');
  const commissionAmount = Number(formData.get('commission_amount') ?? 0);
  const notes = String(formData.get('admin_notes') ?? '').trim();

  if (!leadId || !Number.isFinite(commissionAmount) || commissionAmount <= 0) {
    redirect(`/admin/leads/${leadId}?error=${encodeURIComponent('Enter a valid commission amount.')}`);
  }

  const supabase = createClient();
  const { error } = await supabase
    .from('client_leads')
    .update({
      status: 'successful',
      commission_amount: commissionAmount,
      admin_notes: notes || null,
      decided_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) {
    console.error('[markLeadSuccessful] update failed:', error.message);
    redirect(`/admin/leads/${leadId}?error=${encodeURIComponent("Couldn't update this lead.")}`);
  }

  revalidatePath('/admin/leads');
  redirect(`/admin/leads/${leadId}?success=${encodeURIComponent('Marked as a successful sale.')}`);
}

export async function markLeadUnsuccessful(formData: FormData) {
  const leadId = String(formData.get('lead_id') ?? '');
  const notes = String(formData.get('admin_notes') ?? '').trim();

  if (!leadId) redirect('/admin/leads');

  const supabase = createClient();
  const { error } = await supabase
    .from('client_leads')
    .update({
      status: 'unsuccessful',
      admin_notes: notes || null,
      decided_at: new Date().toISOString(),
    })
    .eq('id', leadId);

  if (error) {
    console.error('[markLeadUnsuccessful] update failed:', error.message);
    redirect(`/admin/leads/${leadId}?error=${encodeURIComponent("Couldn't update this lead.")}`);
  }

  revalidatePath('/admin/leads');
  redirect(`/admin/leads/${leadId}?success=${encodeURIComponent('Marked as unsuccessful.')}`);
}
