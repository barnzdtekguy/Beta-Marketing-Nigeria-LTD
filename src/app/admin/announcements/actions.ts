'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function postAnnouncement(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();

  if (!title || !body) {
    redirect(`/admin/announcements?error=${encodeURIComponent('Title and message are required.')}`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from('announcements').insert({
    admin_id: user?.id ?? null,
    title,
    body,
  });

  if (error) {
    console.error('[postAnnouncement] insert failed:', error.message);
    redirect(`/admin/announcements?error=${encodeURIComponent("Couldn't post this announcement.")}`);
  }

  revalidatePath('/admin/announcements');
  redirect(`/admin/announcements?success=${encodeURIComponent('Announcement sent to all realtors.')}`);
}
