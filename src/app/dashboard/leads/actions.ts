'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentRealtor } from '@/lib/realtor-queries';
import type { PropertyType } from '@/lib/types';

const VALID_PROPERTY_TYPES: PropertyType[] = ['land', 'house', 'apartment', 'commercial', 'other'];

export async function submitLead(formData: FormData) {
  const realtor = await getCurrentRealtor();
  if (!realtor) redirect('/login');

  const clientName = String(formData.get('client_name') ?? '').trim();
  const clientPhone = String(formData.get('client_phone') ?? '').trim();
  const clientEmail = String(formData.get('client_email') ?? '').trim();
  const propertyType = String(formData.get('property_type') ?? '') as PropertyType;
  const propertyDetails = String(formData.get('property_details') ?? '').trim();

  if (!clientName || !clientPhone || !VALID_PROPERTY_TYPES.includes(propertyType)) {
    redirect(`/dashboard/leads?error=${encodeURIComponent('Client name, phone, and property type are required.')}`);
  }

  const supabase = createClient();
  const { error } = await supabase.from('client_leads').insert({
    realtor_id: realtor!.id,
    client_name: clientName,
    client_phone: clientPhone,
    client_email: clientEmail || null,
    property_type: propertyType,
    property_details: propertyDetails || null,
  });

  if (error) {
    console.error('[submitLead] insert failed:', error.message);
    redirect(`/dashboard/leads?error=${encodeURIComponent("Couldn't submit this client. Try again.")}`);
  }

  redirect(`/dashboard/leads?success=${encodeURIComponent('Client submitted. The admin will follow up.')}`);
}
