// lib/notifications.ts
'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types_db';

const supabase = createClientComponentClient<Database>();

export async function fetchUnreadCount() {
  const { data, error } = await supabase
    .from('vw_notification_unread_count')
    .select('unread')
    .single();                       // row-level RLS already filters by auth.uid()
  if (error && error.code !== 'PGRST116') throw error;
  return data?.unread ?? 0;
}

export async function fetchNotifications(limit = 10) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, actor:profiles(username)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function markAllRead() {
  const { error } = await supabase.rpc('rpc_mark_notifications_read');
  if (error) throw error;
}
