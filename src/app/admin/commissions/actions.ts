'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function approvePayout(formData: FormData) {
  const paymentId = String(formData.get('payment_id') ?? '');
  if (!paymentId) return;

  const supabase = createClient();
  const { error } = await supabase
    .from('commission_payments')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', paymentId);

  if (error) console.error('[approvePayout] update failed:', error.message);

  revalidatePath('/admin/commissions');
}

export async function rejectPayout(formData: FormData) {
  const paymentId = String(formData.get('payment_id') ?? '');
  if (!paymentId) return;

  const supabase = createClient();
  const { error } = await supabase.from('commission_payments').update({ status: 'failed' }).eq('id', paymentId);

  if (error) console.error('[rejectPayout] update failed:', error.message);

  revalidatePath('/admin/commissions');
}
