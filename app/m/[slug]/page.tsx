'use client';

import { useEffect, useState, useRef } from 'react';
import {
  fetchPostBySlug,
  fetchComments,
  buildCommentTree,
  voteOnPost,
  Post,
  CommentNode,
} from '@/lib/forum';
import { zhTW, enUS } from 'date-fns/locale';
import { formatDistanceToNow } from 'date-fns';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { admins } from '@/lib/admins';

import Comment from '@/components/Comment';
import NewThreadReply from '@/components/NewThreadReply';

/*──────────────── types */
type Profile = { username: string | null };
type PostWithProfile = Post & { profiles: Profile };
type SortMode = 'newest' | 'top';

export default function ThreadPage() {
  /* context */
  const supabase = createClientComponentClient();
  const { lang } = useLanguage();
  const { getText } = useText();
  const locale = lang === 'zh-Hant' ? zhTW : enUS;
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  /* state */
  const [post, setPost]   = useState<PostWithProfile | null>(null);
  const [score, setScore] = useState(0);
  const [myVote, setMyVote] = useState<1 | -1 | 0>(0);
  const [tree, setTree]   = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);

  /* comment toggles */
  const [sortMode, setSortMode] = useState<SortMode>('top');

  /* admin menu */
  const [menuOpen, setMenuOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  /* close admin dropdown */
  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) =>
      menuRef.current && !menuRef.current.contains(e.target as Node) && setMenuOpen(false);
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [menuOpen]);

  /* fetch post + comments */
  useEffect(() => {
    (async () => {
      try {
        const p = await fetchPostBySlug(slug);
        setPost(p);
        setScore(p.score);

        const flat = await fetchComments(p.id);
        setTree(buildCommentTree(flat));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const uname = (user.user_metadata?.username as string | undefined) ?? '';
          setCanDelete(user.id === p.user_id || admins.includes(uname.toLowerCase()));
        }
        setLoading(false);
      } catch {
        router.push('/m');
      }
    })();
  }, [slug]);

  /* helper: reload comments without full refresh */
  const refreshTree = async () => {
    if (!post) return;
    const flat = await fetchComments(post.id);
    setTree(buildCommentTree(flat));
  };

  /* sort + filter view */
  const topLevel = [...tree].sort((a, b) => {
    if (sortMode === 'top') return b.score - a.score;
    return new Date(b.created_at).valueOf() - new Date(a.created_at).valueOf();
  });

  /* voting */
  const voting = async (val: 1 | -1) => {
    if (!post) return;
    const next = myVote === val ? 0 : val;
    await voteOnPost(post.id, next);
    setScore((s) => s - myVote + next);
    setMyVote(next);
  };

  /* delete post */
  const deletePost = async () => {
    if (!post) return;
    if (!confirm(getText('post_delete_confirm'))) return;
    await supabase.from('forum_posts')
      .update({ is_deleted: true, visible: false })
      .eq('id', post.id);
    router.push('/m');
  };

  if (loading || !post) return null;

  /*──────────────── render */
  return (
    <main className="w-full px-4 pt-8 pb-24 mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">

      {/* post card */}
      <article className="relative flex gap-4 p-6 mb-12 rounded-xl border border-zinc-200 bg-white shadow-sm">
        {/* vote column */}
        <div className="flex flex-col items-center select-none text-zinc-400">
          <button onClick={() => voting(1)}
            className={`p-1 hover:text-amber-500 ${myVote === 1 ? 'text-amber-500' : ''}`}>
            <ChevronUp size={24} />
          </button>
          <span className="text-sm font-medium">{score}</span>
          <button onClick={() => voting(-1)}
            className={`p-1 hover:text-blue-500 ${myVote === -1 ? 'text-blue-500' : ''}`}>
            <ChevronDown size={24} />
          </button>
        </div>

        {/* main column */}
        <div className="flex-1">
          {canDelete && (
            <div ref={menuRef} className="absolute top-4 right-4">
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-full hover:bg-zinc-100">
                <MoreHorizontal size={20} />
              </button>
              {menuOpen && (
                <div className="mt-2 w-40 bg-white border border-zinc-200 rounded-md shadow-lg">
                  <button onClick={deletePost}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-zinc-50">
                    {getText('delete_post_button')}
                  </button>
                </div>
              )}
            </div>
          )}

          <h1 className="text-xl sm:text-2xl font-bold text-zinc-800 break-words">
            {post.title}
          </h1>
          <div className="text-xs text-zinc-500 mt-2">
            {post.profiles?.username ?? getText('anonymous_user')} ·{' '}
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale })}
          </div>
          <div className="mt-4 whitespace-pre-wrap text-sm sm:text-base leading-relaxed text-zinc-800">
            {post.content}
          </div>
        </div>
      </article>

      {/* toggles */}
      <div className="flex flex-wrap gap-4 mb-4 text-xs sm:text-sm">

        {/* sort */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setSortMode('newest')}
            className={`px-3 py-1 rounded-full border ${
              sortMode === 'newest'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {getText('newest_toggle')}
          </button>
          <button
            onClick={() => setSortMode('top')}
            className={`px-3 py-1 rounded-full border ${
              sortMode === 'top'
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {getText('top_toggle')}
          </button>
        </div>
      </div>

      {/* count */}
      <h2 className="text-lg font-semibold mb-4 text-zinc-800">
        {post.reply_count} {getText('comments_label')}
      </h2>

      {/* add new comment */}
      <NewThreadReply postId={post.id} onAdded={refreshTree} />

{/* comment tree */}
<section className="mt-6 space-y-4">
  {topLevel.map((n: CommentNode) => (
    <Comment
      key={n.id}
      node={n}
      depth={0}
      postId={post.id}
      onAdded={refreshTree}
      showChildren={true}
    />
  ))}
</section>
    </main>
  );
}
