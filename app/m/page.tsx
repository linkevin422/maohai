'use client';

import {
  useEffect,
  useRef,
  useState,
  useMemo,
  MouseEvent as ReactMouseEvent,
} from 'react';
import { ChevronDown } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { fetchPosts, Post } from '@/lib/forum';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import PostCard from '@/components/PostCard';
import NewPostModal from '@/components/NewPostModal';

type Profile = { username: string | null };
type SortKey = 'new' | 'top-week' | 'top-month' | 'top-all';

export default function ForumHomePage() {
  /* ───────── hooks / context ───────── */
  const supabase = createClientComponentClient();
  const { lang } = useLanguage();
  const { getText } = useText();

  /* ───────── state ───────── */
  const [posts, setPosts] = useState<(Post & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sort, setSort] = useState<SortKey>('new');
  const [sortOpen, setSortOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');

  const sentinel = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  /* ───────── close dropdown on outside click ───────── */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ───────── filter posts (local search) ───────── */
  const filteredPosts = useMemo(() => {
    if (query.trim() === '') return posts;
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        (p.profiles?.username ?? '').toLowerCase().includes(q),
    );
  }, [posts, query]);

  /* ───────── initial load + sort change ───────── */
  useEffect(() => {
    setPosts([]);
    setDone(false);
    loadMore(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  /* ───────── infinite scroll ───────── */
  useEffect(() => {
    if (done) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) loadMore();
      },
      { rootMargin: '400px' },
    );
    if (sentinel.current) io.observe(sentinel.current);
    return () => io.disconnect();
  }, [loading, done]);

  /* ───────── fetch helpers ───────── */
  const loadMore = async (cursor?: string | null, reset = false) => {
    setLoading(true);
    const last = reset ? null : cursor ?? getCursor();
    const batch = await fetchPosts({ sort, cursor: last ?? undefined });

    setPosts((prev) => {
      if (reset) return batch;
      const seen = new Set(prev.map((p) => p.id));
      return [...prev, ...batch.filter((b) => !seen.has(b.id))];
    });

    if (batch.length === 0) setDone(true);
    setLoading(false);
  };

  const getCursor = () => {
    if (posts.length === 0) return null;
    if (sort === 'new') return posts[posts.length - 1].created_at;
    return String(posts[posts.length - 1].score);
  };

  /* ───────── modal launcher (auth check) ───────── */
  const openModal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/register';
      return;
    }
    setShowModal(true);
  };

  /* ───────── render ───────── */
  return (
<main className="w-full px-4 pt-8 pb-24 mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">      {/* header */}
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">{getText('forum_title')}</h1>        <button
          onClick={openModal}
          className="px-4 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white"
        >
          {getText('new_post')}
        </button>
      </div>

      {/* sort dropdown */}
      <div className="relative inline-block mb-6 z-10" ref={dropdownRef}>
        <button
          onClick={() => setSortOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-300 shadow-sm hover:bg-zinc-50 text-sm text-zinc-700"
        >
          {getText(labelKey(sort))}
          <ChevronDown size={16} />
        </button>

        {sortOpen && (
          <div className="absolute mt-2 w-44 rounded-lg bg-white shadow-lg border border-zinc-200 overflow-hidden">
            {(['new', 'top-week', 'top-month', 'top-all'] as SortKey[]).map(
              (key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSort(key);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                    sort === key
                      ? 'bg-amber-50 font-semibold text-amber-700'
                      : 'text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {getText(labelKey(key))}
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {/* search bar */}
{/* search bar */}
<div className="mb-8">
  <div className="relative">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={getText('m_search_placeholder')}
      className="
        peer w-full pl-12 pr-4 py-2 rounded-full
        bg-white border border-zinc-300 shadow-sm
        placeholder-zinc-500 text-sm
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500
        transition
      "
    />
    <svg
      className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 peer-focus:text-amber-500 transition"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  </div>
</div>

      {/* post list */}
      <div className="flex flex-col gap-4">
        {filteredPosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {/* loading / sentinel */}
      {!done && (
        <div ref={sentinel} className="py-8 text-center text-zinc-400">
          {loading ? getText('loading') : ''}
        </div>
      )}
      {done && posts.length === 0 && (
        <div className="py-12 text-center text-zinc-500">
          {getText('no_posts')}
        </div>
      )}
      {query && filteredPosts.length === 0 && (
        <div className="py-12 text-center text-zinc-500">
          {getText('no_matches')}
        </div>
      )}

      {/* modal */}
      <NewPostModal open={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
}

/* ───────── label helper returns gettext key ───────── */
function labelKey(k: SortKey): string {
  switch (k) {
    case 'new':
      return 'm_sort_newest';
    case 'top-week':
      return 'm_sort_top_week';
    case 'top-month':
      return 'm_sort_top_month';
    case 'top-all':
      return 'm_sort_top_all';
  }
}
