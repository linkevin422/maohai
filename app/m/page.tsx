'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { fetchPosts, Post } from '@/lib/forum';
import PostCard from '@/components/PostCard';
import NewPostModal from '@/components/NewPostModal';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Profile = { username: string | null };
type SortKey = 'new' | 'top-week' | 'top-month' | 'top-all';

export default function ForumHomePage() {
  const supabase = createClientComponentClient();
  const [posts, setPosts] = useState<(Post & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [sort, setSort] = useState<SortKey>('new');
  const [showModal, setShowModal] = useState(false);
  const [query, setQuery] = useState('');
  const sentinel = useRef<HTMLDivElement | null>(null);

  /** 🔍 Filter posts locally as the user types (“insta-search”). */
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

  /** Initial load + when sort changes. */
  useEffect(() => {
    setPosts([]);
    setDone(false);
    loadMore(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  /** Infinite scroll. */
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

  const loadMore = async (cursor?: string | null, reset = false) => {
    setLoading(true);
    const last = reset ? null : cursor ?? getCursor();
    const batch = await fetchPosts({ sort, cursor: last ?? undefined });

    setPosts((prev) => {
      if (reset) return batch;
      const seen = new Set(prev.map((p) => p.id));
      const uniq = batch.filter((b) => !seen.has(b.id));
      return [...prev, ...uniq];
    });

    if (batch.length === 0) setDone(true);
    setLoading(false);
  };

  const getCursor = () => {
    if (posts.length === 0) return null;
    if (sort === 'new') return posts[posts.length - 1].created_at;
    return String(posts[posts.length - 1].score);
  };

  const openModal = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/register';
      return;
    }
    setShowModal(true);
  };

  return (
    <main className="w-full px-4 pt-8 mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
      {/* header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maohai Forum</h1>
        <button
          onClick={openModal}
          className="px-4 py-1 rounded-full bg-amber-500 hover:bg-amber-600"
        >
          New Post
        </button>
      </div>

      {/* sort tabs */}
      <div className="flex gap-4 mb-4 text-xs sm:text-sm flex-wrap">
        {(['new', 'top-week', 'top-month', 'top-all'] as SortKey[]).map((key) => (
          <button
            key={key}
            className={`px-3 py-1 rounded-full ${
              sort === key
                ? 'bg-amber-500 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => setSort(key)}
          >
            {label(key)}
          </button>
        ))}
      </div>

      {/* search bar */}
      <div className="mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search posts…"
          className="w-full px-4 py-2 rounded-full bg-white/10 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* post list */}
      <div className="flex flex-col gap-4">
        {filteredPosts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>

      {/* loading / sentinel */}
      {!done && (
        <div ref={sentinel} className="py-8 text-center text-neutral-400">
          {loading ? 'Loading…' : ''}
        </div>
      )}
      {done && posts.length === 0 && (
        <div className="py-12 text-center text-neutral-500">No posts yet.</div>
      )}
      {query && filteredPosts.length === 0 && (
        <div className="py-12 text-center text-neutral-500">No matches.</div>
      )}

      {/* modal */}
      <NewPostModal open={showModal} onClose={() => setShowModal(false)} />
    </main>
  );
}

function label(k: SortKey) {
  switch (k) {
    case 'new':
      return 'Newest';
    case 'top-week':
      return 'Top · Week';
    case 'top-month':
      return 'Top · Month';
    case 'top-all':
      return 'Top · All';
  }
}
