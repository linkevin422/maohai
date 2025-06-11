// components/Bell.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types_db';
import { fetchUnreadCount, markAllRead } from '@/lib/notifications';
import { useText } from '@/lib/getText';

type RawNotif = {
  id: string;
  type: 'upvote' | 'reply';
  actor_id: string;
  post_id: string | null;
  created_at: string;
};

type Display = RawNotif & {
  actor_username: string | null;
  post_slug: string | null;
};

const PAGE = 12;                 // load 12 at a time

export default function BellMenu() {
  const supabase = createClientComponentClient<Database>();
  const { getText } = useText();

  const [unread, setUnread]       = useState(0);
  const [open, setOpen]           = useState(false);
  const [items, setItems]         = useState<Display[]>([]);
  const [loading, setLoading]     = useState(false);
  const [more, setMore]           = useState(true);   // has next page
  const pageRef                   = useRef(0);
  const sentinel                  = useRef<HTMLDivElement | null>(null);

  /* ───────── badge ───────── */
  useEffect(() => {
    fetchUnreadCount().then(setUnread).catch(console.error);
  }, []);

  /* ───────── load page ───────── */
  async function loadPage() {
    if (loading || !more) return;
    setLoading(true);

    const from = pageRef.current * PAGE;
    const to   = from + PAGE - 1;

    /* 1) raw notifications */
    const { data: notifs, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) { console.error(error); setLoading(false); return; }
    if (!notifs.length) { setMore(false); setLoading(false); return; }

    /* 2) usernames */
    const actorIds = Array.from(new Set(notifs.map(n => n.actor_id)));
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', actorIds);

    const names = Object.fromEntries((profiles ?? []).map(p => [p.id, p.username]));

    /* 3) slugs */
    const postIds = Array.from(new Set(notifs.map(n => n.post_id).filter(Boolean)));
    const { data: posts } = await supabase
      .from('forum_posts')
      .select('id, slug')
      .in('id', postIds);

    const slugs = Object.fromEntries((posts ?? []).map(p => [p.id, p.slug]));

    /* 4) merge */
    const merged: Display[] = notifs.map(n => ({
      ...n,
      actor_username: names[n.actor_id] ?? null,
      post_slug: n.post_id ? slugs[n.post_id] ?? null : null,
    }));

    setItems(prev => [...prev, ...merged]);
    pageRef.current += 1;
    setLoading(false);
  }

  /* ───────── infinite scroll observer ───────── */
  useEffect(() => {
    if (!open || !sentinel.current) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) loadPage(); },
      { root: sentinel.current.parentElement, threshold: 0.1 }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [open, sentinel.current]);

  /* ───────── toggle ───────── */
  async function toggle() {
    if (open) { setOpen(false); return; }

    setItems([]);      // reset list each open
    setMore(true);
    pageRef.current = 0;

    setOpen(true);
    await loadPage();       // first chunk
    if (items.length) { await markAllRead(); setUnread(0); }
  }

  /* ───────── render ───────── */
  return (
    <div className="relative">
      <button onClick={toggle} className="relative p-2">
        <Bell className="w-5 h-5" />
        {unread > 0 && (
  <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 text-xs font-bold bg-red-600 text-white rounded-full min-w-[18px] px-[6px] py-[1px] text-center shadow-sm">
    {unread}
  </span>
)}
      </button>

      {open && (
        <div
          className="
            absolute right-0 mt-2 w-80 max-h-96 sm:max-h-96
            bg-white text-sm shadow-xl rounded-xl z-40
            overflow-y-auto
            sm:w-80
            mobile:w-11/12   /* if you have a mobile breakpoint class */
          "
        >
          <ul className="divide-y">
            {items.map(n => {
              const href  = n.post_slug ? `/m/${n.post_slug}` : '/m';
              const label =
                 n.type === 'upvote'
                   ? getText('notif_upvote')
                   : n.type === 'reply'
                       ? getText('notif_reply')
                       : getText('notif_comment');              return (
                <li key={n.id} className="px-4 py-3 hover:bg-gray-50">
                  <Link href={href}>
                    <b>{n.actor_username ?? 'Someone'}</b> {label}
                  </Link>
                </li>
              );
            })}

            {!items.length && !loading && (
              <li className="px-4 py-6 text-center text-gray-400">
                {getText('notif_none')}
              </li>
            )}
            {loading && (
              <li className="px-4 py-6 text-center text-gray-500">
                {getText('notif_loading')}
              </li>
            )}
          </ul>
          {/* sentinel */}
          <div ref={sentinel} className="h-1" />
        </div>
      )}
    </div>
  );
}
